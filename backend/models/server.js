const express = require('express');
require('dotenv').config();
const cors = require('cors');
const fileupload = require('express-fileupload');
const passport = require('passport');
const session = require('express-session');
const http = require('http');
const socketIo = require('socket.io');
const { Chess } = require('chess.js');
const { ChessWebAPI } = require('chess-web-api');
const { dbConnection } = require('../controllers/database');

class Server {
    constructor() {
        this.app = express();
        this.server = http.createServer(this.app);
        this.io = socketIo(this.server, { 
            cors: {
                origin: process.env.CHESSMY_FRONT,
                methods: ['GET', 'POST']
            }
        });
        
        this.chessAPI = new ChessWebAPI();
        this.app.use(express.static('../public/index.html'));
        this.port = process.env.PORT || 8080;
        this.conectarDB();
        this.app.use(express.json());
        this.admin = '/api/admin';  
        
        //sesion passport 
        this.app.use(session({ secret: 'cats'}));
        this.app.use(passport.initialize());
        this.app.use(passport.session());
        this.routes();
        this.middlwares();
        
        this.configureSockets();
    }

    middlwares() {
        this.app.use(cors({
            origin: [
                process.env.CHESSMY_FRONT, 
                'http://localhost:5173'
            ],
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            credentials: true,
        }));
        
        this.app.use(cors());
        this.app.use(express.static('public'));
        this.app.use(fileupload({
            useTempFiles: true,
            templateUrl: '/temp/',
        }));
    }
    
    async conectarDB() {
        await dbConnection();
    }

    routes(){
        this.app.use(this.admin, require('../routes/admin.routes'));
    }

    configureSockets() {
        const games = {};
        const classrooms = {};
        const customGames = {};

        function generateGameCode() {
            const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
            let code = '';
            for (let i = 0; i < 6; i++) {
                code += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return code;
        }

        function startTurnTimer(gameId) {
            const game = games[gameId];
            if (!game) return;

            const currentTurn = game.board.turn();
            game.turnStartTime = Date.now();

            if (game.activeTimer) {
                clearInterval(game.activeTimer);
            }

            gameNamespace.to(gameId).emit("updateClocks", game.clocks);

            game.activeTimer = setInterval(() => {
                const now = Date.now();
                const elapsed = Math.floor((now - game.turnStartTime) / 1000);
                game.turnStartTime = now;
                
                game.clocks[currentTurn] = Math.max(0, game.clocks[currentTurn] - elapsed);
                
                gameNamespace.to(gameId).emit("updateClocks", game.clocks);

                if (game.clocks[currentTurn] <= 0) {
                    clearInterval(game.activeTimer);
                    const winner = currentTurn === "w" ? "b" : "w";
                    gameNamespace.to(gameId).emit("gameOver", {
                        winner,
                        reason: "Tiempo agotado"
                    });
                    delete games[gameId];
                }
            }, 1000);
        }

        // Función para evaluar movimientos con chess-web-api
        async function evaluateMove(fen, move) {
            try {
                // Primero evaluamos con reglas básicas
                let evaluation = '';
                const tempGame = new Chess(fen);
                const result = tempGame.move(move);

                // Verificar si es captura
                if (result.captured) {
                    evaluation += 'x';
                    // Captura de pieza de mayor valor
                    if (result.piece.toLowerCase() === 'p' && result.captured.toLowerCase() !== 'p') {
                        evaluation += '!';
                    }
                }

                // Verificar jaque
                if (tempGame.isCheck()) {
                    evaluation += '+';
                }

                // Verificar jaque mate
                if (tempGame.isCheckmate()) {
                    evaluation += '#';
                }

                // Luego hacemos una evaluación más avanzada con chess-web-api
                const analysis = await this.chessAPI.getMoveEvaluation(fen, move.san);
                
                if (analysis && analysis.eval) {
                    const score = analysis.eval.score;
                    if (score) {
                        const value = score.value;
                        if (value > 150) evaluation += '!!';
                        else if (value > 50) evaluation += '!';
                        else if (value < -150) evaluation += '??';
                        else if (value < -50) evaluation += '?';
                    }
                }

                return evaluation;
            } catch (error) {
                console.error("Error en evaluateMove:", error);
                return '';
            }
        }

        // Namespaces
        const gameNamespace = this.io.of('/game');
        const classroomNamespace = this.io.of('/classroom');

        gameNamespace.on('connection', (socket) => {
            console.log(`Nuevo jugador conectado (1vs1): ${socket.id}`);
            
            socket.on('reconnect', (attempt) => {
                console.log(`Jugador reconectado: ${socket.id} (intento ${attempt})`);
            });

            socket.on("createCustomGame", ({ timeControl, preferredColor }, callback) => {
                try {
                    let gameCode;
                    do {
                        gameCode = generateGameCode();
                    } while (customGames[gameCode]);
                    
                    customGames[gameCode] = {
                        gameCode,
                        creator: socket.id,
                        timeControl,
                        playerColor: preferredColor === 'random' ? 
                            (Math.random() > 0.5 ? 'w' : 'b') : 
                            (preferredColor === 'white' ? 'w' : 'b'),
                        status: 'waiting',
                        createdAt: Date.now()
                    };
                    
                    socket.join(gameCode);
                    socket.emit("customGameCreated", { gameCode });
                    callback({ success: true });
                } catch (error) {
                    console.error("Error en createCustomGame:", error);
                    callback({ success: false, error: "Error al crear partida" });
                }
            });

            socket.on("joinCustomGame", ({ gameCode }, callback) => {
                try {
                    const customGame = customGames[gameCode];
                    
                    if (!customGame) {
                        return callback({ success: false, error: "Código de partida inválido" });
                    }
                    
                    if (customGame.status !== 'waiting') {
                        return callback({ success: false, error: "La partida ya comenzó" });
                    }
                    
                    const creatorColor = customGame.playerColor;
                    const joinerColor = creatorColor === 'w' ? 'b' : 'w';
                    
                    const gameId = `game_${Date.now()}`;
                    
                    games[gameId] = {
                        board: new Chess(),
                        players: [
                            { id: customGame.creator, preferredColor: creatorColor === 'w' ? 'white' : 'black' },
                            { id: socket.id, preferredColor: joinerColor === 'w' ? 'white' : 'black' }
                        ],
                        clocks: { 
                            w: customGame.timeControl * 60, 
                            b: customGame.timeControl * 60 
                        },
                        moves: [],
                        activeTimer: null,
                        turnStartTime: null,
                        status: "ongoing",
                        timeControl: customGame.timeControl
                    };
                    
                    socket.join(gameId);
                    gameNamespace.to(customGame.creator).socketsJoin(gameId);
                    
                    gameNamespace.to(customGame.creator).emit("customGameJoined", {
                        gameId,
                        playerColor: creatorColor,
                        clocks: games[gameId].clocks,
                        status: "¡Juego iniciado! Es tu turno",
                        gameStarted: true
                    });
                    
                    socket.emit("customGameJoined", {
                        gameId,
                        playerColor: joinerColor,
                        clocks: games[gameId].clocks,
                        status: "¡Juego iniciado! Esperando turno...",
                        gameStarted: true
                    });
                    
                    startTurnTimer(gameId);
                    delete customGames[gameCode];
                    
                    callback({ success: true });
                } catch (error) {
                    console.error("Error en joinCustomGame:", error);
                    callback({ success: false, error: "Error al unirse a partida" });
                }
            });

            socket.on("searchGame", ({ timeControl, preferredColor }, callback) => {
                try {
                    const availableGame = Object.keys(games).find(id => {
                        const game = games[id];
                        return game.players.length < 2 && 
                               !game.players.some(p => p.id === socket.id) &&
                               game.status === "waiting" &&
                               game.timeControl === timeControl &&
                               (game.preferredColor === 'random' || 
                                game.preferredColor !== preferredColor ||
                                preferredColor === 'random');
                    });

                    if (availableGame) {
                        const game = games[availableGame];
                        const playerColor = game.players[0].preferredColor === 'random' ? 
                                           (Math.random() > 0.5 ? 'w' : 'b') :
                                           (game.players[0].preferredColor === 'white' ? 'b' : 'w');
                        
                        game.players.push({
                            id: socket.id,
                            preferredColor
                        });
                        game.status = "ongoing";
                        socket.join(availableGame);
                        
                        socket.emit("gameJoined", { 
                            gameId: availableGame, 
                            playerColor,
                            status: "Oponente encontrado. ¡Juego iniciado!",
                            fen: game.board.fen(),
                            clocks: game.clocks,
                            gameStarted: true
                        });
                        
                        gameNamespace.to(game.players[0].id).emit("opponentJoined", {
                            gameId: availableGame,
                            fen: game.board.fen(),
                            clocks: game.clocks,
                            gameStarted: true
                        });
                        
                        if (game.players.length === 2) {
                            startTurnTimer(availableGame);
                        }
                        
                        callback({ success: true });
                    } else {
                        const gameId = `game_${Date.now()}`;
                        
                        games[gameId] = {
                            board: new Chess(),
                            players: [{
                                id: socket.id,
                                preferredColor
                            }],
                            clocks: { 
                                w: timeControl * 60, 
                                b: timeControl * 60 
                            },
                            moves: [],
                            activeTimer: null,
                            turnStartTime: null,
                            status: "waiting",
                            timeControl,
                            preferredColor
                        };
                        
                        socket.join(gameId);
                        socket.emit("gameJoined", { 
                            gameId, 
                            playerColor: preferredColor === 'black' ? 'b' : 'w',
                            status: "Esperando oponente...",
                            fen: "start",
                            clocks: games[gameId].clocks,
                            gameStarted: false
                        });
                        
                        callback({ success: true });
                        
                        setTimeout(() => {
                            if (games[gameId]?.players.length === 1) {
                                socket.emit("matchmakingTimeout");
                                delete games[gameId];
                            }
                        }, 120000);
                    }
                } catch (error) {
                    console.error("Error en searchGame:", error);
                    callback({ success: false, error: "Error al buscar partida" });
                }
            });

            socket.on("surrender", ({ gameId }, callback) => {
                const game = games[gameId];
                if (!game || !game.players.some(p => p.id === socket.id)) {
                    callback({ success: false, error: "Partida no encontrada" });
                    return;
                }

                const playerIndex = game.players.findIndex(p => p.id === socket.id);
                const winnerColor = playerIndex === 0 ? 
                    (game.players[1]?.preferredColor === 'white' ? 'w' : 'b') : 
                    (game.players[0]?.preferredColor === 'white' ? 'w' : 'b');

                gameNamespace.to(gameId).emit("gameOver", {
                    winner: winnerColor,
                    reason: "Rendición"
                });

                if (game.activeTimer) {
                    clearInterval(game.activeTimer);
                }
                delete games[gameId];

                callback({ success: true });
            });

            socket.on("move", async ({ gameId, move }) => {
                const game = games[gameId];
                if (!game || !game.players.some(p => p.id === socket.id)) return;

                try {
                    const result = game.board.move(move);
                    if (!result) {
                        socket.emit("invalidMove", { reason: "Movimiento inválido" });
                        return;
                    }

                    // Evaluar el movimiento
                    const evaluation = await evaluateMove(game.board.fen(), result);
                    result.evaluation = evaluation;
                    
                    game.moves.push(result);
                    
                    const now = Date.now();
                    const elapsed = Math.floor((now - game.turnStartTime) / 1000);
                    const currentTurn = game.board.turn() === "w" ? "b" : "w";
                    game.clocks[currentTurn] = Math.max(0, game.clocks[currentTurn] - elapsed);
                    game.turnStartTime = now;

                    gameNamespace.to(gameId).emit("moveMade", {
                        fen: game.board.fen(),
                        move: result,
                        clocks: game.clocks,
                        moveSan: result.san + evaluation
                    });

                    if (game.board.isGameOver()) {
                        let winner, reason;
                        
                        if (game.board.isCheckmate()) {
                            winner = game.board.turn() === "w" ? "b" : "w";
                            reason = "Jaque mate";
                        } else if (game.board.isDraw()) {
                            winner = "draw";
                            reason = "Empate";
                        } else {
                            reason = "Juego terminado";
                        }

                        gameNamespace.to(gameId).emit("gameOver", { winner, reason });
                        delete games[gameId];
                        return;
                    }

                    startTurnTimer(gameId);
                } catch (error) {
                    socket.emit("invalidMove", { reason: error.message });
                }
            });

            socket.on("disconnect", () => {
                console.log(`Jugador desconectado (1vs1): ${socket.id}`);
                
                for (const code in customGames) {
                    if (customGames[code].creator === socket.id) {
                        delete customGames[code];
                    }
                }
                
                for (const gameId in games) {
                    const game = games[gameId];
                    game.players = game.players.filter(player => player.id !== socket.id);
                    
                    if (game.players.length === 0) {
                        if (game.activeTimer) {
                            clearInterval(game.activeTimer);
                        }
                        delete games[gameId];
                    } else {
                        gameNamespace.to(gameId).emit("opponentDisconnected");
                    }
                }
            });
        });

        classroomNamespace.on('connection', (socket) => {
            console.log("Nuevo usuario conectado (aula):", socket.id);

            socket.on("identify", (userType) => {
                socket.userType = userType;
                console.log(`Usuario identificado como: ${userType}`);
            });

            socket.on("startGame", (roomCode) => {
                if (socket.userType !== "professor") {
                    socket.emit("error", "Solo profesores pueden crear salas");
                    return;
                }
            
                classrooms[roomCode] = {
                    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
                    professor: socket.id,
                    students: []
                };
                socket.join(roomCode);
                console.log("Profesor creó sala:", roomCode);
                socket.emit("classroomStarted", { roomCode });
            });

            socket.on("updatePosition", (fen) => {
                const roomCode = Object.keys(classrooms).find(code =>
                    classrooms[code].professor === socket.id
                );
                
                if (roomCode) {
                    classrooms[roomCode].fen = fen;
                    classroomNamespace.to(roomCode).emit("updateBoard", fen);
                }
            });

            socket.on("joinProfessorRoom", (roomCode) => {
                if (!classrooms[roomCode]) {
                    socket.emit("error", "Sala no encontrada");
                    return;
                }

                if (socket.userType !== "student") {
                    socket.emit("error", "Solo alumnos pueden unirse a salas");
                    return;
                }

                classrooms[roomCode].students.push(socket.id);
                socket.join(roomCode);
                socket.emit("classroomJoined", {
                    position: classrooms[roomCode].fen
                });
                console.log("Alumno se unió a sala:", roomCode);
            });

            socket.on("disconnect", () => {
                console.log("Usuario desconectado (aula):", socket.id);
                
                for (const roomCode in classrooms) {
                    if (classrooms[roomCode].professor === socket.id) {
                        classroomNamespace.to(roomCode).emit("classroomClosed");
                        delete classrooms[roomCode];
                    } else {
                        classrooms[roomCode].students = classrooms[roomCode].students.filter(
                            id => id !== socket.id
                        );
                    }
                }
            });
        });
    }

    listen() {
        this.server.listen(this.port, () => {
            console.log('Servidor escuchando en puerto:', this.port);
        });
    }
}

module.exports = Server;
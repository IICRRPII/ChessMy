const express = require('express');
require('dotenv').config();
const cors = require('cors');
const fileupload = require('express-fileupload');
const passport = require('passport');
const session = require('express-session');
const http = require('http');
const socketIo = require('socket.io');
const { Chess } = require('chess.js');
const { dbConnection } = require('../controllers/database');

class Server {
    ////////////////////////
    //////////////////////
    ///////////////////////
    /*
    constructor() {
        this.app = express();
        this.server = http.createServer(this.app);
        this.io = socketIo(this.server, { 
            cors: {
                //origin: `http://localhost:5173`,
                origin: process.env.CHESSMY_FRONT,
                methods: ['GET', 'POST'],
                allowedHeaders: ['Content-Type', 'Authorization'], // Headers permitidos
                credentials: true,
            }
        });
        
       // this.app.use(express.static('../public/index.html'));
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
            //origin: 'http://localhost:5173',
            origin: [
                process.env.CHESSMY_FRONT, 
                'http://localhost:5173'
            ],
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            allowedHeaders: ['Content-Type'],
           // allowedHeaders: ['Content-Type', 'Authorization'], // Headers permitidos
            credentials: true,
        }));
        
       //this.app.use(cors());
        this.app.use(express.static('public'));
        this.app.use(fileupload({
            useTempFiles: true,
            templateUrl: '/temp/',
        }));
        
    }

    /*
    ////////////////////////
    ///////////////////////
    ///////////////////////
    */


    constructor() {
        this.app = express();
        this.server = http.createServer(this.app);

        this.io = socketIo(this.server, { 
            cors: {
                //origin: "http://localhost:5173",
                origin: process.env.CHESSMY_FRONT,
                methods: ['GET', 'POST'],
                allowedHeaders: ['Content-Type', 'Authorization'], // Headers permitidos
                credentials: true,
            }
        });
        
        this.port = process.env.PORT || 8080;

        this.conectarDB();

        this.app.use(express.json());

        this.middlwares(); //cambio          
        
        //sesion passport 
        this.app.use(session({ 
            secret: 'cats',
            resave: false,
            saveUninitialized: true,
            cookie: { secure: true } // Cambiar a true en producción con HTTPS
        }));
        this.app.use(passport.initialize());
        this.app.use(passport.session());
        
        this.admin = '/api/admin';
        this.routes();
        
        this.configureSockets();
    }

    // Middleware para log de solicitudes

    middlwares() {
        const allowedOrigins = [
            process.env.CHESSMY_FRONT, 
            'http://localhost:5173'
        ];

        const corsOptions = {
            origin: function (origin, callback) {
                // Permitir solicitudes sin origen (como mobile apps o curl)
                if (!origin) return callback(null, true);
                
                if (allowedOrigins.indexOf(origin) !== -1) {
                    callback(null, true);
                } else {
                    callback(new Error('Not allowed by CORS'));
                }
            },
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
            credentials: true,
            optionsSuccessStatus: 204
        };
        
        // Usar CORS solo una vez
        this.app.use(cors(corsOptions));
    }

    async conectarDB() {
      //  console.log('Entrando a dbCOn');
        await dbConnection();
    }

    routes(){
        this.app.use(this.admin, require('../routes/admin.routes'));
    }

    configureSockets() {
        const games = {};  // Partidas 1vs1
        const classrooms = {};  // Modo profesor-alumno
        const customGames = {}; // Partidas personalizadas por código

        // Función para generar códigos únicos
        function generateGameCode() {
            const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
            let code = '';
            for (let i = 0; i < 6; i++) {
                code += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return code;
        }

        // Función para el temporizador en partidas 1vs1
        function startTurnTimer(gameId) {
            const game = games[gameId];
            if (!game) return;

            const currentTurn = game.board.turn();
            game.turnStartTime = Date.now();

            if (game.activeTimer) {
                clearInterval(game.activeTimer);
            }

            // Enviar actualización inmediata
            gameNamespace.to(gameId).emit("updateClocks", game.clocks);

            game.activeTimer = setInterval(() => {
                const now = Date.now();
                const elapsed = Math.floor((now - game.turnStartTime) / 1000);
                game.turnStartTime = now;
                
                game.clocks[currentTurn] = Math.max(0, game.clocks[currentTurn] - elapsed);
                
                // Enviar actualización cada segundo
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

        // Namespaces
        const gameNamespace = this.io.of('/game');
        const classroomNamespace = this.io.of('/classroom');

        // MODO 1vs1
        gameNamespace.on('connection', (socket) => {
            console.log(`Nuevo jugador conectado (1vs1): ${socket.id}`);
            
            // Manejar reconexiones
            socket.on('reconnect', (attempt) => {
                console.log(`Jugador reconectado: ${socket.id} (intento ${attempt})`);
            });

            // Crear partida personalizada
            socket.on("createCustomGame", ({ timeControl, preferredColor }, callback) => {
                try {
                    // Generar código único
                    let gameCode;
                    do {
                        gameCode = generateGameCode();
                    } while (customGames[gameCode]);
                    
                    // Crear la partida
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

            // Unirse a partida personalizada
            socket.on("joinCustomGame", ({ gameCode }, callback) => {
                try {
                    const customGame = customGames[gameCode];
                    
                    if (!customGame) {
                        return callback({ success: false, error: "Código de partida inválido" });
                    }
                    
                    if (customGame.status !== 'waiting') {
                        return callback({ success: false, error: "La partida ya comenzó" });
                    }
                    
                    // Asignar colores
                    const creatorColor = customGame.playerColor;
                    const joinerColor = creatorColor === 'w' ? 'b' : 'w';
                    
                    // Crear la partida real
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
                    
                    // Unir a ambos jugadores a la sala de juego
                    socket.join(gameId);
                    gameNamespace.to(customGame.creator).socketsJoin(gameId);
                    
                    // Notificar a ambos jugadores
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
                    
                    // Iniciar temporizador
                    startTurnTimer(gameId);
                    
                    // Eliminar partida personalizada
                    delete customGames[gameCode];
                    
                    callback({ success: true });
                } catch (error) {
                    console.error("Error en joinCustomGame:", error);
                    callback({ success: false, error: "Error al unirse a partida" });
                }
            });

            // Buscar o crear partida con preferencias (matchmaking)
            socket.on("searchGame", ({ timeControl, preferredColor }, callback) => {
                try {
                    // Buscar partida compatible
                    const availableGame = Object.keys(games).find(id => {
                        const game = games[id];
                        return game.players.length < 2 && 
                               !game.players.some(p => p.id === socket.id) &&
                               game.status === "waiting" &&
                               game.timeControl === timeControl;
                    });
            
                    if (availableGame) {
                        const game = games[availableGame];
                        const existingPlayer = game.players[0];
                        
                        // Determinar color para el nuevo jugador
                        let playerColor;
                        
                        if (preferredColor === 'white') {
                            if (existingPlayer.preferredColor === 'white') {
                                // Conflicto: ambos quieren blancas -> forzar negras al nuevo
                                playerColor = 'b';
                            } else {
                                playerColor = 'w';
                            }
                        } else if (preferredColor === 'black') {
                            if (existingPlayer.preferredColor === 'black') {
                                // Conflicto: ambos quieren negras -> forzar blancas al nuevo
                                playerColor = 'w';
                            } else {
                                playerColor = 'b';
                            }
                        } else { // 'random'
                            // Por defecto, el que se une es negro (el creador es blanco)
                            playerColor = 'b';
                            
                            // A menos que el creador quiera ser negro
                            if (existingPlayer.preferredColor === 'black') {
                                playerColor = 'w';
                            }
                        }
                        
                        // Asignar color al jugador existente si es necesario
                        if (existingPlayer.color === undefined) {
                            existingPlayer.color = playerColor === 'w' ? 'b' : 'w';
                        }
                        
                        // Añadir nuevo jugador
                        game.players.push({
                            id: socket.id,
                            preferredColor,
                            color: playerColor
                        });
                        
                        game.status = "ongoing";
                        socket.join(availableGame);
                        
                        // Notificar a nuevo jugador
                        socket.emit("gameJoined", { 
                            gameId: availableGame, 
                            playerColor,
                            status: "Oponente encontrado. ¡Juego iniciado!",
                            fen: game.board.fen(),
                            clocks: game.clocks,
                            gameStarted: true
                        });
                        
                        // Notificar al jugador existente con su color real
                        gameNamespace.to(existingPlayer.id).emit("opponentJoined", {
                            gameId: availableGame,
                            playerColor: existingPlayer.color,
                            fen: game.board.fen(),
                            clocks: game.clocks,
                            gameStarted: true
                        });
                        
                        // Iniciar temporizador
                        startTurnTimer(availableGame);
                        
                        callback({ success: true });
                    } else {
                        // Crear nueva partida
                        const gameId = `game_${Date.now()}`;
                        
                        // Por defecto, el creador es blanco
                        let initialColor = 'w';
                        
                        // A menos que específicamente quiera ser negro
                        if (preferredColor === 'black') {
                            initialColor = 'b';
                        }
                        
                        games[gameId] = {
                            board: new Chess(),
                            players: [{
                                id: socket.id,
                                preferredColor,
                                color: initialColor
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
                            playerColor: initialColor,
                            status: "Esperando oponente...",
                            fen: "start",
                            clocks: games[gameId].clocks,
                            gameStarted: false
                        });
                        
                        callback({ success: true });
                        
                        // Limpieza después de 2 minutos si no se une nadie
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
            
            

            // Manejar rendición
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
                    reason: "Rendición",
                    reset: true // Nueva propiedad para indicar reinicio
                });
            
                if (game.activeTimer) {
                    clearInterval(game.activeTimer);
                }
                delete games[gameId];
            
                callback({ success: true });
            });

            // Manejar movimiento de pieza
            socket.on("move", ({ gameId, move }) => {
                const game = games[gameId];
                if (!game || !game.players.some(p => p.id === socket.id)) return;

                try {
                    // Validar y aplicar movimiento usando el objeto completo
                    const result = game.board.move(move);
                    if (!result) {
                        socket.emit("invalidMove", { reason: "Movimiento inválido" });
                        return;
                    }

                    // Actualizar estado del juego
                    game.moves.push(result);
                    
                    // Actualizar reloj
                    const now = Date.now();
                    const elapsed = Math.floor((now - game.turnStartTime) / 1000);
                    const currentTurn = game.board.turn() === "w" ? "b" : "w";
                    game.clocks[currentTurn] = Math.max(0, game.clocks[currentTurn] - elapsed);
                    game.turnStartTime = now;

                    // Notificar a ambos jugadores con el FEN actualizado
                    gameNamespace.to(gameId).emit("moveMade", {
                        fen: game.board.fen(),
                        move: result,
                        clocks: game.clocks,
                        moveSan: result.san
                    });

                    // Verificar fin del juego
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

                    // Cambiar turno
                    startTurnTimer(gameId);
                } catch (error) {
                    socket.emit("invalidMove", { reason: error.message });
                }
            });

            // Desconexión
            socket.on("disconnect", () => {
                console.log(`Jugador desconectado (1vs1): ${socket.id}`);
                
                // Limpiar partidas personalizadas
                for (const code in customGames) {
                    if (customGames[code].creator === socket.id) {
                        delete customGames[code];
                    }
                }
                
                // Limpiar partidas normales
                for (const gameId in games) {
                    const game = games[gameId];
                    game.players = game.players.filter(player => player.id !== socket.id);
                    
                    if (game.players.length === 0) {
                        // Eliminar partida si no hay jugadores
                        if (game.activeTimer) {
                            clearInterval(game.activeTimer);
                        }
                        delete games[gameId];
                    } else {
                        // Notificar al otro jugador
                        gameNamespace.to(gameId).emit("opponentDisconnected");
                    }
                }
            });
        });

        // MODO PROFESOR-ALUMNO (mantener igual)
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
const express = require('express');
const cors = require('cors');
const fileupload = require('express-fileupload');
const passport = require('passport');
const session = require('express-session');
const http = require('http'); // Nuevo: Para Socket.IO
const socketIo = require('socket.io'); // Nuevo
const { Chess } = require('chess.js'); // Nuevo
const { dbConnection } = require('../controllers/database');

class Server {
    constructor() {
        this.app = express();
        this.server = http.createServer(this.app);
        this.io = socketIo(this.server, { 
            cors: {
                origin: 'http://localhost:5173',
                methods: ['GET', 'POST']
            }
        });
        
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
            origin: 'http://localhost:5173',
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            credentials: true,
        }));
        
        this.app.use(express.static('public'));
        this.app.use(fileupload({
            useTempFiles: true,
            templateUrl: '/temp/',
        }));
    }
    
    async conectarDB() {
        console.log('Entrando a dbCOn');
        await dbConnection();
    }

    routes(){
        this.app.use(this.admin, require('../routes/admin.routes'));
    }

    configureSockets() {
        const games = {};  // Partidas 1vs1
        const classrooms = {};  // Modo profesor-alumno

        // Namespaces
        const gameNamespace = this.io.of('/game');
        const classroomNamespace = this.io.of('/classroom');

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

        // MODO 1vs1
        gameNamespace.on('connection', (socket) => {
            console.log(`Nuevo jugador conectado (1vs1): ${socket.id}`);
            
            // Manejar reconexiones
            socket.on('reconnect', (attempt) => {
            console.log(`Jugador reconectado: ${socket.id} (intento ${attempt})`);
            });
        
            socket.on('disconnect', (reason) => {
            console.log(`Jugador desconectado: ${socket.id} (razón: ${reason})`);
            });
        
            // Unirse a partida existente o crear nueva
            socket.on("joinGame", (callback) => {
            try {
                // Buscar partida disponible
                const availableGame = Object.keys(games).find(id => {
                return games[id].players.length < 2 && 
                        !games[id].players.includes(socket.id) &&
                        games[id].status === "waiting";
                });
        
                if (availableGame) {
                const game = games[availableGame];
                const playerColor = "b";
                
                game.players.push(socket.id);
                game.status = "ongoing";
                socket.join(availableGame);
                
                // Notificar a ambos jugadores
                socket.emit("gameJoined", { 
                    gameId: availableGame, 
                    playerColor,
                    status: "Oponente encontrado. ¡Juego iniciado!",
                    fen: game.board.fen(),
                    clocks: game.clocks
                });
                
                // Notificar al primer jugador
                gameNamespace.to(game.players[0]).emit("opponentJoined", {
                    gameId: availableGame,
                    fen: game.board.fen(),
                    clocks: game.clocks,
                    gameStarted: true // Añadir este campo
                });
                
                // Iniciar temporizador SOLO cuando ambos jugadores están presentes
                if (game.players.length === 2) {
                    startTurnTimer(availableGame);
                }
                
                if (typeof callback === 'function') {
                    callback({ success: true });
                }
                } else {
                // Crear nueva partida
                const gameId = `game_${Date.now()}`;
                const playerColor = "w";
                
                games[gameId] = {
                    board: new Chess(),
                    players: [socket.id],
                    clocks: { w: 3600, b: 3600 },
                    moves: [],
                    activeTimer: null,
                    turnStartTime: null,
                    status: "waiting",
                    gameStarted: false // Nuevo campo para rastrear si el juego realmente comenzó
                };
                
                socket.join(gameId);
                socket.emit("gameJoined", { 
                    gameId, 
                    playerColor,
                    status: "Esperando oponente...",
                    fen: "start",
                    clocks: games[gameId].clocks
                });
                
                if (typeof callback === 'function') {
                    callback({ success: true });
                }
                
                // Limpieza después de 2 minutos si no se une nadie
                setTimeout(() => {
                    if (games[gameId]?.players.length === 1) {
                    socket.emit("matchmakingTimeout");
                    delete games[gameId];
                    }
                }, 120000);
                }
            } catch (error) {
                console.error("Error en joinGame:", error);
                if (typeof callback === 'function') {
                callback({ success: false, error: "Error al unirse al juego" });
                }
            }
            });

        // Manejar movimiento de pieza
        socket.on("move", ({ gameId, move }) => {
            const game = games[gameId];
            if (!game || !game.players.includes(socket.id)) return;
        
            try {
            // Validar y aplicar movimiento usando el objeto completo
            const result = game.board.move(move);
            if (!result) {
                socket.emit("invalidMove", { reason: "Movimiento inválido" });
                return;
            }
        
            // Actualizar estado del juego
            game.moves.push(result);
            updateClock(gameId);
        
            // Notificar a ambos jugadores con el FEN actualizado
            gameNamespace.to(gameId).emit("moveMade", {
                fen: game.board.fen(),
                move: result, // Enviamos el objeto de movimiento completo
                clocks: game.clocks,
                moveSan: result.san // Añadimos el SAN directamente
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

        // Actualizar reloj
        function updateClock(gameId) {
            const game = games[gameId];
            if (!game) return;

            const currentTurn = game.board.turn();
            const now = Date.now();
            const elapsed = Math.floor((now - game.turnStartTime) / 1000);
            
            game.clocks[currentTurn] = Math.max(0, game.clocks[currentTurn] - elapsed);
            game.turnStartTime = now;
        }

        // Desconexión
        socket.on("disconnect", () => {
            console.log(`Jugador desconectado (1vs1): ${socket.id}`);
            
            for (const gameId in games) {
            const game = games[gameId];
            game.players = game.players.filter(id => id !== socket.id);
            
            if (game.players.length === 0) {
                // Eliminar partida si no hay jugadores
                clearInterval(game.activeTimer);
                delete games[gameId];
            } else {
                // Notificar al otro jugador
                gameNamespace.to(gameId).emit("opponentDisconnected");
            }
            }
        });
        });
        // MODO PROFESOR-ALUMNO
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
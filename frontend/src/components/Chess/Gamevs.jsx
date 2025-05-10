import React, { useEffect, useRef, useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { io } from "socket.io-client";
import "./Gamevs.css";
import Navbar from "../Navbar/Navbar";

// Importar las imágenes de las piezas
import wP from './assets/pieces/wP.png';
import wN from './assets/pieces/wN.png';
import wB from './assets/pieces/wB.png';
import wR from './assets/pieces/wR.png';
import wQ from './assets/pieces/wQ.png';
import wK from './assets/pieces/wK.png';
import bP from './assets/pieces/bP.png';
import bN from './assets/pieces/bN.png';
import bB from './assets/pieces/bB.png';
import bR from './assets/pieces/bR.png';
import bQ from './assets/pieces/bQ.png';
import bK from './assets/pieces/bK.png';

export default function Gamevs() {
    const game = useRef(new Chess());
    const [gameId, setGameId] = useState(null);
    const [playerColor, setPlayerColor] = useState(null);
    const [fen, setFen] = useState("start");
    const [moves, setMoves] = useState([]);
    const [clocks, setClocks] = useState({ w: 3600, b: 3600 });
    const [alert, setAlert] = useState("");
    const [legalMoves, setLegalMoves] = useState([]);
    const socket = useRef(null);
    const [gameStatus, setGameStatus] = useState("Conectando al servidor...");
    const [gameStarted, setGameStarted] = useState(false);
    const [boardTheme, setBoardTheme] = useState("red");
    const [boardSize, setBoardSize] = useState(Math.min(window.innerWidth - 40, 600));
    const [timeControl, setTimeControl] = useState(10); // 10 minutos por defecto
    const [preferredColor, setPreferredColor] = useState('random'); // 'white', 'black' o 'random'
    const [isSearchingGame, setIsSearchingGame] = useState(false);

    const handleShowMoves = (square) => {
        if (!gameStarted || game.current.turn() !== playerColor) return;
    
        const moves = game.current.moves({ square, verbose: true });
        const destinations = moves.map((m) => m.to);
        setLegalMoves(destinations);
    };

    const handleMove = (sourceSquare, targetSquare) => {
        if (!gameStarted) {
            showAlert("El juego no ha comenzado todavía");
            return false;
        }
    
        if (game.current.turn() !== playerColor) {
            showAlert("No es tu turno");
            return false;
        }
    
        const move = {
            from: sourceSquare,
            to: targetSquare,
            promotion: "q",
        };
    
        try {
            const result = game.current.move(move);
            if (!result) {
                showAlert("Movimiento inválido");
                return false;
            }
    
            setFen(game.current.fen());
            
            socket.current.emit("move", {
                gameId,
                move: result
            });
    
            return true;
        } catch (error) {
            showAlert("Movimiento inválido");
            return false;
        }
    };

    const showAlert = (msg) => {
        setAlert(msg);
        setTimeout(() => setAlert(""), 3000);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        const formatted = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
        
        if (seconds < 30) {
            return <span className="gamevs-time-critical">{formatted}</span>;
        }
        if (seconds < 120) {
            return <span className="gamevs-time-warning">{formatted}</span>;
        }
        return formatted;
    };

    useEffect(() => {
        socket.current = io(`${import.meta.env.VITE_API_URL}/game`, {
            path: "/socket.io",
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 20000,
            autoConnect: true
        });

        const onConnect = () => {
            setGameStatus("Conectado, buscando partida...");
            socket.current.emit("joinGame", (response) => {
                if (!response?.success) {
                    setGameStatus("Error al unirse al juego");
                    showAlert("No se pudo unir al juego. Intente recargar.");
                }
            });
        };

        const onDisconnect = (reason) => {
            if (reason === "io server disconnect") {
                setGameStatus("Desconectado del servidor");
                showAlert("Se perdió la conexión. Recargue la página.");
            }
        };

        socket.current.on("connect", onConnect);
        socket.current.on("disconnect", onDisconnect);

        socket.current.on("gameJoined", ({ gameId, playerColor, status, gameStarted }) => {
            setGameId(gameId);
            setPlayerColor(playerColor);
            setGameStatus(status || `Eres las ${playerColor === 'w' ? 'blancas' : 'negras'}`);
            setGameStarted(gameStarted !== false);
            setIsSearchingGame(false);
          });

        socket.current.on("opponentJoined", ({ fen, clocks, gameStarted }) => {
            setGameStarted(true);
            setGameStatus("¡Juego iniciado! Es tu turno");
            setFen(fen);
            setClocks(clocks);
            game.current.load(fen);
        });

        socket.current.on("updateClocks", (newClocks) => {
            setClocks(newClocks);
        });

        socket.current.on("moveMade", ({ fen, move, clocks }) => {
            game.current.load(fen);
            setFen(fen);
            setClocks(clocks);
            
            setMoves(prev => {
                const newMoves = [...prev];
                newMoves.push(move.san || move.moveSan);
                return newMoves;
            });
        
            const isMyTurn = game.current.turn() === playerColor;
            setGameStatus(isMyTurn ? "Es tu turno" : "Esperando movimiento del oponente...");
        });

        socket.current.on("gameOver", ({ winner, reason }) => {
            const result = winner === playerColor ? "¡Perdiste!" : "¡Ganaste!";
            setGameStatus(`${result} (${reason})`);
            showAlert(`${result} ${reason}`);
            setGameStarted(false);
        });

        socket.current.on("error", (error) => {
            showAlert(error.message || "Error de conexión");
        });

        socket.current.connect();

        return () => {
            socket.current.off("connect", onConnect);
            socket.current.off("disconnect", onDisconnect);
            socket.current.disconnect();
        };
    }, []);

    useEffect(() => {
        let timer;
        if (gameStarted) {
            timer = setInterval(() => {
                if (gameId && playerColor) {
                    setClocks(prev => {
                        const newClocks = {...prev};
                        const currentTurn = game.current.turn();
                        
                        if (currentTurn === 'w') {
                            newClocks.w = Math.max(0, newClocks.w - 1);
                        } else {
                            newClocks.b = Math.max(0, newClocks.b - 1);
                        }
                        
                        return newClocks;
                    });
                }
            }, 1000);
        }

        return () => {
            if (timer) clearInterval(timer);
        };
    }, [gameId, playerColor, gameStarted]);

    const renderMovesTable = () => {
        const rows = [];
        let moveNumber = 1;
    
        for (let i = 0; i < moves.length; i += 2) {
            const whiteMove = moves[i];
            const blackMove = i + 1 < moves.length ? moves[i + 1] : null;
    
            rows.push(
                <tr key={moveNumber}>
                    <td>{moveNumber}</td>
                    <td>{whiteMove || '-'}</td>
                    <td>{blackMove || '-'}</td>
                </tr>
            );
            moveNumber++;
        }
    
        return rows;
    };

    const handleBoardThemeChange = (theme) => {
        setBoardTheme(theme);
    };

    const getCustomBoardStyle = () => {
        return {
            borderRadius: "4px",
            boxShadow: "0 3px 10px rgba(0,0,0,0.2)",
        };
    };

    const getCustomSquareStyles = () => {
        return {
            ...legalMoves.reduce((styles, square) => {
                styles[square] = {
                    boxShadow: "inset 0 0 15px 5px rgba(0, 255, 0, 0.7)",
                    backgroundColor: "rgba(0, 255, 0, 0.2)",
                    borderRadius: "0",
                    border: "2px solid #00ff00"
                };
                return styles;
            }, {}),
            ...(gameStarted && playerColor && game.current.turn() === playerColor ? {
                [Object.keys(game.current.board()).find(sq => 
                    game.current.get(sq)?.color === playerColor && 
                    game.current.moves({ square: sq }).length > 0
                )]: {
                    boxShadow: "inset 0 0 15px 3px rgba(0, 150, 255, 0.7)",
                    border: "2px solid #0096ff"
                }
            } : {})
        };
    };

    const customPieces = () => {
            const pieceSize = boardSize / 8;
            return {
                wK: () => <img src={wK} style={{ width: pieceSize, height: pieceSize }} alt="White King" />,
                wQ: () => <img src={wQ} style={{ width: pieceSize, height: pieceSize }} alt="White Queen" />,
                wR: () => <img src={wR} style={{ width: pieceSize, height: pieceSize }} alt="White Rook" />,
                wB: () => <img src={wB} style={{ width: pieceSize, height: pieceSize }} alt="White Bishop" />,
                wN: () => <img src={wN} style={{ width: pieceSize, height: pieceSize }} alt="White Knight" />,
                wP: () => <img src={wP} style={{ width: pieceSize, height: pieceSize }} alt="White Pawn" />,
                bK: () => <img src={bK} style={{ width: pieceSize, height: pieceSize }} alt="Black King" />,
                bQ: () => <img src={bQ} style={{ width: pieceSize, height: pieceSize }} alt="Black Queen" />,
                bR: () => <img src={bR} style={{ width: pieceSize, height: pieceSize }} alt="Black Rook" />,
                bB: () => <img src={bB} style={{ width: pieceSize, height: pieceSize }} alt="Black Bishop" />,
                bN: () => <img src={bN} style={{ width: pieceSize, height: pieceSize }} alt="Black Knight" />,
                bP: () => <img src={bP} style={{ width: pieceSize, height: pieceSize }} alt="Black Pawn" />
            };
    };

    const handleTimeControlChange = (minutes) => {
        setTimeControl(minutes);
      };
      
      const handleColorPreference = (color) => {
        setPreferredColor(color);
      };
      
      const handleSurrender = () => {
        if (!gameStarted || !gameId) return;
        
        socket.current.emit("surrender", { gameId }, (response) => {
          if (response.success) {
            showAlert("Te has rendido");
            setGameStarted(false);
            setGameStatus("Partida terminada (rendición)");
          }
        });
      };
      
      const handleSearchGame = () => {
        if (isSearchingGame) return;
        
        setIsSearchingGame(true);
        setGameStatus(`Buscando partida (${timeControl} min)...`);
        
        socket.current.emit("searchGame", { 
          timeControl, 
          preferredColor 
        }, (response) => {
          if (!response?.success) {
            setIsSearchingGame(false);
            showAlert("Error al buscar partida");
            setGameStatus("Error al buscar partida");
          }
        });
      };

    return (
        <>
            <section>
                <Navbar/>
            </section>
            <div className="gamevs-container">
                <h2 className="gamevs-title">Ajedrez en Línea - 1vs1</h2>
                
                <div className="gamevs-status">
                    {gameStatus}
                </div>

                {alert && (
                    <div className="gamevs-alert">
                    {alert}
                    </div>
                )}

                <div className="gamevs-layout">
                    {/* Columna izquierda - Temporizadores */}
                    <div className="gamevs-left-column">
                        <div className="gamevs-timer-container">
                            <h5>Temporizadores</h5>
                            <div className={`gamevs-timer ${gameStarted && game.current.turn() === 'w' ? 'gamevs-timer-active' : ''}`}>
                                <div className="gamevs-timer-label">Blancas</div>
                                <div className="gamevs-timer-value">
                                    {formatTime(clocks.w)}
                                </div>
                            </div>
                            <div className={`gamevs-timer ${gameStarted && game.current.turn() === 'b' ? 'gamevs-timer-active' : ''}`}>
                                <div className="gamevs-timer-label">Negras</div>
                                <div className="gamevs-timer-value">
                                    {formatTime(clocks.b)}
                                </div>
                            </div>
                        </div>
                    </div>
                    {!gameStarted && (
                        <div className="gamevs-search-container">
                            <div className="gamevs-time-controls">
                            <h4>Tiempo de juego:</h4>
                            <div className="gamevs-time-options">
                                {[1, 5, 10, 15, 30, 60].map(minutes => (
                                <button
                                    key={minutes}
                                    className={`gamevs-time-btn ${timeControl === minutes ? 'active' : ''}`}
                                    onClick={() => handleTimeControlChange(minutes)}
                                >
                                    {minutes} min
                                </button>
                                ))}
                            </div>
                            </div>

                            <div className="gamevs-color-selection">
                            <h4>Color preferido:</h4>
                            <div className="gamevs-color-options">
                                <button
                                className={`gamevs-color-btn ${preferredColor === 'white' ? 'active' : ''}`}
                                onClick={() => handleColorPreference('white')}
                                >
                                Blancas
                                </button>
                                <button
                                className={`gamevs-color-btn ${preferredColor === 'black' ? 'active' : ''}`}
                                onClick={() => handleColorPreference('black')}
                                >
                                Negras
                                </button>
                                <button
                                className={`gamevs-color-btn ${preferredColor === 'random' ? 'active' : ''}`}
                                onClick={() => handleColorPreference('random')}
                                >
                                Aleatorio
                                </button>
                            </div>
                            </div>

                            <button 
                            className="gamevs-search-btn"
                            onClick={handleSearchGame}
                            disabled={isSearchingGame}
                            >
                            {isSearchingGame ? 'Buscando oponente...' : 'Buscar Partida'}
                            </button>
                        </div>
                        )}

                        {gameStarted && (
                        <button 
                            className="gamevs-surrender-btn"
                            onClick={handleSurrender}
                        >
                            Rendirse
                        </button>
                        )}
                    {/* Columna central - Tablero */}
                    <div className="gamevs-center-column">
                        <div className="gamevs-board-options">
                            <button 
                                className={`gamevs-theme-btn ${boardTheme === 'red' ? 'active' : ''}`}
                                onClick={() => handleBoardThemeChange('red')}
                            >
                                Clasico
                            </button>
                            <button 
                                className={`gamevs-theme-btn ${boardTheme === 'green' ? 'active' : ''}`}
                                onClick={() => handleBoardThemeChange('green')}
                            >
                                Verde
                            </button>
                            <button 
                                className={`gamevs-theme-btn ${boardTheme === 'brown' ? 'active' : ''}`}
                                onClick={() => handleBoardThemeChange('brown')}
                            >
                                Madera
                            </button>
                            <button 
                                className={`gamevs-theme-btn ${boardTheme === 'blue' ? 'active' : ''}`}
                                onClick={() => handleBoardThemeChange('blue')}
                            >
                                Azul
                            </button>
                        </div>
                        <div className={`gamevs-board-container ${boardTheme}`}>
                            <Chessboard
                                position={fen}
                                onPieceDrop={handleMove}
                                onPieceDragBegin={(piece, square) => handleShowMoves(square)}
                                boardOrientation={playerColor === "w" ? "white" : "black"}
                                customBoardStyle={getCustomBoardStyle()}
                                customSquareStyles={getCustomSquareStyles()}
                                customDarkSquareStyle={{ 
                                    backgroundColor: boardTheme === 'green' ? '#779556' : 
                                                    boardTheme === 'brown' ? '#b58863' : 
                                                    boardTheme === 'blue' ? '#4682b4' : '#1a1a1a'
                                }}
                                customLightSquareStyle={{ 
                                    backgroundColor: boardTheme === 'green' ? '#ebecd0' : 
                                                    boardTheme === 'brown' ? '#f0d9b5' : 
                                                    boardTheme === 'blue' ? '#87ceeb' : '#f0f0f0'
                                }}
                                customPieces={customPieces()}
                            />
                        </div>
                    </div>

                    {/* Columna derecha - Movimientos */}
                    <div className="gamevs-right-column">
                        <div className="gamevs-moves-container">
                            <h5>Movimientos</h5>
                            <div className="gamevs-moves-scroll">
                                <table className="gamevs-moves-table">
                                    <thead className="gamevs-moves-table-header">
                                        <tr>
                                            <th>#</th>
                                            <th>Blancas</th>
                                            <th>Negras</th>
                                        </tr>
                                    </thead>
                                    <tbody>{renderMovesTable()}</tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
import React, { useState, useRef, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import ChessLogic from './ChessLogic';
import './ChessGame.css';
import Navbar from '../Navbar/Navbar';

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

const ChessGame = () => {
  const [game] = useState(new Chess());
  const [fen, setFen] = useState(game.fen());
  const [showHint, setShowHint] = useState(false);
  const [hintMove, setHintMove] = useState(null);
  const [difficulty, setDifficulty] = useState(3);
  const [moveHistory, setMoveHistory] = useState([]);
  const [clocks, setClocks] = useState({ w: 600, b: 600 });
  const [gameStatus, setGameStatus] = useState('Configura tu partida');
  const [boardTheme, setBoardTheme] = useState("green");
  const [boardSize, setBoardSize] = useState(Math.min(window.innerWidth - 40, 600));
  const [timeControl, setTimeControl] = useState(10);
  const [playerColor, setPlayerColor] = useState('w');
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [legalMoves, setLegalMoves] = useState([]);
  
  const chessLogic = useRef(new ChessLogic(game));
  const timerRef = useRef(null);
  const aiTimerStartRef = useRef(null);

  useEffect(() => {
    chessLogic.current = new ChessLogic(game);
  }, [game]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const formatted = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    
    if (seconds < 30) {
      return <span className="chessgame-time-critical">{formatted}</span>;
    }
    if (seconds < 120) {
      return <span className="chessgame-time-warning">{formatted}</span>;
    }
    return formatted;
  };

  useEffect(() => {
    if (showHint && game.turn() === playerColor && gameStarted) {
      const hint = chessLogic.current.getHint(playerColor, difficulty);
      setHintMove(hint);
    } else {
      setHintMove(null);
    }
  }, [fen, showHint, difficulty, game, playerColor, gameStarted]);

  useEffect(() => {
    if (!gameStarted || game.isGameOver()) {
      clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setClocks(prevClocks => {
        const turn = game.turn();
        const newClocks = { ...prevClocks };
        
        if (newClocks[turn] > 0) {
          newClocks[turn] -= 1;
        } else {
          clearInterval(timerRef.current);
          setGameStatus(`¡Tiempo agotado! Ganador: ${turn === 'w' ? 'Negras' : 'Blancas'}`);
          setGameStarted(false);
        }
        
        return newClocks;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [fen, game, gameStarted]);

  const makeMove = (move) => {
    try {
      const newMove = game.move({
        from: move.sourceSquare,
        to: move.targetSquare,
        promotion: 'q',
      });

      if (newMove) {
        setFen(game.fen());
        updateMoveHistory();
        setSelectedSquare(null);
        setLegalMoves([]);
        
        chessLogic.current.game = game;
        
        const status = chessLogic.current.checkStatus(game.turn());
        if (status.gameOver) {
          setGameStatus(status.message);
          clearInterval(timerRef.current);
          setGameStarted(false);
          return true;
        }
        
        if (game.turn() !== playerColor && !game.isGameOver() && gameStarted) {
          aiTimerStartRef.current = Date.now();
          
          setTimeout(() => {
            const aiMove = chessLogic.current.makeBestMove(playerColor === 'w' ? 'b' : 'w', difficulty);
            if (aiMove) {
              const aiThinkingTime = Math.floor((Date.now() - aiTimerStartRef.current) / 1000);
              
              setClocks(prevClocks => {
                const newClocks = { ...prevClocks };
                newClocks[playerColor === 'w' ? 'b' : 'w'] = Math.max(0, newClocks[playerColor === 'w' ? 'b' : 'w'] - aiThinkingTime);
                return newClocks;
              });
              
              setFen(game.fen());
              updateMoveHistory();
              
              const aiStatus = chessLogic.current.checkStatus(game.turn());
              if (aiStatus.gameOver) {
                setGameStatus(aiStatus.message);
                clearInterval(timerRef.current);
                setGameStarted(false);
              }
            }
          }, 100);
        }
        
        return true;
      }
    } catch (e) {
      console.error("Move error:", e);
    }
    return false;
  };

  const updateMoveHistory = () => {
    const history = game.history({ verbose: true });
    const formattedHistory = [];
    
    for (let i = 0; i < history.length; i += 2) {
      const whiteMove = history[i];
      const blackMove = history[i + 1];
      
      formattedHistory.push({
        number: (i / 2) + 1,
        white: whiteMove?.san || '-',
        black: blackMove?.san || '-'
      });
    }
    
    setMoveHistory(formattedHistory);
  };

  const onDrop = (sourceSquare, targetSquare) => {
    if (game.turn() === playerColor && gameStarted) {
      return makeMove({ sourceSquare, targetSquare });
    }
    return false;
  };

  const handleSquareClick = (square) => {
    if (!gameStarted || game.turn() !== playerColor) return;

    if (selectedSquare) {
      const move = {
        from: selectedSquare,
        to: square,
        promotion: 'q'
      };
      
      if (makeMove(move)) {
        setSelectedSquare(null);
        setLegalMoves([]);
      } else {
        const piece = game.get(square);
        if (piece && piece.color === playerColor) {
          setSelectedSquare(square);
          setLegalMoves(game.moves({ square, verbose: true }).map(m => m.to));
        } else {
          setSelectedSquare(null);
          setLegalMoves([]);
        }
      }
    } else {
      const piece = game.get(square);
      if (piece && piece.color === playerColor) {
        setSelectedSquare(square);
        setLegalMoves(game.moves({ square, verbose: true }).map(m => m.to));
      }
    }
  };

  const handleShowMoves = (square) => {
    if (!gameStarted || game.turn() !== playerColor) return;
    const moves = game.moves({ square, verbose: true });
    setLegalMoves(moves.map(m => m.to));
  };

  const getCustomSquareStyles = () => {
    const styles = {};
    
    // Resaltado para la sugerencia de movimiento
    if (hintMove) {
      styles[hintMove.from] = {
        background: 'radial-gradient(circle, rgba(0, 150, 255, 0.4) 25%, transparent 25%)',
        boxShadow: 'inset 0 0 15px 3px rgba(0, 150, 255, 0.5)',
        borderRadius: '50%',
        border: '2px solid #0096ff'
      };
      
      styles[hintMove.to] = {
        background: hintMove.captured 
          ? 'radial-gradient(circle, rgba(255, 0, 0, 0.4) 25%, transparent 25%)'
          : 'radial-gradient(circle, rgba(0, 255, 0, 0.4) 25%, transparent 25%)',
        boxShadow: hintMove.captured
          ? 'inset 0 0 15px 3px rgba(255, 0, 0, 0.3)'
          : 'inset 0 0 15px 3px rgba(0, 255, 0, 0.3)',
        borderRadius: '50%',
        border: hintMove.captured ? '2px solid #ff0000' : '2px solid #00ff00'
      };
    }

    // Resaltado para movimientos legales durante el drag
    if (gameStarted && game.turn() === playerColor) {
      legalMoves.forEach(square => {
        const piece = game.get(square);
        styles[square] = {
          background: piece 
            ? 'radial-gradient(circle, rgba(255, 0, 0, 0.4) 25%, transparent 25%)'
            : 'radial-gradient(circle, rgba(0, 255, 0, 0.4) 25%, transparent 25%)',
          boxShadow: piece
            ? 'inset 0 0 15px 3px rgba(255, 0, 0, 0.3)'
            : 'inset 0 0 15px 3px rgba(0, 255, 0, 0.3)',
          borderRadius: '50%',
          border: piece ? '2px solid #ff0000' : '2px solid #00ff00'
        };
      });

      // Resaltado para la pieza seleccionada
      if (selectedSquare) {
        styles[selectedSquare] = {
          background: 'rgba(0, 150, 255, 0.4)',
          boxShadow: 'inset 0 0 15px 3px rgba(0, 150, 255, 0.5)',
          border: '2px solid #0096ff'
        };
      }
    }

    return styles;
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

  const renderMovesTable = () => {
    return moveHistory.map((move, index) => (
      <tr key={index}>
        <td>{move.number}</td>
        <td>{move.white}</td>
        <td>{move.black}</td>
      </tr>
    ));
  };

  const handleTimeControlChange = (minutes) => {
    setTimeControl(minutes);
    setClocks({ w: minutes * 60, b: minutes * 60 });
  };

  const handleColorPreference = (color) => {
    setPlayerColor(color === 'white' ? 'w' : 'b');
  };

  const handleStartGame = () => {
    game.reset();
    setFen(game.fen());
    setMoveHistory([]);
    setClocks({ w: timeControl * 60, b: timeControl * 60 });
    setGameStatus('Partida en progreso');
    setGameStarted(true);
    setSelectedSquare(null);
    setLegalMoves([]);
  };

  const handleSurrender = () => {
    setGameStatus('Partida terminada (rendición)');
    setGameStarted(false);
    clearInterval(timerRef.current);
  };

  return (
    <>
      <section>
        <Navbar/>
      </section>
      <div className="chessgame-container">
        <h2 className="chessgame-title">Ajedrez vs IA</h2>
        
        <div className="chessgame-status">
          {gameStatus}
        </div>

        <div className="chessgame-layout">
          {/* Columna izquierda - Temporizadores */}
          <div className="chessgame-left-column">
            <div className="chessgame-timer-container">
              <h5>Temporizadores</h5>
              <div className={`chessgame-timer ${gameStarted && game.turn() === 'w' ? 'chessgame-timer-active' : ''}`}>
                <div className="chessgame-timer-label">Blancas</div>
                <div className="chessgame-timer-value">
                  {formatTime(clocks.w)}
                </div>
              </div>
              <div className={`chessgame-timer ${gameStarted && game.turn() === 'b' ? 'chessgame-timer-active' : ''}`}>
                <div className="chessgame-timer-label">Negras</div>
                <div className="chessgame-timer-value">
                  {formatTime(clocks.b)}
                </div>
              </div>
            </div>
          </div>

          {/* Columna central - Tablero */}
          <div className="chessgame-center-column">
            {!gameStarted ? (
              <div className="chessgame-search-container">
                <div className="chessgame-time-controls">
                  <h4>Tiempo de juego:</h4>
                  <div className="chessgame-time-options">
                    {[1, 5, 10, 15, 30, 60].map(minutes => (
                      <button
                        key={minutes}
                        className={`chessgame-time-btn ${timeControl === minutes ? 'active' : ''}`}
                        onClick={() => handleTimeControlChange(minutes)}
                      >
                        {minutes} min
                      </button>
                    ))}
                  </div>
                </div>

                <div className="chessgame-difficulty-selector">
                  <h4>Dificultad:</h4>
                  <select 
                    value={difficulty}
                    onChange={(e) => setDifficulty(parseInt(e.target.value))}
                    className="chessgame-control-btn"
                  >
                    <option value="2">Fácil</option>
                    <option value="3">Medio</option>
                    <option value="4">Difícil</option>
                  </select>
                </div>

                <button 
                  className="chessgame-search-btn"
                  onClick={handleStartGame}
                >
                  Iniciar Partida
                </button>
              </div>
            ) : (
              <>
                <button 
                  className="chessgame-surrender-btn"
                  onClick={handleSurrender}
                >
                  Rendirse
                </button>

                <div className="chessgame-board-options">
                  <button 
                    className={`chessgame-theme-btn ${boardTheme === 'green' ? 'active' : ''}`}
                    onClick={() => handleBoardThemeChange('green')}
                  >
                    Clásico
                  </button>
                  <button 
                    className={`chessgame-theme-btn ${boardTheme === 'red' ? 'active' : ''}`}
                    onClick={() => handleBoardThemeChange('red')}
                  >
                    Moderno
                  </button>
                  <button 
                    className={`chessgame-theme-btn ${boardTheme === 'brown' ? 'active' : ''}`}
                    onClick={() => handleBoardThemeChange('brown')}
                  >
                    Madera
                  </button>
                  <button 
                    className={`chessgame-theme-btn ${boardTheme === 'blue' ? 'active' : ''}`}
                    onClick={() => handleBoardThemeChange('blue')}
                  >
                    Azul
                  </button>
                </div>

                <div className="chessgame-board-controls">
                  <button 
                    onClick={() => setShowHint(!showHint)}
                    className={`chessgame-control-btn ${showHint ? 'active' : ''}`}
                  >
                    {showHint ? 'Ocultar Ayuda' : 'Mostrar Ayuda'}
                  </button>
                  <button 
                    onClick={() => {
                      game.undo();
                      setFen(game.fen());
                      updateMoveHistory();
                      setSelectedSquare(null);
                      setLegalMoves([]);
                    }}
                    className="chessgame-control-btn"
                  >
                    Deshacer
                  </button>
                  <button 
                    onClick={() => { 
                      game.reset(); 
                      setFen(game.fen()); 
                      setMoveHistory([]);
                      setClocks({ w: timeControl * 60, b: timeControl * 60 });
                      setGameStatus('Configura tu partida');
                      setGameStarted(false);
                      setSelectedSquare(null);
                      setLegalMoves([]);
                      clearInterval(timerRef.current);
                    }}
                    className="chessgame-control-btn"
                  >
                    Reiniciar
                  </button>
                </div>
              </>
            )}

            <div className={`chessgame-board-container ${boardTheme}`}>
              <Chessboard
                position={fen}
                onPieceDrop={onDrop}
                onSquareClick={handleSquareClick}
                onPieceDragBegin={(piece, square) => handleShowMoves(square)}
                onPieceDragEnd={() => setLegalMoves([])}
                boardOrientation={playerColor === 'w' ? 'white' : 'black'}
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
          <div className="chessgame-right-column">
            <div className="chessgame-moves-container">
              <h5>Movimientos</h5>
              <div className="chessgame-moves-scroll">
                <table className="chessgame-moves-table">
                  <thead className="chessgame-moves-table-header">
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

export default ChessGame;
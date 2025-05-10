import React, { useState, useRef, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import ChessLogic from './ChessLogic';
import './Gamevs.css';
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
  const [clocks, setClocks] = useState({ w: 3600, b: 3600 });
  const [gameStatus, setGameStatus] = useState('Partida en progreso');
  const [boardTheme, setBoardTheme] = useState("green");
  const [boardSize, setBoardSize] = useState(Math.min(window.innerWidth - 40, 600));
  const chessLogic = useRef(new ChessLogic(game));
  const timerRef = useRef(null);
  const aiTimerStartRef = useRef(null);

  // Inicializar ChessLogic con la instancia del juego
  useEffect(() => {
    chessLogic.current = new ChessLogic(game);
  }, [game]);

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
    if (showHint && game.turn() === 'w') {
      const hint = chessLogic.current.getHint('w', difficulty);
      setHintMove(hint);
    } else {
      setHintMove(null);
    }
  }, [fen, showHint, difficulty, game]);

  useEffect(() => {
    if (game.isGameOver()) {
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
        }
        
        return newClocks;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [fen, game]);

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
        
        // Actualizar ChessLogic con el nuevo estado
        chessLogic.current.game = game;
        
        const status = chessLogic.current.checkStatus(game.turn());
        if (status.gameOver) {
          setGameStatus(status.message);
          clearInterval(timerRef.current);
          return true;
        }
        
        // Turno de la IA (negras)
        if (game.turn() === 'b' && !game.isGameOver()) {
          // Guardar el momento en que la IA empieza a pensar
          aiTimerStartRef.current = Date.now();
          
          setTimeout(() => {
            const aiMove = chessLogic.current.makeBestMove('b', difficulty);
            if (aiMove) {
              // Calcular cuánto tiempo realmente tardó la IA
              const aiThinkingTime = Math.floor((Date.now() - aiTimerStartRef.current) / 1000);
              
              // Actualizar el reloj de la IA con el tiempo real que tardó
              setClocks(prevClocks => {
                const newClocks = { ...prevClocks };
                newClocks.b = Math.max(0, newClocks.b - aiThinkingTime);
                return newClocks;
              });
              
              setFen(game.fen());
              updateMoveHistory();
              
              const aiStatus = chessLogic.current.checkStatus(game.turn());
              if (aiStatus.gameOver) {
                setGameStatus(aiStatus.message);
                clearInterval(timerRef.current);
              }
            }
          },); 
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
    if (game.turn() === 'w' && !game.isGameOver()) {
      return makeMove({ sourceSquare, targetSquare });
    }
    return false;
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

  // Estilos para resaltar las casillas de sugerencia
  const getCustomSquareStyles = () => {
    const styles = {};
    
    if (hintMove) {
      styles[hintMove.from] = {
        background: 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)',
        borderRadius: '50%',
        border: '2px solid #0096ff'
      };
      styles[hintMove.to] = {
        background: 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)',
        borderRadius: '50%',
        border: '2px solid #0096ff'
      };
    }
    
    return styles;
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

  return (
    <>
      <section>
        <Navbar/>
      </section>
      <div className="gamevs-container">
        <h2 className="gamevs-title">Ajedrez vs IA</h2>
        
        <div className="gamevs-status">
          {gameStatus}
        </div>

        <div className="gamevs-layout">
          {/* Columna izquierda - Temporizadores */}
          <div className="gamevs-left-column">
            <div className="gamevs-timer-container">
              <h5>Temporizadores</h5>
              <div className={`gamevs-timer ${!game.isGameOver() && game.turn() === 'w' ? 'gamevs-timer-active' : ''}`}>
                <div className="gamevs-timer-label">Blancas (Tú)</div>
                <div className="gamevs-timer-value">
                  {formatTime(clocks.w)}
                </div>
              </div>
              <div className={`gamevs-timer ${!game.isGameOver() && game.turn() === 'b' ? 'gamevs-timer-active' : ''}`}>
                <div className="gamevs-timer-label">Negras (IA)</div>
                <div className="gamevs-timer-value">
                  {formatTime(clocks.b)}
                </div>
              </div>
            </div>
          </div>

          {/* Columna central - Tablero */}
          <div className="gamevs-center-column">
            <div className="gamevs-board-options">
              <button 
                className={`gamevs-theme-btn ${boardTheme === 'green' ? 'active' : ''}`}
                onClick={() => handleBoardThemeChange('green')}
              >
                Clasico
              </button>
              <button 
                className={`gamevs-theme-btn ${boardTheme === 'red' ? 'active' : ''}`}
                onClick={() => handleBoardThemeChange('red')}
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

            {/* Controles del juego */}
            <div className="gamevs-board-controls">
              <button 
                onClick={() => setShowHint(!showHint)}
                className={`gamevs-control-btn ${showHint ? 'active' : ''}`}
              >
                {showHint ? 'Ocultar Ayuda' : 'Mostrar Ayuda'}
              </button>
              <button 
                onClick={() => {
                  game.undo();
                  setFen(game.fen());
                  updateMoveHistory();
                }}
                className="gamevs-control-btn"
              >
                Deshacer
              </button>
              <button 
                onClick={() => { 
                  game.reset(); 
                  setFen(game.fen()); 
                  setMoveHistory([]);
                  setClocks({ w: 3600, b: 3600 });
                  setGameStatus('Partida en progreso');
                  clearInterval(timerRef.current);
                }}
                className="gamevs-control-btn"
              >
                Reiniciar
              </button>
              <div className="gamevs-difficulty-selector">
                <span>Dificultad:</span>
                <select 
                  value={difficulty}
                  onChange={(e) => setDifficulty(parseInt(e.target.value))}
                  className="gamevs-control-btn"
                >
                  <option value="2">Fácil</option>
                  <option value="3">Medio</option>
                  <option value="4">Difícil</option>
                </select>
              </div>
            </div>

            <div className={`gamevs-board-container ${boardTheme}`}>
              <Chessboard
                position={fen}
                onPieceDrop={onDrop}
                boardOrientation="white"
                customBoardStyle={getCustomBoardStyle()}
                customSquareStyles={getCustomSquareStyles()}
                customDarkSquareStyle={{ 
                  backgroundColor: boardTheme === 'green' ? '#1a1a1a' : 
                                  boardTheme === 'brown' ? '#b58863' : 
                                  boardTheme === 'blue' ? '#4682b4' : '#779556'
                }}
                customLightSquareStyle={{ 
                  backgroundColor: boardTheme === 'green' ? '#f0f0f0' : 
                                  boardTheme === 'brown' ? '#f0d9b5' : 
                                  boardTheme === 'blue' ? '#87ceeb' : '#ebecd0'
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
};

export default ChessGame;
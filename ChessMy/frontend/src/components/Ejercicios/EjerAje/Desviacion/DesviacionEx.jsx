import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import './DesviacionEx.css';

// Importa las piezas
import kingWhite from './assets/wK.png';
import queenWhite from './assets/wQ.png';
import rookWhite from './assets/wR.png';
import bishopWhite from './assets/wB.png';
import knightWhite from './assets/wN.png';
import pawnWhite from './assets/wP.png';
import kingBlack from './assets/bK.png';
import queenBlack from './assets/bQ.png';
import rookBlack from './assets/bR.png';
import bishopBlack from './assets/bB.png';
import knightBlack from './assets/bN.png';
import pawnBlack from './assets/bP.png';
import Navbar from '../../../Navbar/Navbar';

const DesviacionEx = () => {
    const exercises = [
        {//01
            fen: '2kr1r2/pp1n3p/2p2bp1/8/3P1B2/8/PP2BP1P/2R1K1R1 w - - 0 1',
            correctMove: { from: 'c1', to: 'c6' }
        },
        {//02
            fen: '8/6pp/8/1N6/2n2P2/4k1P1/P1Kp3P/8 b - - 0 1',
            correctMove: { from: 'c4', to: 'a3' }
        },
        {//03
            fen: '2qr2k1/6Pn/p4pQ1/1p3P2/2p1Bp2/2P2P2/PP6/6RK w - - 0 1',
            correctMove: { from: 'g6', to: 'e8' }
        },
        {//04
            fen: '6k1/3R1pp1/p7/3Q1P2/1P2rq1p/7K/5PP1/8 b - - 4 40',
            correctMove: { from: 'e4', to: 'e3' }
        },
        {//05
            fen: '2rr1k2/p4p1Q/1pq2bpp/3N4/8/P2R3P/1P3PP1/4R1K1 w - - 2 26',
            correctMove: { from: 'd5', to: 'e7' }
        },
        {//06
            fen: 'r2r2k1/5qpp/8/3bp3/P1B5/2Q1P1P1/7P/R1R3K1 b - - 3 29',
            correctMove: { from: 'd5', to: 'c4' }
        },
        {//07
            fen: 'r5rk/1p3p1p/p2N1Pq1/5R2/4Q3/P6P/1P5K/8 w - - 0 1',
            correctMove: { from: 'f5', to: 'g5' }
        },
        {//08
            fen: '1nq3k1/r3b1p1/pp2prNp/2p5/4Q3/2P1P1B1/P4PPP/2R2RK1 w - - 0 1',
            correctMove: { from: 'e4', to: 'a8' }
        },
        {//09
            fen: '5rk1/r1q2p1p/p3pQ2/1bPp1p2/1R6/3BP3/P4PPP/1R4K1 w - - 15 30',
            correctMove: { from: 'b4', to: 'g4' }
        },
        {//10
            fen: '1r1r2k1/2q2ppp/p3b3/4p3/1p2P3/5B2/PPPR1QPP/3R3K w - - 0 1',
            correctMove: { from: 'f2', to: 'a7' }
        },
        {//11
            fen: '5k2/5p2/6p1/2P3P1/3Q2K1/6P1/8/5q2 b - - 12 59',
            correctMove: { from: 'f7', to: 'f5' }
        },
        {//12
            fen: '6k1/4q1b1/p4R2/1p2BQ2/2p5/2P4P/Pr3r2/6RK w - - 0 1',
            correctMove: { from: 'g1', to: 'g7' }
        }
    ];

    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [game, setGame] = useState(new Chess());
    const [message, setMessage] = useState('Selecciona un ejercicio para comenzar.');
    const [moveList, setMoveList] = useState([]);
    const [completedExercises, setCompletedExercises] = useState([]);
    const [skippedExercises, setSkippedExercises] = useState([]);
    const [boardSize, setBoardSize] = useState(Math.min(window.innerWidth - 40, 600));
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [boardTheme, setBoardTheme] = useState('green');
    const [showThemeDropdown, setShowThemeDropdown] = useState(false);
    const [showInfoPanel, setShowInfoPanel] = useState(false);
    
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 992) {
                setSidebarOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    function loadExercise(index) {
        if (index < 0 || index >= exercises.length) return;

        if (currentExerciseIndex !== index && !completedExercises.includes(currentExerciseIndex)) {
            setSkippedExercises(prev => [...prev, currentExerciseIndex]);
        }

        const newGame = new Chess(exercises[index].fen);
        setGame(newGame);
        setCurrentExerciseIndex(index);
        updateMoveList(newGame);
        setMessage(`Ejercicio ${index + 1}: Realiza el movimiento correcto.`);
    }

    function updateMoveList(gameInstance) {
        const history = gameInstance.history();
        const formattedMoves = [];
        for (let i = 0; i < history.length; i += 2) {
            formattedMoves.push(`${Math.floor(i / 2) + 1}. ${history[i]} ${history[i + 1] || ''}`);
        }
        setMoveList(formattedMoves);
    }

    function onDrop(sourceSquare, targetSquare) {
        const { correctMove } = exercises[currentExerciseIndex];
        
        if (sourceSquare === correctMove.from && targetSquare === correctMove.to) {
            try {
                const move = game.move({
                    from: sourceSquare,
                    to: targetSquare,
                    promotion: 'q'
                });
                
                if (move === null) return false;
                
                setGame(new Chess(game.fen()));
                updateMoveList(game);
                setMessage('¡Felicidades, movimiento correcto!');
                setCompletedExercises(prev => [...prev, currentExerciseIndex]);
                return true;
            } catch (e) {
                return false;
            }
        } else {
            setMessage('Movimiento incorrecto. Inténtalo de nuevo.');
            return false;
        }
    }

    function onDragStart(piece, sourceSquare) {
        const turn = game.turn();
        return piece[0].toLowerCase() === turn[0];
    }

    const customPieces = () => {
        const pieceSize = Math.min(boardSize / 8, 80);
        return {
            wK: () => <img src={kingWhite} style={{ width: pieceSize, height: pieceSize }} alt="White King" />,
            wQ: () => <img src={queenWhite} style={{ width: pieceSize, height: pieceSize }} alt="White Queen" />,
            wR: () => <img src={rookWhite} style={{ width: pieceSize, height: pieceSize }} alt="White Rook" />,
            wB: () => <img src={bishopWhite} style={{ width: pieceSize, height: pieceSize }} alt="White Bishop" />,
            wN: () => <img src={knightWhite} style={{ width: pieceSize, height: pieceSize }} alt="White Knight" />,
            wP: () => <img src={pawnWhite} style={{ width: pieceSize, height: pieceSize }} alt="White Pawn" />,
            bK: () => <img src={kingBlack} style={{ width: pieceSize, height: pieceSize }} alt="Black King" />,
            bQ: () => <img src={queenBlack} style={{ width: pieceSize, height: pieceSize }} alt="Black Queen" />,
            bR: () => <img src={rookBlack} style={{ width: pieceSize, height: pieceSize }} alt="Black Rook" />,
            bB: () => <img src={bishopBlack} style={{ width: pieceSize, height: pieceSize }} alt="Black Bishop" />,
            bN: () => <img src={knightBlack} style={{ width: pieceSize, height: pieceSize }} alt="Black Knight" />,
            bP: () => <img src={pawnBlack} style={{ width: pieceSize, height: pieceSize }} alt="Black Pawn" />
        };
    };

    

    return (
        <>
            <section>
                <Navbar />
            </section>
            <div className="chess-container">
                <div 
                    className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
                    onClick={() => setSidebarOpen(false)}
                />
                <button 
                    className="hamburger-btn" 
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                    ☰
                </button>
                
                <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                    <div className="sidebar-header">
                        <h2 className="sidebar-title">
                            Ejercicios
                            <button 
                            className="hamburger-btn" 
                            onClick={() => setSidebarOpen(false)}
                            style={{ display: sidebarOpen ? 'block' : 'none' }}
                            >
                            ×
                            </button>
                        </h2>
                    </div>

                    <div className="exercise-list">
                        {exercises.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    loadExercise(index);
                                    if (window.innerWidth <= 992) {
                                    setSidebarOpen(false);
                                    }
                                }}
                                className={`exercise-button ${
                                    completedExercises.includes(index) ? 'completed' : 
                                    skippedExercises.includes(index) ? 'failed' : 
                                    currentExerciseIndex === index ? 'active' : ''
                                }`}
                            >
                            Ejercicio {index + 1}
                            {completedExercises.includes(index) && (
                                <span className="status-icon">✓</span>
                            )}
                            {skippedExercises.includes(index) && (
                                <span className="status-icon">✗</span>
                            )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tablero de Ajedrez */}
                <div className="chess-main-content">
                    <div className="chess-board-container">
                        <div className="chess-controls">
                            <div className="theme-selector-container">
                                <button className="theme-dropdown-btn" onClick={() => setShowThemeDropdown(!showThemeDropdown)}>
                                    Temas del tablero ▼
                                </button>
                                
                                {showThemeDropdown && (
                                    <div className="theme-dropdown">
                                        <button 
                                            onClick={() => {
                                                setBoardTheme('green');
                                                setShowThemeDropdown(false);
                                            }}
                                            className={boardTheme === 'green' ? 'active' : ''}
                                        >
                                            <span className="theme-preview green"></span>
                                            Blanco clasico
                                        </button>
                                        <button 
                                            onClick={() => {
                                                setBoardTheme('brown');
                                                setShowThemeDropdown(false);
                                            }}
                                            className={boardTheme === 'brown' ? 'active' : ''}
                                        >
                                            <span className="theme-preview brown"></span>
                                            Clásico madera
                                        </button>
                                        <button 
                                            onClick={() => {
                                                setBoardTheme('blue');
                                                setShowThemeDropdown(false);
                                            }}
                                            className={boardTheme === 'blue' ? 'active' : ''}
                                        >
                                            <span className="theme-preview blue"></span>
                                            Azul marino
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="chess-board-wrapper" style={{ width: boardSize, height: boardSize }}>
                        <Chessboard 
                            position={game.fen()} 
                            onPieceDrop={onDrop}
                            onPieceDragBegin={onDragStart}
                            boardWidth={boardSize}
                            customPieces={customPieces()}
                            customBoardStyle={{
                                borderRadius: '8px',
                                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
                            }}
                            customDarkSquareStyle={{ 
                                backgroundColor: boardTheme === 'green' ? '#1a1a1a' : 
                                                boardTheme === 'brown' ? '#B58863' : '#5D8AA8',
                                borderRadius: '2px'
                            }}
                            customLightSquareStyle={{ 
                                backgroundColor: boardTheme === 'green' ? '#f0f0f0' : 
                                            boardTheme === 'brown' ? '#F0D9B5' : '#B9D9EB',
                                borderRadius: '2px'
                            }}
                        />
                        </div>
                        <div className="chess-message">{message}</div>
                        <div className="chess-info-panel">
                            <button 
                                className="info-toggle-btn"
                                onClick={() => setShowInfoPanel(!showInfoPanel)}
                            >
                                {showInfoPanel ? 'Ocultar información' : 'Mostrar información'}
                            </button>
                            
                            {showInfoPanel && (
                                <div className="info-content">
                                    <div className="fen-display">
                                        <h4>Posición FEN:</h4>
                                        <p>{game.fen()}</p>
                                        <button 
                                            className="copy-btn"
                                            onClick={() => {
                                                navigator.clipboard.writeText(game.fen());
                                                setMessage('FEN copiado al portapapeles!');
                                            }}
                                        >
                                            Copiar FEN
                                        </button>
                                    </div>
                                    
                                    <div className="move-history">
                                        <h4>Historial de movimientos:</h4>
                                        {moveList.length > 0 ? (
                                            <div className="moves-container">
                                                {moveList.map((move, index) => (
                                                    <div key={index} className="move-entry">
                                                        {move}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p>No hay movimientos registrados</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DesviacionEx;

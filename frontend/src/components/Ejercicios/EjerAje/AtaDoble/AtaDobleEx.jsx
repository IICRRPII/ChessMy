import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import './AtaDobleEx.css';

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

const AtaDobleEx = () => {
    const exercises = [
        {//1
            fen: '7k/pp1R3p/2p1pr2/4b3/PP2P1P1/7P/2P1Q3/4q1NK b - - 3 33',
            correctMove: { from: 'f6', to: 'f2' }
        },
        {//2
            fen: '1q4k1/4pR2/p3r1p1/6P1/8/P1P2Q2/KP6/8 w - - 3 52',
            correctMove: { from: 'f3', to: 'h3' }
        },
        {//3
            fen: '6k1/6pp/p7/1pqP1rN1/2p3Q1/3b4/PP4PP/4R2K b - - 1 26',
            correctMove: { from: 'c5', to: 'e3' }
        },
        {//4
            fen: '8/pp4pp/2p1kp2/b7/2nP4/3K3P/PP3PP1/2B1N3 w - - 5 24',
            correctMove: { from: 'b2', to: 'b4' }
        },
        {//5
            fen: '3r2k1/1p4pp/p2r1p2/4q3/3nP3/1PN4P/1P1R1qP1/3R2K1 b - - 0 1',
            correctMove: { from: 'd4', to: 'f3' }
        },
        {//6
            fen: 'r4rk1/pbq2ppp/1p2pn2/n1p5/3P4/PBP1P1N1/1B3PPP/2RQ1RK1 b - - 9 14',
            correctMove: { from: 'c7', to: 'c6' }
        },
        {//7
            fen: 'r4nk1/p3rppp/1p6/2PqNQ2/8/4P3/P4PPP/1RR3K1 w - - 1 23',
            correctMove: { from: 'e5', to: 'g6' }
        },
        {//8
            fen: 'r3bk1r/1p2bp2/4pn1p/p3N3/2Pp1B2/8/q1B1QPPP/3R1RK1 w - - 0 1',
            correctMove: { from: 'c2', to: 'h7' }
        },
        {//9
            fen: '3rk1nr/1pp2pbp/p1b5/3Np3/2N1P1pq/8/PPP2PPP/R1BQR1K1 b k - 3 13',
            correctMove: { from: 'c6', to: 'd5' }
        },
        {//10
            fen: '5nk1/p2p2bp/1p1qp3/3N4/2P3QP/1P2B1P1/P7/5K2 w - - 0 1',
            correctMove: { from: 'd5', to: 'f6' }
        },
        {//11
            fen: '7k/1b1r2p1/p6p/1p2qN2/3bP3/3Q4/P5PP/1B1R3K b - - 1 36',
            correctMove: { from: 'd4', to: 'g1' }
        },
        {//12
            fen: '6k1/pp3p1p/2pRrpq1/8/5Pb1/2Q3N1/PPP3PP/6K1 w - - 6 25',
            correctMove: { from: 'd6', to: 'd8' }
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
        const pieceSize = boardSize / 8;
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
                <Navbar/>
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
                                            Verde moderno
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

export default AtaDobleEx;

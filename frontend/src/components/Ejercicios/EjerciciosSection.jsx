import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chess } from 'chess.js';
import './EjerciciosSection.css';

// Importa tus imágenes (ajusta las rutas según tu estructura)
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

const EjerciciosSection = () => {
    const [fen, setFen] = useState('start');
    const [lastMove, setLastMove] = useState(null);
    const [animationSettings] = useState({
        moveInterval: 500,     // Tiempo entre movimientos en ms
        animationDuration: 0.6 // Duración animación en segundos
    });
    const game = useRef(null);
    const animationFrame = useRef(null);
    const navigate = useNavigate();

    const pieceImages = {
        'K': kingWhite, 'Q': queenWhite, 'R': rookWhite,
        'B': bishopWhite, 'N': knightWhite, 'P': pawnWhite,
        'k': kingBlack, 'q': queenBlack, 'r': rookBlack,
        'b': bishopBlack, 'n': knightBlack, 'p': pawnBlack
    };

    useEffect(() => {
        game.current = new Chess();
        startSimulation();
        
        return () => cancelAnimationFrame(animationFrame.current);
    }, []);

    const startSimulation = () => {
        const simulateMove = () => {
        if (game.current.isGameOver()) {
            setTimeout(() => {
            game.current.reset();
            setFen('start');
            setLastMove(null);
            animationFrame.current = requestAnimationFrame(simulateMove);
            }, animationSettings.moveInterval);
            return;
        }

        const moves = game.current.moves({ verbose: true });
        const randomMove = moves[Math.floor(Math.random() * moves.length)];
        game.current.move(randomMove);
        setLastMove({
            from: randomMove.from,
            to: randomMove.to,
            piece: randomMove.piece
        });
        setFen(game.current.fen());

        setTimeout(() => {
            animationFrame.current = requestAnimationFrame(simulateMove);
        }, animationSettings.moveInterval);
        };

        animationFrame.current = requestAnimationFrame(simulateMove);
    };

    const getPieceName = (piece) => {
        const names = {
        'k': 'rey', 'q': 'reina', 'r': 'torre',
        'b': 'alfil', 'n': 'caballo', 'p': 'peón'
        };
        return names[piece.toLowerCase()] || '';
    };

    const renderBoard = () => {
        const squares = [];
        const fenParts = fen.split(' ');
        const piecePositions = fenParts[0];
        
        let row = 7;
        let col = 0;
        
        for (const char of piecePositions) {
        if (char === '/') {
            row--;
            col = 0;
        } else if (isNaN(char)) {
            const isLight = (row + col) % 2 === 0;
            const squareId = `${String.fromCharCode(97 + col)}${row + 1}`;
            const isMoving = lastMove && (lastMove.from === squareId || lastMove.to === squareId);
            
            squares.push(
            <div 
                key={squareId}
                className={`chess-square ${isLight ? 'light' : 'dark'}`}
            >
                {char !== '1' && (
                <img 
                    src={pieceImages[char]} 
                    alt={`${char === char.toLowerCase() ? 'negro' : 'blanco'} ${getPieceName(char)}`}
                    className={`chess-piece-img ${isMoving ? 'animate-move' : ''}`}
                    style={{
                    '--animation-duration': `${animationSettings.animationDuration}s`
                    }}
                />
                )}
            </div>
            );
            col++;
        } else {
            const emptySquares = parseInt(char, 10);
            for (let i = 0; i < emptySquares; i++) {
            const squareId = `${String.fromCharCode(97 + col + i)}${row + 1}`;
            const isLight = (row + col + i) % 2 === 0;
            squares.push(
                <div 
                key={squareId}
                className={`chess-square ${isLight ? 'light' : 'dark'}`}
                />
            );
            }
            col += emptySquares;
        }
        }
        
        return squares;
    };

    // Función para manejar la redirección
    const handleRedirect = () => {
        navigate('/lista_ejercicios'); // Cambia '/ruta-destino' por tu ruta real
    };

    return (
        <div className="chess-module-container">
          <div className="chess-text-column">
            <h2>Mejora tu juego con ejercicios interactivos</h2>
            <p>Pon a prueba tu habilidad con desafíos diseñados para todos los niveles.</p>
            <ul className="chess-features-list">
              <li>Resuelve tácticas</li>
              <li>Analiza posiciones</li>
              <li>Perfecciona cada movimiento</li>
              <li>Entorno dinámico y educativo</li>
            </ul>
            
            {/* Botón añadido aquí */}
            <button 
              className="chess-redirect-button" 
              onClick={handleRedirect}
            >
              Ir a Ejercicios Complejos
            </button>
          </div>
          
          <div className="chess-animation-column">
            <div className="chess-board-container">
              <div className="chess-board-animation">
                <div className="chess-board-grid">
                  {renderBoard()}
                </div>
              </div>
            </div>
          </div>
        </div>
    );
};

export default EjerciciosSection;
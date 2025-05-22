import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { Chess } from 'chess.js';
import "./EjerciciosM.css";
import Navbar from "../../../components/Navbar/Navbar";
import Footer from "../../../components/Footer/Footer";

// Importar imágenes de piezas
const pieceImages = {
  'K': 'wK.png', 'Q': 'wQ.png', 'R': 'wR.png',
  'B': 'wB.png', 'N': 'wN.png', 'P': 'wP.png',
  'k': 'bK.png', 'q': 'bQ.png', 'r': 'bR.png',
  'b': 'bB.png', 'n': 'bN.png', 'p': 'bP.png'
};

const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64).split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

const MiniChessBoard = ({ moves }) => {
  const game = useRef(new Chess());
  const [currentFen, setCurrentFen] = useState('start');
  const animationRef = useRef(null);
  const moveIndex = useRef(0);

  const renderBoard = (fen) => {
    const board = [];
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
        
        board.push(
          <div 
            key={squareId}
            className={`mini-chess-square ${isLight ? 'light' : 'dark'}`}
          >
            {char !== '1' && (
              <img 
                src={`/assets/${pieceImages[char]}`} 
                alt=""
                className="mini-chess-piece"
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
          board.push(
            <div 
              key={squareId}
              className={`mini-chess-square ${isLight ? 'light' : 'dark'}`}
            />
          );
        }
        col += emptySquares;
      }
    }
    
    return board;
  };

  const animateMoves = () => {
    if (!moves || moves.length === 0) return;

    try {
      // Hacer el movimiento
      const move = moves[moveIndex.current % moves.length];
      
      // Cargar posición FEN si es diferente a la actual
      if (move.fen && game.current.fen() !== move.fen) {
        game.current.load(move.fen);
      }
      
      // Intentar hacer el movimiento
      game.current.move({
        from: move.from,
        to: move.to,
        promotion: 'q'
      });

      setCurrentFen(game.current.fen());
      moveIndex.current++;

    } catch (err) {
      console.error("Error executing move:", err);
      // Reiniciar si hay error
      game.current = new Chess();
      setCurrentFen('start');
      moveIndex.current = 0;
    }

    animationRef.current = setTimeout(() => {
      animateMoves();
    }, 1000); // 1 segundo entre movimientos
  };

  useEffect(() => {
    animateMoves();
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [moves]);

  return (
    <div className="mini-chess-board">
      {renderBoard(currentFen)}
    </div>
  );
};

const EjerciciosM = () => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate('/');
          return;
        }

        const decoded = parseJwt(token);
        if (!decoded) {
          throw new Error("Token inválido");
        }

        const userId = decoded.id || decoded._id || decoded.userId || decoded.sub;
        if (!userId) {
          throw new Error("No se pudo obtener el ID del usuario");
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/ejerciciosMaestro/${userId}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error("Error al obtener los ejercicios");
        }

        const data = await response.json();
        
        // Transformamos los datos para incluir información detallada de movimientos
        const formattedExercises = Object.entries(data.ejercicios).map(([id, exercise]) => ({
          id: exercise.idEjercicioCurso,
          name: exercise.ejercicioNombre,
          description: `Ejercicio con ${exercise.movimientos.length} movimientos`,
          difficulty: "Personalizado",
          muscleGroup: "Ajedrez",
          image: "https://images.unsplash.com/photo-1543092587-d8b8feaf4f16?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
          movimientos: exercise.movimientos.map(mov => ({
            fen: mov.fen,
            fromMove: mov.fromMove,
            toMove: mov.toMove,
            orden: mov.ordenMovimiento
          }))
        }));

        setExercises(formattedExercises);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching exercises:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchExercises();
  }, [navigate]);

  // Componente para mostrar un movimiento individual
  const MovementItem = ({ mov, index }) => {
    return (
      <div className="movement-item">
        <div className="movement-header">
          <span className="movement-order">Movimiento {index + 1}</span>
          <span className="movement-fen">FEN: {mov.fen}</span>
        </div>
        <div className="movement-details">
          <span>From: {mov.fromMove}</span>
          <span>To: {mov.toMove}</span>
        </div>
      </div>
    );
  };

  // Componente de tarjeta de ejercicio
  const ExerciseCard = ({ exercise }) => {
    const [showMovements, setShowMovements] = useState(false);

    return (
        <>
            
            <div className="ejerciciosm-card">
                <div className="ejerciciosm-content">
                    <h3 className="ejerciciosm-title">{exercise.name}</h3>
                    <p className="ejerciciosm-description">{exercise.description}</p>
                    
                    <button 
                        className="toggle-movements-btn"
                        onClick={() => setShowMovements(!showMovements)}
                    >
                        {showMovements ? 'Ocultar movimientos' : 'Mostrar movimientos'}
                    </button>
                    
                    {showMovements && (
                        <div className="movements-container">
                        <h4>Secuencia de movimientos:</h4>
                        {exercise.movimientos.map((mov, index) => (
                            <MovementItem key={`${exercise.id}-${index}`} mov={mov} index={index} />
                        ))}
                        </div>
                    )}
                    
                    <button 
                        className="view-exercise-btn"
                        onClick={() => navigate(`/ejercicio/${exercise.id}`)}
                    >
                        Ver ejercicio completo
                    </button>
                </div>
            </div>
        </>
    );
  };

  if (loading) {
    return (
      <div className="ejerciciosm-container">
        <h2 className="ejerciciosm-header">Cargando ejercicios...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ejerciciosm-container">
        <h2 className="ejerciciosm-header">Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <>
        <section>
                <Navbar />
        </section>
        <div className="ejerciciosm-container">
            <h2 className="ejerciciosm-header">Lista de Ejercicios</h2>
            <div className="ejerciciosm-grid">
                {exercises.length > 0 ? (
                exercises.map((exercise) => (
                    <ExerciseCard key={exercise.id} exercise={exercise} />
                ))
                ) : (
                <p>No hay ejercicios disponibles</p>
                )}
            </div>
        </div>
        <section>
            <Footer />
        </section>
    </>
  );
};

export default EjerciciosM;
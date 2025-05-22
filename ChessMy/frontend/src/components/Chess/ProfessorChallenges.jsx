import { useState } from "react";
import { Chessboard } from "react-chessboard";
import "./ProfessorBoard.css";

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

const ProfessorChallenges = () => {
  const [challengeName, setChallengeName] = useState("");
  const [initialPosition, setInitialPosition] = useState({});
  const [moves, setMoves] = useState([{ from: "", to: "" }]);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [isPlacingMode, setIsPlacingMode] = useState(false);
  const [boardTheme, setBoardTheme] = useState("green");

  // Función para generar FEN desde la posición inicial
  const generateFENFromPosition = (position) => {
    const board = Array(8).fill().map(() => Array(8).fill(null));
    
    // Colocar las piezas en el tablero
    Object.entries(position).forEach(([square, piece]) => {
      const col = square.charCodeAt(0) - 'a'.charCodeAt(0);
      const row = 8 - parseInt(square[1], 10);
      board[row][col] = piece;
    });

    // Convertir el tablero a notación FEN
    let fen = '';
    for (let row = 0; row < 8; row++) {
      let emptyCount = 0;
      for (let col = 0; col < 8; col++) {
        if (board[row][col] === null) {
          emptyCount++;
        } else {
          if (emptyCount > 0) {
            fen += emptyCount;
            emptyCount = 0;
          }
          // Convertir a notación FEN estándar (KQkq, no wK, bQ)
          const piece = board[row][col];
          const fenPiece = piece[0] === 'w' 
            ? piece[1].toUpperCase() 
            : piece[1].toLowerCase();
          fen += fenPiece;
        }
      }
      if (emptyCount > 0) {
        fen += emptyCount;
      }
      if (row < 7) {
        fen += '/';
      }
    }

    // Parte básica del FEN (turno blanco, sin enroques, sin movimiento al paso, medio movimientos = 0, número de movimiento = 1)
    return `${fen} w - - 0 1`;
  };

  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  const handleMoveChange = (index, field, value) => {
    const newMoves = [...moves];
    newMoves[index][field] = value;
    setMoves(newMoves);
  };

  const addMove = () => {
    setMoves([...moves, { from: "", to: "" }]);
  };

  const removeMove = (index) => {
    if (moves.length > 1) {
      const newMoves = [...moves];
      newMoves.splice(index, 1);
      setMoves(newMoves);
    }
  };

  const handleSquareClick = (square) => {
    if (!isPlacingMode || !selectedPiece) return;

    const newPosition = { ...initialPosition };
    
    if (selectedPiece === "empty") {
      if (newPosition[square]) {
        delete newPosition[square];
      }
    } else {
      newPosition[square] = selectedPiece;
    }

    setInitialPosition(newPosition);
  };

  const handlePieceClick = (piece) => {
    if (isPlacingMode && selectedPiece === piece) {
      setSelectedPiece(null);
      setIsPlacingMode(false);
      return;
    }
    
    setSelectedPiece(piece);
    setIsPlacingMode(true);
  };

  const createChallenge = async () => {
    // Validar campos obligatorios
    if (!challengeName.trim()) {
      alert("Por favor ingresa un nombre para el desafío");
      return;
    }

    // Validar movimientos
    if (moves.some(move => !move.from || !move.to)) {
      alert("Por favor completa todos los movimientos");
      return;
    }

    // Obtener el ID del usuario del token
    const token = localStorage.getItem('token');
    if (!token) {
      alert("No estás autenticado. Por favor inicia sesión.");
      return;
    }

    const decodedToken = parseJwt(token);
    const idUsuario = decodedToken.userId;

    // Generar FEN de la posición inicial
    const initialFEN = Object.keys(initialPosition).length > 0
      ? generateFENFromPosition(initialPosition)
      : "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"; // FEN inicial estándar

    // Preparar los movimientos en el formato que espera el backend
    const movimientos = moves.map((move, index) => ({
      ordenMovimiento: index + 1,
      fromMove: move.from,
      toMove: move.to,
      fen: initialFEN, // Usamos el mismo FEN para todos los movimientos (posición inicial)
    }));

    const challengeData = {
      movimientos,
      idUsuario,
      nombreEjercicio: challengeName,
      idEjercicioCurso: null // Puedes cambiar esto si necesitas asociarlo a un curso
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/crearEjercicio`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(challengeData),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Desafío "${data.nombreEjercicio.nombreEjercicio}" creado exitosamente!`);
        // Resetear el formulario
        setChallengeName("");
        setInitialPosition({});
        setMoves([{ from: "", to: "" }]);
      } else {
        alert(data.message || "Error al crear desafío");
      }
    } catch (error) {
      console.error("Error en la creación del desafío:", error);
      alert("Hubo un error al crear el desafío. Por favor intenta nuevamente.");
    }
  };

  const customPieces = () => {
    const pieceSize = 600 / 8;
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

  const renderPieceButtons = () => {
    return [
      "wK", "wQ", "wR", "wB", "wN", "wP",
      "bK", "bQ", "bR", "bB", "bN", "bP",
    ].map((p) => (
      <button
        key={p}
        onClick={() => handlePieceClick(p)}
        className={`professor-piece-btn ${selectedPiece === p ? 'active' : ''}`}
      >
        <img
          src={p === "wK" ? wK : 
               p === "wQ" ? wQ : 
               p === "wR" ? wR : 
               p === "wB" ? wB : 
               p === "wN" ? wN : 
               p === "wP" ? wP : 
               p === "bK" ? bK : 
               p === "bQ" ? bQ : 
               p === "bR" ? bR : 
               p === "bB" ? bB : 
               p === "bN" ? bN : bP}
          alt={p}
          className="professor-piece-img"
        />
      </button>
    ));
  };

  return (
    <div className="professor-container">
      <h2 className="professor-title">Crear Desafíos de Ajedrez</h2>
      
      <div className="professor-layout">
        <div className="professor-board-column">
          <div className="professor-pieces-container" style={{ marginBottom: '20px' }}>
            <h3 className="professor-pieces-title">Configuración del Desafío</h3>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Nombre del Desafío:</label>
              <input
                type="text"
                value={challengeName}
                onChange={(e) => setChallengeName(e.target.value)}
                className="professor-room-code"
                placeholder="Ej: Apertura de peón rey"
              />
            </div>
          </div>

          <div className={`professor-board-container ${boardTheme}`}>
            <Chessboard
              position={initialPosition}
              onSquareClick={handleSquareClick}
              boardWidth={600}
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

        <div className="professor-pieces-column">
          <div className="professor-pieces-container">
            <h3 className="professor-pieces-title">
              {isPlacingMode
                ? selectedPiece === "empty"
                  ? "Modo: Eliminar piezas"
                  : `Modo: Colocar ${selectedPiece}`
                : "Selecciona una pieza"}
            </h3>
            
            <div className="professor-pieces-grid">
              {renderPieceButtons()}
            </div>

            <div className="professor-actions">
              <button
                onClick={() => handlePieceClick("empty")}
                className={`professor-delete-btn ${selectedPiece === "empty" ? 'active' : ''}`}
              >
                Eliminar Piezas
              </button>

              {selectedPiece && (
                <button
                  onClick={() => {
                    setSelectedPiece(null);
                    setIsPlacingMode(false);
                  }}
                  className="professor-cancel-btn"
                >
                  Cancelar
                </button>
              )}
            </div>
          </div>

          <div className="professor-pieces-container" style={{ marginTop: '20px' }}>
            <h3 className="professor-pieces-title">Movimientos del Desafío</h3>
            
            {moves.map((move, index) => (
              <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>Desde:</label>
                  <input
                    type="text"
                    value={move.from}
                    onChange={(e) => handleMoveChange(index, 'from', e.target.value)}
                    className="professor-room-code"
                    placeholder="Ej: e2"
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>Hacia:</label>
                  <input
                    type="text"
                    value={move.to}
                    onChange={(e) => handleMoveChange(index, 'to', e.target.value)}
                    className="professor-room-code"
                    placeholder="Ej: e4"
                  />
                </div>
                <button
                  onClick={() => removeMove(index)}
                  className="professor-delete-btn"
                  style={{ padding: '8px', marginTop: '20px' }}
                >
                  ×
                </button>
              </div>
            ))}

            <button
              onClick={addMove}
              className="professor-start-btn"
              style={{ marginTop: '10px', width: '100%' }}
            >
              + Agregar Movimiento
            </button>
          </div>

          <button
            onClick={createChallenge}
            className="professor-start-btn"
            style={{ marginTop: '20px', width: '100%', padding: '15px' }}
          >
            Crear Desafío
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfessorChallenges;
import { useEffect, useRef, useState } from "react";
import { Chessboard } from "react-chessboard";
import { io } from "socket.io-client";
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

function fenToPosition(fen) {
  const position = {};
  const fenParts = fen.split(' ');
  const rows = fenParts[0].split('/');
  
  for (let i = 0; i < 8; i++) {
    let colIndex = 0;
    for (let j = 0; j < rows[i].length; j++) {
      const char = rows[i][j];
      if (isNaN(char)) {
        const square = String.fromCharCode(97 + colIndex) + (8 - i);
        position[square] = char === char.toUpperCase() ? `w${char.toUpperCase()}` : `b${char.toUpperCase()}`;
        colIndex++;
      } else {
        colIndex += parseInt(char, 10);
      }
    }
  }
  
  return position;
}

function positionToFen(position) {
  let fen = '';
  
  for (let i = 8; i >= 1; i--) {
    let emptySquares = 0;
    let rowFen = '';
    
    for (let j = 0; j < 8; j++) {
      const col = String.fromCharCode(97 + j);
      const square = `${col}${i}`;
      
      if (position[square]) {
        if (emptySquares > 0) {
          rowFen += emptySquares;
          emptySquares = 0;
        }
        const piece = position[square];
        rowFen += piece[0] === 'w' ? piece[1].toUpperCase() : piece[1].toLowerCase();
      } else {
        emptySquares++;
      }
    }
    
    if (emptySquares > 0) {
      rowFen += emptySquares;
    }
    
    fen += (fen ? '/' : '') + rowFen;
  }
  
  return `${fen} w - - 0 1`;
}

export default function ProfessorBoard() {
  const [position, setPosition] = useState({});
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [isPlacingMode, setIsPlacingMode] = useState(false);
  const [roomStarted, setRoomStarted] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const roomInputRef = useRef();
  const [boardSize, setBoardSize] = useState(Math.min(window.innerWidth - 40, 600));
  const [boardTheme, setBoardTheme] = useState("red");
  const socket = useRef(null);

  const handleSquareInteraction = (square) => {
    if (!isPlacingMode || !selectedPiece) return;

    const newPosition = { ...position };
    
    if (selectedPiece === "empty") {
      if (newPosition[square]) {
        delete newPosition[square];
      }
    } else {
      newPosition[square] = selectedPiece;
    }

    setPosition(newPosition);
    const newFen = positionToFen(newPosition);
    socket.current.emit("updatePosition", newFen);
  };

  const handleSquareMouseDown = (square) => {
    setIsMouseDown(true);
    handleSquareInteraction(square);
  };

  const handleSquareMouseEnter = (square) => {
    if (isMouseDown) {
      handleSquareInteraction(square);
    }
  };

  const handleSquareMouseUp = () => {
    setIsMouseDown(false);
  };

  const handleDrop = (source, target) => {
    const newPosition = { ...position };

    if (isPlacingMode && selectedPiece) {
      if (selectedPiece === "empty") {
        delete newPosition[target];
      } else {
        newPosition[target] = selectedPiece;
      }
    } else {
      if (newPosition[source]) {
        newPosition[target] = newPosition[source];
        delete newPosition[source];
      }
    }

    setPosition(newPosition);
    const newFen = positionToFen(newPosition);
    socket.current.emit("updatePosition", newFen);
    return true;
  };

  const handleSquareClick = (square) => {
    handleSquareInteraction(square);
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

  const startGame = () => {
    const roomCode = roomInputRef.current.value.trim();
    if (!roomCode) {
      alert("Por favor ingresa un código de sala");
      return;
    }
    setRoomStarted(true);
    socket.current.emit("startGame", roomCode);
  };
  
  const setupSocketListeners = () => {
    socket.current.emit("identify", "professor", (response) => {
      console.log("Identificado como profesor", response);
    });

    socket.current.on("classroomStarted", ({ roomCode }) => {
      console.log("Sala iniciada:", roomCode);
    });

    socket.current.on("updateBoard", (newFen) => {
      const updatedPos = fenToPosition(newFen);
      setPosition(updatedPos);
    });

    socket.current.on("error", (msg) => {
      console.error("Error:", msg);
      alert(msg);
    });
  };

  useEffect(() => {
    socket.current = io("http://localhost:8080/classroom");
    setupSocketListeners();

    return () => {
      socket.current.off("classroomStarted");
      socket.current.off("updateBoard");
      socket.current.off("error");
      socket.current.disconnect();
    };
  }, []);

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

  const handleBoardThemeChange = (theme) => {
    setBoardTheme(theme);
  };

  const getCustomBoardStyle = () => {
    return {
      borderRadius: "4px",
      boxShadow: "0 3px 10px rgba(0,0,0,0.2)",
    };
  };

  return (
    <div className="professor-container">
      <h2 className="professor-title">Ajedrez en Línea - Modo Profesor</h2>
      
      <div className="professor-room-input">
        <input 
          ref={roomInputRef} 
          type="text" 
          placeholder="Código de la sala" 
          className="professor-room-code"
        />
        <button 
          onClick={startGame} 
          className="professor-start-btn"
        >
          Iniciar Sala
        </button>
      </div>

      {roomStarted && (
        <div className="professor-layout">
          {/* Columna izquierda - Tablero */}
          <div className="professor-board-column">
            <div className={`professor-board-container ${boardTheme}`}>
              <Chessboard
                position={position}
                onPieceDrop={handleDrop}
                onSquareClick={handleSquareClick}
                onSquareMouseDown={handleSquareMouseDown}
                onSquareMouseEnter={handleSquareMouseEnter}
                onSquareMouseUp={handleSquareMouseUp}
                arePiecesDraggable={true}
                boardWidth={boardSize}
                customBoardStyle={getCustomBoardStyle()}
                customSquareStyles={{
                  ...(isPlacingMode && {
                    [Object.keys(position).find(sq => position[sq] === selectedPiece)]: {
                      backgroundColor: "rgba(0, 0, 255, 0.4)"
                    }
                  })
                }}
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

          {/* Columna derecha - Piezas */}
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
                {[
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
                ))}
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
          </div>
        </div>
      )}
    </div>
  );
}
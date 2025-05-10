import { useEffect, useRef, useState } from "react";
import { Chessboard } from "react-chessboard";
import { io } from "socket.io-client";
import "./StudentBoard.css";

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
  if (fen === "start") {
    fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
  }
  
  const position = {};
  const fenParts = fen.split(' ');
  const rows = fenParts[0].split('/');
  
  rows.forEach((row, i) => {
    let colIndex = 0;
    for (const char of row) {
      if (isNaN(char)) {
        const square = String.fromCharCode(97 + colIndex) + (8 - i);
        position[square] = char === char.toUpperCase() ? `w${char.toUpperCase()}` : `b${char.toUpperCase()}`;
        colIndex++;
      } else {
        colIndex += parseInt(char, 10);
      }
    }
  });
  
  return position;
}

export default function StudentBoard() {
  const [position, setPosition] = useState(fenToPosition("8/8/8/8/8/8/8/8 w - - 0 1"));
  const [roomCode, setRoomCode] = useState("");
  const [joined, setJoined] = useState(false);
  const [boardSize, setBoardSize] = useState(Math.min(window.innerWidth - 40, 600));
  const [boardTheme, setBoardTheme] = useState("green");
  const roomInputRef = useRef();
  const socket = useRef(null);

  const joinGame = () => {
    const code = roomInputRef.current.value.trim();
    if (!code) return;
    
    console.log("Unirse a sala:", code);
    setRoomCode(code);
    
    if (!socket.current) {
      socket.current = io(`${import.meta.env.VITE_BACKEND_URL}/classroom`);
      setupSocketListeners();
    }
    
    socket.current.emit("joinProfessorRoom", code);
  };

  const setupSocketListeners = () => {
    //Estudiante
    socket.current.emit("identify", "student", (response) => {
      console.log("Identificado como alumno", response);
    });

    socket.current.on("classroomJoined", ({ position }) => {
      console.log("Unido a sala con posición:", position);
      setPosition(fenToPosition(position));
      setJoined(true);
    });

    socket.current.on("updateBoard", (newFen) => {
      console.log("Actualización de tablero recibida:", newFen);
      setPosition(fenToPosition(newFen));
    });

    socket.current.on("classroomClosed", () => {
      alert("El profesor ha cerrado la sala");
      setJoined(false);
      setPosition(fenToPosition("8/8/8/8/8/8/8/8 w - - 0 1"));
    });

    socket.current.on("error", (msg) => {
      alert(msg || "Ocurrió un error al unirse a la sala");
    });
  };

  useEffect(() => {
    socket.current = io(`https://chessmyproduccion.onrender.com/classroom`);
    setupSocketListeners();

    return () => {
      if (socket.current) {
        socket.current.off("classroomJoined");
        socket.current.off("updateBoard");
        socket.current.off("classroomClosed");
        socket.current.off("error");
        socket.current.disconnect();
      }
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

  const getCustomBoardStyle = () => {
    return {
      borderRadius: "4px",
      boxShadow: "0 3px 10px rgba(0,0,0,0.2)",
    };
  };

  return (
    <div className="student-container">
      <h2 className="student-title">Ajedrez en Línea - Alumno</h2>
      
      <div className="student-room-input">
        <input 
          ref={roomInputRef} 
          type="text" 
          placeholder="Código de la sala" 
          className="student-room-code"
          disabled={joined}
        />
        <button 
          onClick={joinGame} 
          className="student-join-btn"
          disabled={joined}
        >
          {joined ? "Unido a sala " + roomCode : "Unirse a la Sala"}
        </button>
        
        {joined && (
          <button 
            className="student-leave-btn"
            onClick={() => {
              setJoined(false);
              setPosition(fenToPosition("8/8/8/8/8/8/8/8 w - - 0 1"));
            }}
          >
            Salir
          </button>
        )}
      </div>

      <div className="student-board-container">
        <Chessboard
          id="StudentBoard"
          position={position}
          arePiecesDraggable={false}
          boardWidth={boardSize}
          customBoardStyle={getCustomBoardStyle()}
          customDarkSquareStyle={{ 
            backgroundColor: boardTheme === 'green' ? '#1a1a1a' : 
                            boardTheme === 'brown' ? '#b58863' : 
                            boardTheme === 'blue' ? '#4682b4' : '#1a1a1a'
          }}
          customLightSquareStyle={{ 
            backgroundColor: boardTheme === 'green' ? '#f0f0f0' : 
                            boardTheme === 'brown' ? '#f0d9b5' : 
                            boardTheme === 'blue' ? '#87ceeb' : '#f0f0f0'
          }}
          customPieces={customPieces()}
        />
      </div>
    </div>
  );
}
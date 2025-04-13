
import ChessLogic from '../utils/ChessLogic';

class ChessController {
  constructor() {
    this.games = new Map(); // Almacena partidas por ID de sesión
  }

  // Inicia una nueva partida
  startNewGame(req, res) {
    const { sessionId } = req.body;
    const chessLogic = new ChessLogic();
    
    this.games.set(sessionId, chessLogic);
    
    res.json({
      success: true,
      fen: chessLogic.getCurrentFen(),
      turn: chessLogic.getTurn()
    });
  }

  // Realiza un movimiento
  makeMove(req, res) {
    const { sessionId, from, to, promotion } = req.body;
    const chessLogic = this.games.get(sessionId);

    if (!chessLogic) {
      return res.status(404).json({ success: false, message: 'Game not found' });
    }

    const move = chessLogic.makeMove({ from, to, promotion: promotion || 'q' });
    
    if (!move) {
      return res.status(400).json({ success: false, message: 'Invalid move' });
    }

    // Si es el turno de la IA (negras)
    if (chessLogic.getTurn() === 'b') {
      const aiMove = chessLogic.makeBestMove('b', 3);
      
      return res.json({
        success: true,
        playerMove: move,
        aiMove: aiMove,
        fen: chessLogic.getCurrentFen(),
        turn: chessLogic.getTurn(),
        status: chessLogic.checkStatus('b')
      });
    }

    res.json({
      success: true,
      move,
      fen: chessLogic.getCurrentFen(),
      turn: chessLogic.getTurn(),
      status: chessLogic.checkStatus('w')
    });
  }

  // Obtiene el mejor movimiento para la IA
  getBestMove(req, res) {
    const { sessionId, color, depth } = req.body;
    const chessLogic = this.games.get(sessionId);

    if (!chessLogic) {
      return res.status(404).json({ success: false, message: 'Game not found' });
    }

    const move = chessLogic.getBestMove(color || 'b', depth || 3);
    
    if (!move) {
      return res.status(400).json({ success: false, message: 'No valid moves' });
    }

    res.json({
      success: true,
      move,
      fen: chessLogic.getCurrentFen()
    });
  }

  // Obtiene el estado actual del juego
  getGameState(req, res) {
    const { sessionId } = req.params;
    const chessLogic = this.games.get(sessionId);

    if (!chessLogic) {
      return res.status(404).json({ success: false, message: 'Game not found' });
    }

    res.json({
      success: true,
      fen: chessLogic.getCurrentFen(),
      turn: chessLogic.getTurn(),
      status: chessLogic.checkStatus(chessLogic.getTurn()),
      advantage: chessLogic.updateAdvantage(),
      history: chessLogic.game.history({ verbose: true })
    });
  }

  // Reinicia la partida
  resetGame(req, res) {
    const { sessionId } = req.body;
    const chessLogic = this.games.get(sessionId);

    if (!chessLogic) {
      return res.status(404).json({ success: false, message: 'Game not found' });
    }

    const fen = chessLogic.reset();
    
    res.json({
      success: true,
      fen,
      turn: chessLogic.getTurn()
    });
  }

  // Carga una posición FEN específica
  loadPosition(req, res) {
    const { sessionId, fen } = req.body;
    let chessLogic = this.games.get(sessionId);

    if (!chessLogic) {
      chessLogic = new ChessLogic();
      this.games.set(sessionId, chessLogic);
    }

    try {
      const loadedFen = chessLogic.loadPosition(fen);
      res.json({
        success: true,
        fen: loadedFen,
        turn: chessLogic.getTurn()
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Invalid FEN position'
      });
    }
  }

  // Deshace el último movimiento
  undoMove(req, res) {
    const { sessionId } = req.body;
    const chessLogic = this.games.get(sessionId);

    if (!chessLogic) {
      return res.status(404).json({ success: false, message: 'Game not found' });
    }

    const fen = chessLogic.undo();
    
    res.json({
      success: true,
      fen,
      turn: chessLogic.getTurn()
    });
  }

  // Rehace un movimiento deshecho
  redoMove(req, res) {
    const { sessionId } = req.body;
    const chessLogic = this.games.get(sessionId);

    if (!chessLogic) {
      return res.status(404).json({ success: false, message: 'Game not found' });
    }

    const fen = chessLogic.redo();
    
    res.json({
      success: true,
      fen,
      turn: chessLogic.getTurn()
    });
  }

  // Obtiene sugerencia de movimiento
  getHint(req, res) {
    const { sessionId, color } = req.body;
    const chessLogic = this.games.get(sessionId);

    if (!chessLogic) {
      return res.status(404).json({ success: false, message: 'Game not found' });
    }

    const hint = chessLogic.showHint(color || 'w');
    
    if (!hint) {
      return res.status(400).json({ success: false, message: 'No hint available' });
    }

    res.json({
      success: true,
      hint
    });
  }
}

export default new ChessController();
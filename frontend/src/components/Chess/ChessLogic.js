import { weights, pst_w, pst_b } from './config';

export default class ChessLogic {
  constructor(game) {
    this.game = game;
    this.globalSum = 0;
    this.positionCount = 0;
    this.pstSelf = { w: pst_w, b: pst_b };
    this.pstOpponent = { w: pst_b, b: pst_w };
  }

  evaluateBoard(move, prevSum, color) {
    const game = this.game;
    
    // Usar los métodos correctos de chess.js (varios han cambiado)
    if (game.isCheckmate()) {
      return move.color === color ? 10 ** 10 : -(10 ** 10);
    }

    if (game.isDraw() || game.isThreefoldRepetition() || game.isStalemate()) {
      return 0;
    }

    if (game.isCheck()) {
      prevSum += move.color === color ? 50 : -50;
    }

    const from = [
      8 - parseInt(move.from[1]),
      move.from.charCodeAt(0) - 'a'.charCodeAt(0),
    ];
    const to = [
      8 - parseInt(move.to[1]),
      move.to.charCodeAt(0) - 'a'.charCodeAt(0),
    ];

    if (prevSum < -1500 && move.piece === 'k') {
      move.piece = 'k_e';
    }

    if (move.captured) {
      if (move.color === color) {
        prevSum += weights[move.captured] + this.pstOpponent[move.color][move.captured][to[0]][to[1]];
      } else {
        prevSum -= weights[move.captured] + this.pstSelf[move.color][move.captured][to[0]][to[1]];
      }
    }

    if (move.promotion) {
      move.promotion = 'q';
      if (move.color === color) {
        prevSum -= weights[move.piece] + this.pstSelf[move.color][move.piece][from[0]][from[1]];
        prevSum += weights[move.promotion] + this.pstSelf[move.color][move.promotion][to[0]][to[1]];
      } else {
        prevSum += weights[move.piece] + this.pstSelf[move.color][move.piece][from[0]][from[1]];
        prevSum -= weights[move.promotion] + this.pstSelf[move.color][move.promotion][to[0]][to[1]];
      }
    } else {
      if (move.color !== color) {
        prevSum += this.pstSelf[move.color][move.piece][from[0]][from[1]];
        prevSum -= this.pstSelf[move.color][move.piece][to[0]][to[1]];
      } else {
        prevSum -= this.pstSelf[move.color][move.piece][from[0]][from[1]];
        prevSum += this.pstSelf[move.color][move.piece][to[0]][to[1]];
      }
    }

    return prevSum;
  }

  minimax(depth, alpha, beta, isMaximizingPlayer, sum, color) {
    this.positionCount++;
    const children = this.game.moves({ verbose: true }).sort(() => 0.5 - Math.random());

    if (depth === 0 || children.length === 0) {
      return [null, sum];
    }

    let bestValue = isMaximizingPlayer ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;
    let bestMove = null;

    for (const currMove of children) {
      const moveResult = this.game.move(currMove);
      const newSum = this.evaluateBoard(moveResult, sum, color);
      const [_, childValue] = this.minimax(
        depth - 1,
        alpha,
        beta,
        !isMaximizingPlayer,
        newSum,
        color
      );

      this.game.undo();

      if (isMaximizingPlayer) {
        if (childValue > bestValue) {
          bestValue = childValue;
          bestMove = moveResult;
          alpha = Math.max(alpha, bestValue);
        }
      } else {
        if (childValue < bestValue) {
          bestValue = childValue;
          bestMove = moveResult;
          beta = Math.min(beta, bestValue);
        }
      }

      if (alpha >= beta) break;
    }

    return [bestMove, bestValue];
  }

  getBestMove(color, depth) {
    this.positionCount = 0;
    const startTime = performance.now();
    
    const [bestMove, bestValue] = this.minimax(
      depth,
      Number.NEGATIVE_INFINITY,
      Number.POSITIVE_INFINITY,
      true,
      color === 'b' ? this.globalSum : -this.globalSum,
      color
    );

    if (bestMove) {
      this.globalSum = this.evaluateBoard(bestMove, this.globalSum, 'b');
    }

    console.log(`Positions evaluated: ${this.positionCount}`);
    console.log(`Time taken: ${(performance.now() - startTime).toFixed(2)}ms`);

    return bestMove;
  }

  makeBestMove(color, depth) {
    const move = this.getBestMove(color, depth);
    if (move) {
      this.game.move(move);
      return move;
    }
    return null;
  }

  checkStatus(color) {
    const game = this.game;
    const statusMessages = {
      checkmate: `<b>Checkmate!</b> Oops, <b>${color}</b> lost.`,
      insufficient_material: `It's a <b>draw!</b> (Insufficient Material)`,
      threefold_repetition: `It's a <b>draw!</b> (Threefold Repetition)`,
      stalemate: `It's a <b>draw!</b> (Stalemate)`,
      draw: `It's a <b>draw!</b> (50-move Rule)`,
      check: `Oops, <b>${color}</b> is in <b>check!</b>`,
      default: 'No check, checkmate, or draw.'
    };
  
    if (game.isCheckmate()) return { gameOver: true, message: statusMessages.checkmate };
    if (game.isDraw()) {
      if (game.isInsufficientMaterial()) return { gameOver: true, message: statusMessages.insufficient_material };
      if (game.isThreefoldRepetition()) return { gameOver: true, message: statusMessages.threefold_repetition };
      if (game.isStalemate()) return { gameOver: true, message: statusMessages.stalemate };
      return { gameOver: true, message: statusMessages.draw };
    }
    if (game.isCheck()) return { gameOver: false, message: statusMessages.check };
    
    return { gameOver: false, message: statusMessages.default };
  }

  updateAdvantage() {
    let advantageColor, advantageNumber;
    
    if (this.globalSum > 0) {
      advantageColor = 'Black';
      advantageNumber = this.globalSum;
    } else if (this.globalSum < 0) {
      advantageColor = 'White';
      advantageNumber = -this.globalSum;
    } else {
      advantageColor = 'Neither side';
      advantageNumber = this.globalSum;
    }

    const advantageBarWidth = ((-this.globalSum + 2000) / 4000) * 100;

    return {
      advantageColor,
      advantageNumber,
      advantageBarWidth
    };
  }

  reset() {
    this.game.reset();
    this.globalSum = 0;
    this.undoStack = [];
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    return this.game.fen();
  }

  loadPosition(fen) {
    this.game.load(fen);
    return this.game.fen();
  }

  makeMove({ from, to, promotion = 'q' }) {
    this.undoStack = []; // Reset redo stack on new move
    const move = this.game.move({ from, to, promotion });
    
    if (move) {
      this.globalSum = this.evaluateBoard(move, this.globalSum, 'b');
      return move;
    }
    return null;
  }

  undo() {
    const move = this.game.undo();
    if (move) {
      this.undoStack.push(move);
      if (this.undoStack.length > this.STACK_SIZE) {
        this.undoStack.shift();
      }
    }
    return this.game.fen();
  }

  redo() {
    if (this.undoStack.length > 0) {
      const move = this.undoStack.pop();
      this.game.move(move);
    }
    return this.game.fen();
  }

  compVsComp(color, callback, delay = 250) {
    const status = this.checkStatus({ w: 'white', b: 'black' }[color]);
    if (!status.gameOver) {
      this.timer = setTimeout(() => {
        this.makeBestMove(color, 3);
        callback(this.game.fen());
        
        const newColor = color === 'w' ? 'b' : 'w';
        this.compVsComp(newColor, callback, delay);
      }, delay);
    } else {
      callback(this.game.fen(), status.message);
    }
  }

  stopCompVsComp() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  showHint(color) {
    const move = this.getBestMove(color, 3);
    if (move) {
      return {
        from: move.from,
        to: move.to
      };
    }
    return null;
  }

  getPossibleMoves(square) {
    return this.game.moves({
      square,
      verbose: true
    }).map(move => move.to);
  }

  getCurrentFen() {
    return this.game.fen();
  }

  getTurn() {
    return this.game.turn();
  }

  isGameOver() {
    return this.game.isGameOver();
  }

  // Para usar con react-chessboard
  handleDrop(sourceSquare, targetSquare) {
    const move = this.makeMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q'
    });

    if (!move) return false; // Movimiento ilegal

    // Si el movimiento fue exitoso, turno de la IA
    if (this.getTurn() === 'b') {
      return new Promise(resolve => {
        setTimeout(() => {
          const aiMove = this.makeBestMove('b', 3);
          resolve(!!aiMove);
        }, 300);
      });
    }

    return true;
  }

  // Para resaltar movimientos
  getHighlightedSquares() {
    const highlights = {};
    const history = this.game.history({ verbose: true });
    
    if (history.length > 0) {
      const lastMove = history[history.length - 1];
      highlights[lastMove.from] = { backgroundColor: 'rgba(255, 255, 0, 0.4)' };
      highlights[lastMove.to] = { backgroundColor: 'rgba(255, 255, 0, 0.4)' };
    }

    return highlights;
  }

  getHint(color = 'w', depth = 3) {
    const [bestMove] = this.minimax(
      depth,
      Number.NEGATIVE_INFINITY,
      Number.POSITIVE_INFINITY,
      true,
      color === 'b' ? this.globalSum : -this.globalSum,
      color
    );
    
    return bestMove ? {
      from: bestMove.from,
      to: bestMove.to,
      piece: bestMove.piece
    } : null;
  }
}


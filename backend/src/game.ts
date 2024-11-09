export enum Piece {
  NONE = 0,
  WHITE = 1,
  BLACK = 2,
}

export type Player = {
  sessionId: string
  socketId: string
  connected: boolean

  piece: Piece
}

export type Room = {
  id: string
  players: [Player, Player] | [Player]
  currentTurnPlayer: Player
  board: Piece[][]
  startedAt: string | null
  winner: Player | null
}

type JoinOrCreateRoomParams = {
  roomId: string
  sessionId: string
  socketId: string
}

const BOARD = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 1, 2, 0, 0, 0],
  [0, 0, 0, 2, 1, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
]

const directions = [[0, 1], [1, 0], [0, -1], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]];

export class Game {
  rooms: Room[] = []

  constructor() {
  }

  joinOrCreateRoom({ roomId, sessionId, socketId }: JoinOrCreateRoomParams) {
    if (sessionId === '') {
      throw new Error("Sessão inválida")
    }

    if (roomId === '') {
      throw new Error("A sala não foi informada")
    }

    let room = this.rooms.find(room => room.id === roomId)

    if (room != null) {
      const hasPlayer = room.players.find(player => player.sessionId === sessionId)

      if (room.players.length === 2) {
        if (!hasPlayer) {
          throw new Error("A Sala de Jogo está lotada")
        }
      }

      if (room.players.length < 2 && !hasPlayer) {
        const firstPlayer = room.players[0]
        let piece = Piece.BLACK

        if (firstPlayer) {
          piece = Piece.WHITE
        }

        room.players.push({ sessionId, socketId, connected: true, piece })
      }
    } else {
      const player = { sessionId, socketId, connected: true, piece: Piece.BLACK }
      this.rooms.push({
        id: roomId,
        players: [player],
        currentTurnPlayer: player,
        board: BOARD,
        startedAt: null,
        winner: null
      })
    }
  }

  connectUser(roomId: string, sessionId: string) {
    const room = this.getRoom(roomId)

    room.players.forEach(player => {
      if (player.sessionId === sessionId) {
        player.connected = true
      }
    })
  }

  getRoom(roomId: string) {
    return this.rooms.find(room => room.id === roomId) as Room
  }

  deleteRoom(roomId: string) {
    const index = this.rooms.findIndex(room => room.id === roomId)
    this.rooms.splice(index, 1)
  }

  getUser(roomId: string, sessionId: string) {
    const room = this.getRoom(roomId)
    return room.players.find(player => player.sessionId !== sessionId) ?? null
  }

  getUserByRoom(room: Room, sessionId: string) {
    return room.players.find(player => player.sessionId === sessionId) ?? null
  }

  getOpponent(roomId: string, sessionId: string) {
    const room = this.getRoom(roomId)
    return room.players.find(player => player.sessionId !== sessionId) ?? null
  }

  getOpponentByRoom(room: Room, sessionId: string) {
    return room.players.find(player => player.sessionId !== sessionId) ?? null
  }

  onStartGame(roomId: string) {
    const room = this.getRoom(roomId)

    if (room.players.length < 2) {
      throw new Error("A sala não tem 2 jogadores")
    }

    room.startedAt = new Date().toISOString()

    return room
  }

  onGameMove(roomId: string, sessionId: string, move: { x: number, y: number }) {
    const room = this.getRoom(roomId)

    if (room.currentTurnPlayer.sessionId !== sessionId) {
      throw new Error("Não é o seu turno")
    }

    if (room.players.some(player => !player.connected)) {
      throw new Error("O oponente está desconectado, aguarde a reconexão")
    }

    if (room.startedAt == null) {
      throw new Error("A partida ainda não começou")
    }

    if (room.winner != null) {
      throw new Error("A partida foi finalizada!")
    }

    const opponent = this.getOpponentByRoom(room, sessionId) as Player
    const piece = room.currentTurnPlayer.piece

    const { isValid, newBoard } = this.isValidMove(room.board, move.x, move.y, piece)

    if (isValid) {
      room.board = newBoard
      room.board[move.y][move.x] = piece

      const { winnerPiece } = this.checkWin(room.board)

      let winner: Player | null = null;
      let newTurn = true;
      let message = "";

      if (winnerPiece != null) {
        winner = room.players.find(player => player.piece === winnerPiece) ?? null
        room.winner = winner
        newTurn = false;
        message = "Fim de Jogo!"
      }

      const hasNextPlayerValidMove = this.hasValidMoves(room.board, opponent.piece)

      if (hasNextPlayerValidMove) {
        room.currentTurnPlayer = opponent;
      }

      return { newTurn, room, nextTurnPlayer: room.currentTurnPlayer, winner, hasNextPlayerValidMove, skipOpponentTurn: !hasNextPlayerValidMove, message }
    }

    return { newTurn: false, room, nextTurnPlayer: room.currentTurnPlayer, winner: null, message: "Movimento inválido" }
  }

  isValidMove(board: Piece[][], x: number, y: number, piece: Piece) {
    const newBoard = board.map(arr => arr.slice())

    if (board[y][x] !== Piece.NONE) {
      return { isValid: false, newBoard }
    }

    let isValid = false;

    directions.forEach(([dx, dy]) => {
      if (this.flipPieces(newBoard, piece, x, y, dx, dy)) {
        isValid = true;
      }
    })

    return { isValid, newBoard }
  }

  flipPieces(board: Piece[][], piece: Piece, x: number, y: number, dx: number, dy: number) {
    let captured = [];
    let nx = x + dx;
    let ny = y + dy;

    // console.log("start\n", { y, x }, "\ndirection ", { dy, dx })

    while (this.isInBounds(nx, ny) && board[ny][nx] !== piece && board[ny][nx] !== Piece.NONE) {

      // console.log({ piece: board[ny][nx], ny, nx })

      captured.push([ny, nx]);
      nx += dx;
      ny += dy;
    }

    // console.log({ captured })

    if (this.isInBounds(nx, ny) && board[ny][nx] === piece) {
      for (let [cy, cx] of captured) {
        board[cy][cx] = piece;
      }
      return captured.length > 0;
    }

    // console.log('end')
    return false;
  }

  isInBounds(x: number, y: number) {
    return x >= 0 && x < BOARD[0].length && y >= 0 && y < BOARD.length;
  }

  checkWin(board: Piece[][]) {
    let totalPiecesPlayed = 0;
    let white = 0;
    let black = 0;

    board.forEach(row => {
      row.forEach(piece => {
        if (piece === Piece.NONE) {
          return
        }

        if (piece === Piece.WHITE) {
          white++
          totalPiecesPlayed++
        }

        if (piece === Piece.BLACK) {
          black++
          totalPiecesPlayed++
        }
      })
    })

    if (totalPiecesPlayed === 64) {
      return { winnerPiece: white > black ? Piece.WHITE : Piece.BLACK }
    } else if (white === totalPiecesPlayed) {
      return { winnerPiece: Piece.WHITE }
    } else if (black === totalPiecesPlayed) {
      return { winnerPiece: Piece.BLACK }
    }

    return { winnerPiece: null }
  }

  hasValidMoves(board: Piece[][], piece: Piece) {
    for (let y = 0; y < board.length; y++) {
      for (let x = 0; x < board[y].length; x++) {
        if (board[y][x] === Piece.NONE) {
          if (this.isValidMove(board, x, y, piece).isValid) {
            return true
          }
        }
      }
    }

    return false
  }

  onGiveUp(roomId: string, sessionId: string) {
    const room = this.getRoom(roomId)

    if (room.winner != null) {
      throw new Error("A partida já foi finalizada")
    }

    const winner = room.players.find(player => player.sessionId !== sessionId) as Player

    room.winner = winner

    return room
  }

  onDisconnect(sessionId: string, roomId: string) {
    const room = this.getRoom(roomId)

    const player = room.players.find(player => player.sessionId === sessionId)

    if (player != null) {
      player.connected = false
    }

    if (room.players.every(player => !player.connected)) {
      this.deleteRoom(roomId)
    }
  }
}

export const game = new Game()
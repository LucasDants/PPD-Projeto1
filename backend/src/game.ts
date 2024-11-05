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
  started: boolean
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
        started: false
      })
    }
  }

  getRoom(roomId: string) {
    return this.rooms.find(room => room.id === roomId) as Room
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

    room.started = true

    return room
  }

  onGameMove(roomId: string, sessionId: string, move: { x: number, y: number }) {
    const room = this.getRoom(roomId)
    const player = this.getUserByRoom(room, sessionId)

    if (room.currentTurnPlayer.sessionId !== sessionId) {
      throw new Error("Não é o seu turno")
    }

    if (room.started === false) {
      throw new Error("A partida ainda não começou")
    }

    const opponent = this.getOpponentByRoom(room, sessionId) as Player
    const piece = room.currentTurnPlayer.piece

    const { isValid, newBoard } = this.isValidMove(room.board, move.x, move.y, piece)

    if (isValid) {
      room.board = newBoard
      room.board[move.y][move.x] = piece
      room.currentTurnPlayer = opponent;

      return { newTurn: true, room, nextTurnPlayer: room.currentTurnPlayer, message: "" }
    }

    return { newTurn: false, room, currentTurnPlayer: room.currentTurnPlayer, nextTurnPlayer: room.currentTurnPlayer, message: "Movimento inválido" }
  }

  isValidMove(board: Piece[][], x: number, y: number, piece: Piece) {
    const newBoard = board.map(arr => arr.slice())

    if (board[x][y] !== Piece.NONE) {
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
    let nx = x + dx, ny = y + dy;

    while (this.isInBounds(nx, ny) && board[nx][ny] && board[nx][ny] !== piece && board[nx][ny] !== Piece.NONE) {
      captured.push([nx, ny]);
      nx += dx;
      ny += dy;
    }
    console.log(captured)
    if (this.isInBounds(nx, ny) && board[nx][ny] === piece) {
      for (let [cx, cy] of captured) {
        board[cx][cy] = piece;
      }
      return captured.length > 0;
    }
    return false;
  }

  isInBounds(x: number, y: number) {
    return x >= 0 && x < BOARD.length && y >= 0 && y < BOARD[0].length;
  }

  onDisconnect(sessionId: string) {
    this.rooms.forEach(room => {
      room.players.forEach(player => {
        if (player.sessionId === sessionId) {
          player.connected = false
        }
      })
    })
  }
}

export const game = new Game()
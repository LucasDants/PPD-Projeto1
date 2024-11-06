import { app, io } from "./app";
import { game, Piece } from "./game";

io.use((socket, next) => {
  const roomId: string = socket.handshake.auth.roomId ?? ''
  const sessionId: string = socket.handshake.auth.sessionId ?? ''

  try {
    game.joinOrCreateRoom({ roomId, sessionId, socketId: socket.id })

    socket.data.roomId = roomId
    socket.data.sessionId = sessionId

    return next()
  } catch (err) {
    return next(err as Error)
  }
})

io.on('connection', socket => {
  const room = game.getRoom(socket.data.roomId)
  const opponent = game.getOpponentByRoom(room, socket.data.sessionId)
  const player = game.getUserByRoom(room, socket.data.sessionId)

  socket.emit('message', {
    role: 'system',
    content: 'Bem vindo a Sala ' + socket.data.roomId + `! Jogador ${socket.data.sessionId} sua peça é a ` + Piece[player?.piece ?? 0]
  })

  if (room.players.length === 1) {
    socket.emit('message', {
      role: 'system',
      content: 'Aguardando oponente conectar...'
    })
  }

  if (room.players.length === 1) {
    socket.emit('message', {
      role: 'system',
      content: 'Aguardando oponente conectar...'
    })
  }

  if (room.players.length === 2) {
    socket.emit('message', {
      role: 'system',
      content: 'Oponente conectado! Iniciando partida...'
    })
    game.onStartGame(room.id)
  }

  socket.emit('room', room)

  if (opponent != null) {
    socket.to(opponent?.socketId).emit('message', { content: `Jogador adversário entrou na partida!`, role: 'opponent' })
  }

  // listeners
  socket.on('message', (message: string) => {
    const opponent = game.getOpponent(socket.data.roomId, socket.data.sessionId)

    if (opponent == null) {
      return
    }

    socket.to(opponent?.socketId).emit('message', { content: message, role: 'opponent' })
  })

  socket.on('play', ({ x, y }) => {

    try {
      const { newTurn, room: newRoom, nextTurnPlayer, message } = game.onGameMove(room.id, socket.data.sessionId, { x, y })

      if (newTurn) {
        socket.to(nextTurnPlayer.socketId).emit('message', { content: `Sua vez de jogar!`, role: 'system' })
        socket.emit('room', newRoom)
        socket.to(nextTurnPlayer.socketId).emit('room', room)
      } else {
        socket.emit('message', { content: message, role: 'system' })
      }

    } catch (err) {
      socket.emit('message', { content: (err as Error).message, role: 'system' })
    }
  })

  socket.on('disconnect', () => {
    const opponent = game.getOpponent(socket.data.roomId, socket.data.sessionId)

    if (opponent != null) {
      socket.to(opponent.socketId).emit('message', { content: `Jogador adversário saiu da partida!`, role: 'opponent' })
    }

    game.onDisconnect(socket.data.sessionId)

  })
})

app.listen({ port: 3333, host: '0.0.0.0' }, () => console.log("🚀 HTTP Server is running on port 3333"))
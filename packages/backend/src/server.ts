import { app, io } from "./app";
import { game, Piece, Player } from "./game";

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
  console.log('connected', socket.data.sessionId)
  const room = game.getRoom(socket.data.roomId)
  const opponent = game.getOpponentByRoom(room, socket.data.sessionId)
  const player = game.getUserByRoom(room, socket.data.sessionId)

  game.connectUser(socket.data.roomId, socket.data.sessionId)


  socket.emit('message', {
    role: "system",
    content: 'Bem vindo a Sala ' + socket.data.roomId + `! Jogador ${socket.data.sessionId} sua peça é a ` + Piece[player?.piece ?? 0]
  })

  if (room.players.length === 1) {
    socket.emit('message', {
      role: "system",
      content: 'Aguardando oponente conectar...'
    })
  }

  if (room.players.length === 2) {
    socket.emit('message', {
      role: "system",
      content: 'Oponente conectado! Iniciando partida...'
    })
    game.onStartGame(room.id)
  }

  socket.emit('room', room)

  if (opponent != null) {
    socket.to(opponent?.socketId).emit('message', { content: `Jogador adversário entrou na partida!`, role: "system" })
    socket.to(opponent?.socketId).emit('room', room)
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
      const { newTurn, room: newRoom, nextTurnPlayer, message, winner, skipOpponentTurn } = game.onGameMove(room.id, socket.data.sessionId, { x, y })
      const opponent = game.getOpponentByRoom(newRoom, socket.data.sessionId) as Player
      if (newTurn) {
        socket.emit('room', newRoom)
        socket.to(opponent?.socketId).emit('room', newRoom)

        if (skipOpponentTurn) {
          socket.to(opponent?.socketId).emit('message', { content: `Você não tem jogadas disponiveis, seu adversário irá jogar novamente!`, role: "system" })
          socket.emit('message', { content: `Adversário sem jogadas, jogue novamente!`, role: "system" })
        } else {
          console.log('socket', nextTurnPlayer)
          socket.to(nextTurnPlayer.socketId).emit('message', { content: `Sua vez de jogar!`, role: "system" })
        }

      } else {
        if (winner != null) {
          const opponent = game.getOpponent(socket.data.roomId, socket.data.sessionId) as Player

          socket.emit('gameEnd', newRoom)
          socket.to(opponent?.socketId).emit('gameEnd', newRoom)


          // socket.emit('message', { content: message, role: 'system' })
          // socket.to(opponent.socketId).emit('message', { content: message, role: 'system' })
        } else {
          socket.emit('message', { content: message, role: "system" })
        }
      }

    } catch (err) {
      socket.emit('message', { content: (err as Error).message, role: "system" })
    }
  })

  socket.on('giveup', () => {
    const room = game.getRoom(socket.data.roomId)
    const opponent = game.getOpponentByRoom(room, socket.data.sessionId) as Player

    game.onGiveUp(room.id, socket.data.sessionId)

    // socket.emit('message', { content: "Jogo finalizado!", role: 'system' })
    // socket.to(opponent?.socketId).emit('message', { content: "Jogo finalizado!", role: 'system' })

    socket.emit('gameEnd', room)
    socket.to(opponent?.socketId).emit('gameEnd', room)

  })

  socket.on('disconnect', () => {
    console.log('disconnect', socket.data.sessionId)
    const opponent = game.getOpponent(socket.data.roomId, socket.data.sessionId)

    if (opponent != null) {
      socket.to(opponent.socketId).emit('message', { content: `Jogador adversário saiu da partida!`, role: "system" })
    }

    game.onDisconnect(socket.data.sessionId, socket.data.roomId)

  })
})

app.listen({ port: 3333, host: '0.0.0.0' }, () => console.log("🚀 HTTP Server is running on port 3333"))
import { app, io } from "./app";

type Room = {
  id: string
  players: [string, string] | [string]
}

const rooms: Room[] = []

io.use((socket, next) => {
  const roomId: string = socket.handshake.auth.roomId ?? ''
  const sessionId: string = socket.handshake.auth.sessionId ?? ''

  if (sessionId === '') {
    return next(new Error("Invalid User"))
  }

  if (roomId === '') {
    return next(new Error("Invalid Room"))
  }

  let room = rooms.find(room => room.id === roomId)

  if (room != null) {
    if (room.players.length === 2) {
      if (!room.players.includes(sessionId)) {
        return next(new Error("Room is full"))
      }
    }

    if (room.players.length < 2) {
      room.players.push(sessionId)
    }

  } else {
    rooms.push({
      id: roomId,
      players: [sessionId]
    })
  }

  socket.roomId = roomId
  socket.sessionId = sessionId

  return next()
})

io.on('connection', socket => {
  console.log(socket.handshake.auth)
  console.log(rooms)
})

app.listen({ port: 3333, host: '0.0.0.0' }, () => console.log("🚀 HTTP Server is running on port 3333"))
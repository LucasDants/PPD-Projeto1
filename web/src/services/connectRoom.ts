import { socket } from "./socket"

type Props = {
  roomId: string
  sessionId: string
}

export function connectRoom({ roomId, sessionId }: Props) {
  socket.auth = { roomId, sessionId }
  socket.connect()
}



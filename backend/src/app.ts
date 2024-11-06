import { createServer } from 'http';
import { Server } from 'socket.io';
import { Room } from './game';

interface ServerToClientEvents {
  message: (message: {
    role: 'system' | 'user' | 'opponent'
    content: string
  }) => void

  room: (room: Room) => void
  gameEnd: (data: { winnerSessionId: string }) => void
}

interface ClientToServerEvents {
  message: (message: string) => void
  play: ({ x, y }: { x: number, y: number }) => void
  giveup: () => void
}

interface InterServerEvents {
}

interface SocketData {
  sessionId: string
  roomId: string
}

export const app = createServer()

export const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>(app, {
  cors: {
    origin: 'http://localhost:5173'
  }
})
import { createServer } from 'http';
import { Server } from 'socket.io';

export const app = createServer()

export const io = new Server(app, {
  cors: {
    origin: 'http://localhost:5173'
  }
})
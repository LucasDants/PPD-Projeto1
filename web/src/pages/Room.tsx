import { Board } from "@/components/Board";
import { Chat } from "@/components/chat";
import { Piece } from "@/constants";

import { connectRoom } from "@/services/connectRoom";
import { socket } from "@/services/socket";
import { getSessionId } from "@/utils/getSessionId";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

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

export default function Room() {
  const [room, setRoom] = useState<Room | null>(null)
  const { roomId } = useParams()


  const navigate = useNavigate()

  useEffect(() => {
    if (roomId == null || roomId === '') {
      return
    }

    function onConnectError() {
      navigate('/', { replace: true })
    }

    socket.on("connect_error", onConnectError);
    socket.on('room', (room: Room) => { setRoom(room) })
    socket.on('gameEnd', (winner: { winnerSessionId: string }) => {
      if (winner.winnerSessionId === getSessionId()) {
        alert('Você venceu!')
      } else {
        alert('Você perdeu!')
      }
    })

    if (!socket.connected) {
      connectRoom({ roomId, sessionId: getSessionId() })
    }

    return () => {
      socket.disconnect()
      socket.off('room')
      socket.off("connect_error", onConnectError);
    }
  }, [roomId, navigate])

  return (
    <div className="flex flex-1 h-screen justify-center">
      <Chat />
      <Board board={room?.board} />
    </div>
  )
}



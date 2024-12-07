import { Board } from "@/components/Board";
import { Chat } from "@/components/chat";
import { EndGameDialog } from "@/components/EndGameDialog";
import { Piece } from "@/constants";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

import { connectRoom } from "@/services/connectRoom";
import { socket } from "@/services/socket";
import { getSessionId } from "@/utils/getSessionId";
import { useEffect, useMemo, useState } from "react";
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
  startedAt: string | null
  winner: Player | null
}

export default function Room() {
  const [isEnded, setIsEnded] = useState(false)
  const [room, setRoom] = useState<Room | null>(null)
  const { roomId } = useParams()
  const { toast } = useToast()

  const sessionId = useMemo(() => getSessionId(roomId as string), [roomId])
  const piece = room?.players.find(player => player.sessionId === sessionId)?.piece

  const navigate = useNavigate()

  console.log(room)
  useEffect(() => {
    if (roomId == null || roomId === '') {
      return
    }

    function onConnectError(err: Error) {
      toast({ title: 'Error connecting to room', description: err.message, variant: 'destructive' })
      navigate('/', { replace: true })
    }

    socket.on("connect_error", onConnectError);
    socket.on('room', (room: Room) => { setRoom(room) })
    socket.on('gameEnd', (room: Room) => {
      setRoom(room)
      setIsEnded(true)
    })
    console.log(socket.connected)
    if (!socket.connected) {
      connectRoom({ roomId, sessionId: sessionId })
    }

    return () => {
      socket.off('room')
      socket.off("connect_error", onConnectError);
      setIsEnded(false)
    }
  }, [roomId, sessionId, toast, navigate])

  console.log(room?.winner)
  return (
    <div className="flex flex-1 h-screen justify-center">
      <Chat piece={piece} />
      <Board board={room?.board} className={cn("", room?.currentTurnPlayer.sessionId === sessionId ? "" : "pointer-events-none")} />
      <EndGameDialog isOpen={isEnded} board={room?.board} roomId={roomId as string} winner={room?.winner} />
    </div>
  )
}



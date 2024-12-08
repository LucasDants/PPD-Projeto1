import { Board } from "@/components/Board";
import { Chat } from "@/components/chat";
import { EndGameDialog } from "@/components/EndGameDialog";
import { Piece } from "@/constants";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

import { trpc } from "@/services/trpc";
import { getSessionId } from "@/utils/getSessionId";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Room as RoomType } from "../../../backend/src/game";

export type Player = {
  sessionId: string
  connected: boolean
  piece: Piece
}

export default function Room() {
  const [isEnded, setIsEnded] = useState(false)
  const [room, setRoom] = useState<RoomType | null>(null)
  const { roomId } = useParams()
  const { toast } = useToast()

  const sessionId = useMemo(() => getSessionId(roomId as string), [roomId])
  const piece = room?.players.find(player => player.sessionId === sessionId)?.piece

  const navigate = useNavigate()

  useEffect(() => {
    if (roomId == null || sessionId === '') {
      return
    }

    trpc.joinRoom.mutate({roomId, sessionId})

       const sub = trpc.onGameChange.subscribe({roomId, sessionId},  {
        context: { roomId, sessionId },
        onData(data) {
         setRoom(data.room)

          if(data.room.winner) {
            setIsEnded(true)
          }
        },
        onError(err) {
          console.error("error", err);
        },
      })

    return () => {
      sub.unsubscribe()
       setIsEnded(false)
    };
  }, [roomId, sessionId, toast, navigate])

  return (
    <div className="flex flex-1 h-screen justify-center">
      <Chat piece={piece} />
      <Board board={room?.board} className={cn("", room?.currentTurnPlayer.sessionId === sessionId ? "" : "pointer-events-none")} />
      <EndGameDialog isOpen={isEnded} board={room?.board} roomId={roomId as string} winner={room?.winner} />
    </div>
  )
}



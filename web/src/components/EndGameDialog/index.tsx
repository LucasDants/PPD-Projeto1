
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Piece } from "@/constants"
import { cn } from "@/lib/utils"
import { Player, Room } from "@/pages/Room"
import { socket } from "@/services/socket"
import { getSessionId } from "@/utils/getSessionId"
import { XIcon } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { INITIAL_BOARD } from "../Board"
import { BoardPiece } from "../Board/piece"

type Props = {
  isOpen: boolean
  roomId: string
  board?: Room["board"]
  winner?: Player | null
}

export function EndGameDialog({ isOpen, board = INITIAL_BOARD, roomId, winner }: Props) {
  const navigate = useNavigate()

  const sessionId = getSessionId(roomId)
  const isWinner = winner?.sessionId === sessionId
  const blackPieces = board?.flat().filter(piece => piece === Piece.BLACK).length
  const whitePieces = board?.flat().filter(piece => piece === Piece.WHITE).length

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md space-y-8">
        <DialogHeader>
          <DialogTitle className={cn("text-center text-6xl text-primary", !isWinner ? "text-red-500" : "")}>{isWinner ? "Você venceu!" : "Você perdeu!"}</DialogTitle>
        </DialogHeader>
        <div className="flex items-center justify-center space-x-2">
          <Button className="p-2 w-20 h-20 disabled:opacity-100 relative" size="icon" type="button" disabled>
            <BoardPiece piece={Piece.WHITE} />
            <span className="absolute self-center text-xl">{whitePieces}</span>
            <span className="sr-only">Piece {Piece[1]}</span>
          </Button>
          <XIcon className="w-8 h-8" />
          <Button className="p-2 w-20 h-20 disabled:opacity-100 relative" size="icon" type="button" disabled>
            <BoardPiece piece={Piece.BLACK} />
            <span className="absolute self-center text-xl text-white">{blackPieces}</span>
            <span className="sr-only">Piece {Piece[2]}</span>
          </Button>
        </div>
        <DialogFooter className="justify-center">
          <Button className="w-full" type="button" variant="secondary" onClick={() => {
            socket.disconnect()
            navigate('/')
          }}>
            Sair
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

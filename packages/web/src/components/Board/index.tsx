import { Piece } from "@/constants"
import { cn } from "@/lib/utils"
import { trpc } from "@/services/trpc"
import { getSessionId } from "@/utils/getSessionId"
import { useMemo } from "react"
import { useParams } from "react-router-dom"
import { SquareButton } from "./square-button"


type Props = React.HTMLAttributes<HTMLDivElement> & {
  board?: Piece[][]
}

export const INITIAL_BOARD = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 1, 2, 0, 0, 0],
  [0, 0, 0, 2, 1, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
]

export function Board({ board = INITIAL_BOARD, className, ...rest }: Props) {
  const { roomId } = useParams() as { roomId: string }
  const sessionId = useMemo(() => getSessionId(roomId as string), [roomId])

  function handleSendMove(x: number, y: number) {
    trpc.play.mutate({ x, y, roomId, sessionId })
  }

  return (
    <main className={cn("grid grid-rows-8 grid-cols-8 gap-1 w-[100vh] h-max max-h-full py-4 px-6 aspect-square", className)} {...rest}>
      {board.map((row, rowIndex) => row.map((piece, colIndex) =>
        <SquareButton
          x={rowIndex}
          y={colIndex}
          piece={piece}
          key={String(rowIndex) + colIndex}
          onClick={() => handleSendMove(colIndex, rowIndex)} />
      ))}
    </main>
  )
}
import { Piece } from "@/constants"
import { cn } from "@/lib/utils"
import { socket } from "@/services/socket"
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

  function handleSendMove(x: number, y: number) {
    socket.emit("play", { x, y })
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
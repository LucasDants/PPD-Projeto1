import { cn } from "@/lib/utils"
import { SquareButton } from "./square-button"


type Props = React.HTMLAttributes<HTMLDivElement> & {

}

const board = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 1, 2, 0, 0, 0],
  [0, 0, 0, 2, 1, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
]

export function Board({ className, ...rest }: Props) {

  return (
    <main className={cn("grid grid-rows-8 grid-cols-8 gap-1 h-screen w-[100vh] py-4 px-6", className)} {...rest}>
      {board.map((row, rowIndex) => row.map((piece, colIndex) => <SquareButton className="w-full h-full" piece={piece} key={String(rowIndex) + colIndex}></SquareButton>))}
    </main>
  )
}
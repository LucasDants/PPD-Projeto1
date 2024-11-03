import { Piece } from "@/constants"
import { cn } from "@/lib/utils"
import { cva } from "class-variance-authority"

type Props = {
  piece: Piece
}

const pieceVariants = cva(
  "",
  {
    variants: {
      variant: {
        [Piece.NONE]:
          "bg-transparent",
        [Piece.WHITE]:
          "bg-gradient-to-r from-zinc-50 via-zinc-200 to-zinc-50",
        [Piece.BLACK]:
          "bg-gradient-to-r from-zinc-600 via-zinc-900 to-zinc-600",
      },
    },
    defaultVariants: {
      variant: Piece.NONE,
    },
  }
)

export function BoardPiece({ piece }: Props) {
  return (
    <div className={cn('w-full h-full rounded-full', pieceVariants({ variant: piece }))} />
  )
}
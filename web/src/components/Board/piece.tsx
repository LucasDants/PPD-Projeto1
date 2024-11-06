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
          "opacity-0",
        [Piece.WHITE]:
          "opacity-100",
        [Piece.BLACK]:
          "opacity-100",
      },
    },
    defaultVariants: {
      variant: Piece.NONE,
    },
  }
)

export function BoardPiece({ piece }: Props) {
  return (
    <div className={cn(
      'w-full h-full rounded-full transition-all duration-1000',
      'bg-gradient-to-br from-zinc-900 via-zinc-600 to-zinc-50',
      pieceVariants({ variant: piece }),
    )}
      style={{
        backgroundSize: "400% 400%",
        backgroundPosition: piece === Piece.WHITE ? "100% 100%" : ""
      }}
    />
  )
}
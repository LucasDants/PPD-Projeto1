import { Piece } from "@/constants";
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";
import { Button, ButtonProps } from "../ui/button";
import { BoardPiece } from "./piece";

type Props = ButtonProps & {
  piece: Piece
}

const squareButtonVariants = cva(
  "",
  {
    variants: {
      variant: {
        [Piece.NONE]:
          "",
        [Piece.WHITE]:
          "disabled:pointer-events-none disabled:opacity-100",
        [Piece.BLACK]:
          "disabled:pointer-events-none disabled:opacity-100",
      },
    },
    defaultVariants: {
      variant: Piece.NONE,
    },
  }
)

export function SquareButton({ piece, className, ...rest }: Props) {
  return (
    <Button className={cn("w-full h-full p-2.5", squareButtonVariants({ variant: piece }), className)} disabled {...rest}>
      <BoardPiece piece={piece} />
    </Button>
  )
}
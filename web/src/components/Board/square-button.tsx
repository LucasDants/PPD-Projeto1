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
          "disabled:pointer-events-none",
        [Piece.BLACK]:
          "disabled:pointer-events-none",
      },
    },
    defaultVariants: {
      variant: Piece.NONE,
    },
  }
)

export function SquareButton({ piece, className, ...rest }: Props) {
  const isDisabled = piece !== Piece.NONE

  return (
    <Button className={cn("w-full h-full p-2.5 disabled:opacity-100", squareButtonVariants({ variant: piece }), className)} disabled={isDisabled} {...rest}>
      <BoardPiece piece={piece} />
    </Button>
  )
}
import { LogOut, Send } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

import { Input } from "@/components/ui/input"
import { Piece } from "@/constants"
import { trpc } from "@/services/trpc"
import { getSessionId } from "@/utils/getSessionId"
import { useNavigate, useParams } from "react-router-dom"
import { BoardPiece } from "./Board/piece"

type Props = React.HTMLAttributes<HTMLDivElement> & {
  piece?: Piece
}

type Message = {
  sessionId: string | null
  role: "player" | "system"
  content: string
}

export function Chat({ className, piece, ...rest }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const { roomId } = useParams() as { roomId: string }
  const chatRef = useRef<HTMLDivElement>(null)
  
  const inputLength = input.trim().length
  const navigate = useNavigate()

  const sessionId = getSessionId(roomId as string)

  function handleGiveUp() {
    navigate('/')
    trpc.giveUp.mutate({roomId, sessionId})
  }

  function handleSubmitMessage(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (inputLength === 0) return
    setMessages([
      ...messages,
      {
        sessionId: sessionId,
        role: "player",
        content: input,
      },
    ])

    trpc.message.mutate({message: input, roomId, sessionId})
    setInput("")
  }

  useEffect(() => {
    const sub = trpc.onGameChange.subscribe({roomId, sessionId},  {
        onData(data) {
          setMessages(data.room.messages)
        },
        onError(err) {
          console.error("error", err);
        },
      })

    return () => {
      sub.unsubscribe()
    };
  }, []);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current?.scrollHeight + 20;
    }
  }, [messages])

  return (
    <Card className={cn("h-screen flex flex-col rounded-none", className)} {...rest}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <p className="text-sm font-medium leading-none">Othello</p>
          <p className="text-sm text-muted-foreground">Sala {roomId}</p>
        </div>
        <div className="flex flex-row items-center space-x-4">
          {piece != null &&
            <Button className="p-1 disabled:opacity-100" size="icon" type="button" onClick={handleGiveUp} disabled>
              <BoardPiece piece={piece} />
              <span className="sr-only">Piece {Piece[piece]}</span>
            </Button>
          }
          <Button size="icon" variant="destructive" type="button" onClick={handleGiveUp}>
            <LogOut className="h-4 w-4" />
            <span className="sr-only">GiveUp</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-scroll" ref={chatRef}>
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                "flex w-max max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm",
                message.sessionId === sessionId && "ml-auto bg-primary text-primary-foreground",
                message.role === "system" && "w-full max-w-[90%] mx-auto bg-[#2563EB] text-[#0f172a] text-center",
                message.sessionId !== sessionId && message.role !== 'system' && "bg-muted"
              )}
            >
              {message.content}
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <form
          onSubmit={handleSubmitMessage}
          className="flex w-full items-center space-x-2 pt-2"
        >
          <Input
            id="message"
            placeholder="Type your message..."
            className="flex-1"
            autoComplete="off"
            value={input}
            onChange={(event) => setInput(event.target.value)}
          />
          <Button type="submit" size="icon" disabled={inputLength === 0}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
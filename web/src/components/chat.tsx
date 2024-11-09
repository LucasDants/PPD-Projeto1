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
import { socket } from "@/services/socket"
import { useNavigate, useParams } from "react-router-dom"
import { BoardPiece } from "./Board/piece"

type Props = React.HTMLAttributes<HTMLDivElement> & {
  piece?: Piece
}

type Message = {
  role: "user" | "opponent" | "system"
  content: string
}

export function Chat({ className, piece, ...rest }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const { roomId } = useParams()
  const chatRef = useRef<HTMLDivElement>(null)

  const inputLength = input.trim().length
  const navigate = useNavigate()

  function handleGiveUp() {
    navigate('/')
    socket.emit('giveup')
    socket.disconnect()
  }

  function handleSubmitMessage(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (inputLength === 0) return
    setMessages([
      ...messages,
      {
        role: "user",
        content: input,
      },
    ])

    socket.emit("message", input)
    setInput("")
  }

  useEffect(() => {
    socket.on('message', (message: Message) => {
      console.log(message)
      setMessages(messages => [...messages, message]);
    });

    return () => {
      socket.off('message');
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
                message.role === "user"
                  ? "ml-auto bg-primary text-primary-foreground"
                  : message.role === "system" ? "w-full max-w-[90%] mx-auto bg-[#2563EB] text-[#0f172a] text-center" : "bg-muted"
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
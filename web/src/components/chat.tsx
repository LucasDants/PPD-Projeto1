import { Send } from "lucide-react"
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
import { socket } from "@/services/socket"
import { useParams } from "react-router-dom"

type Message = {
  role: "user" | "opponent" | "system"
  content: string
}

export function Chat({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const { roomId } = useParams()
  const chatRef = useRef<HTMLDivElement>(null)

  const inputLength = input.trim().length

  function onSubmitMessage(e: React.FormEvent<HTMLFormElement>) {
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
      <CardHeader className="flex flex-row items-center">
        <div className="flex items-center space-x-4">
          <div>
            <p className="text-sm font-medium leading-none">Othello</p>
            <p className="text-sm text-muted-foreground">Sala {roomId}</p>
          </div>
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
                  : message.role === "system" ? "w-full max-w-[90%] mx-auto bg-[#2563EB] text-[#F8FAFC] text-center" : "bg-muted"
              )}
            >
              {message.content}
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <form
          onSubmit={onSubmitMessage}
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
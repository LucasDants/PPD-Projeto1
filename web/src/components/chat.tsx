import { Send } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

import { Input } from "@/components/ui/input"
import { useParams } from "react-router-dom"

const messagesMock = [
  {
    role: "agent",
    content: "Hi, how can I help you today?",
  },
  {
    role: "user",
    content: "Hey, I'm having trouble with my account.",
  },
  {
    role: "agent",
    content: "What seems to be the problem?",
  },
  {
    role: "user",
    content: "I can't log in.",
  },
]

export function Chat({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  const [messages, setMessages] = useState(messagesMock)
  const [input, setInput] = useState("")
  const inputLength = input.trim().length

  const { roomId } = useParams()

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
      <CardContent className="flex-1 overflow-y-scroll">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                "flex w-max max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm",
                message.role === "user"
                  ? "ml-auto bg-primary text-primary-foreground"
                  : "bg-muted"
              )}
            >
              {message.content}
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            if (inputLength === 0) return
            setMessages([
              ...messages,
              {
                role: "user",
                content: input,
              },
            ])
            setInput("")
          }}
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
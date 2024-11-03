import { Board } from "@/components/Board";
import { Chat } from "@/components/chat";



export default function Room() {

  return (
    <div className="flex flex-1 h-screen justify-center">
      <Chat />
      <Board />
    </div>
  )
}



import { LoginForm, LoginFormElements } from "@/components/login-form"
import { connectRoom } from "@/services/connectRoom"
import { getSessionId } from "@/utils/getSessionId"
import { useNavigate } from "react-router-dom"

export default function Home() {
  const navigate = useNavigate()

  function handleJoinBoard(e: React.FormEvent<LoginFormElements>) {
    e.preventDefault()

    const roomId = e.currentTarget.elements.room.value
    const sessionId = getSessionId()

    connectRoom({ roomId, sessionId })

    navigate(`/${roomId}`)
  }

  return (
    <form className="flex h-screen w-full items-center justify-center px-4" onSubmit={handleJoinBoard}>
      <LoginForm />
    </form>
  )
}



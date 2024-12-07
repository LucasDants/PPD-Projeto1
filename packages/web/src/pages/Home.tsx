import { LoginForm, LoginFormElements } from "@/components/login-form"
import { useRef } from "react"
import { useNavigate } from "react-router-dom"

export default function Home() {
  const navigate = useNavigate()

  const roomIdRef = useRef({ roomId: '' })

  function handleJoinBoard(e: React.FormEvent<LoginFormElements>) {
    e.preventDefault()

    const roomId = e.currentTarget.elements.room.value

    roomIdRef.current.roomId = roomId

    navigate(`/${roomIdRef.current.roomId}`)
  }

  return (
    <form className="flex h-screen w-full items-center justify-center px-4" onSubmit={handleJoinBoard}>
      <LoginForm />
    </form>
  )
}



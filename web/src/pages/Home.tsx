import { LoginForm, LoginFormElements } from "@/components/login-form"
import { useNavigate } from "react-router-dom"

export default function Home() {
  const navigate = useNavigate()

  function handleJoinBoard(e: React.FormEvent<LoginFormElements>) {
    e.preventDefault()

    // const name = e.currentTarget.elements.name.value
    const roomId = e.currentTarget.elements.room.value

    navigate(`/${roomId}`)
  }

  return (
    <form className="flex h-screen w-full items-center justify-center px-4" onSubmit={handleJoinBoard}>
      <LoginForm />
    </form>
  )
}



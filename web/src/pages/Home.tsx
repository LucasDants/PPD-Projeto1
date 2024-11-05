import { LoginForm, LoginFormElements } from "@/components/login-form"
import { useToast } from "@/hooks/use-toast"
import { connectRoom } from "@/services/connectRoom"
import { socket } from "@/services/socket"
import { getSessionId } from "@/utils/getSessionId"
import { useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"

export default function Home() {
  const navigate = useNavigate()
  const { toast } = useToast()

  const roomIdRef = useRef({ roomId: '' })

  function handleJoinBoard(e: React.FormEvent<LoginFormElements>) {
    e.preventDefault()

    const roomId = e.currentTarget.elements.room.value
    const sessionId = getSessionId()

    roomIdRef.current.roomId = roomId

    connectRoom({ roomId, sessionId })
  }

  useEffect(() => {
    function onConnect() {
      navigate(`/${roomIdRef.current.roomId}`)
    }

    function onConnectError(err: Error) {
      console.log(err)
      toast({ title: 'Error connecting to room', description: err.message, variant: 'destructive' })
    }

    socket.on('connect', onConnect);
    socket.on("connect_error", onConnectError);


    return () => {
      socket.off('connect', onConnect);
      socket.off("connect_error", onConnectError);
    };
  }, [navigate, toast]);


  return (
    <form className="flex h-screen w-full items-center justify-center px-4" onSubmit={handleJoinBoard}>
      <LoginForm />
    </form>
  )
}



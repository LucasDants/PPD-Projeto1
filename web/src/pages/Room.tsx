import { Board } from "@/components/Board";
import { Chat } from "@/components/chat";
import { useSocket } from "@/hooks/useSocket";
import { connectRoom } from "@/services/connectRoom";
import { socket } from "@/services/socket";
import { getSessionId } from "@/utils/getSessionId";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function Room() {
  useSocket()
  const { roomId } = useParams()


  const navigate = useNavigate()

  useEffect(() => {
    function onConnect() {
      console.log('connected')
    }

    function onDisconnect() {
      console.log('disconnected')
    }

    function onConnectError() {
      // navigate('/', { replace: true })
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on("connect_error", onConnectError);

    socket.onAny((event, ...args) => {
      console.log(event, args);
    });

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.offAny();
      socket.off("connect_error", onConnectError);
    };
  }, [navigate]);

  useEffect(() => {
    if (roomId == null || roomId === '') {
      return
    }

    if (!socket.connected) {
      getSessionId()
      connectRoom({ roomId, sessionId: getSessionId() })
    }

    return () => {
      socket.disconnect()
    }
  }, [roomId])

  return (
    <div className="flex flex-1 h-screen justify-center">
      <Chat />
      <Board />
    </div>
  )
}



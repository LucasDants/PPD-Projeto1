import { socket } from "@/services/socket";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export function useSocket() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const navigate = useNavigate()

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onConnectError() {
      navigate('/', { replace: true })
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
}
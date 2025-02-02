import { useEffect } from "react";
import { useAuthState } from "../../context/AuthContext";
import { socket } from "../../services/socket/socket";

export const useSetCurrentlyConnected = () => {
  const { userId } = useAuthState();

  useEffect(() => {
    socket.connect();
  }, [userId]);
};

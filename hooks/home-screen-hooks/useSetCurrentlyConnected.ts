import { useEffect } from "react";
import { useAuthState } from "../../AuthContext";
import { socket } from "../../socket";

export const useSetCurrentlyConnected = () => {
  const { userId } = useAuthState();

  useEffect(() => {
    socket.connect();
    socket.emit("setCurrentlyConnected", userId);
  }, [userId]);
};

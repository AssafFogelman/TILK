import { useEffect } from "react";
import { socket } from "./socket";
import { useAuthState } from "../../AuthContext";
import { emit } from "../../APIs/emit";
import { onNewEvent } from "./event-handlers/on-new-event";

export const SocketEvents = ({ children }: { children: React.ReactNode }) => {
  //load websocket event listeners and cleanup
  const { userId } = useAuthState();
  useWebSocketEventsAndDisconnect();
  return <>{children}</>;

  function useWebSocketEventsAndDisconnect() {
    //load websocket event listeners and cleanup
    useEffect(() => {
      //if already connected, run connection function
      if (socket.connected) {
        onConnect();
      }

      function onConnect() {
        console.log("websocket connected!");
        //set as currently connected
        emit(socket, "setCurrentlyConnected", userId);
      }

      // function onDisconnect() {
      //something that should happen if the server goes down
      // }

      //listen to events and run functions accordingly
      socket.on("connect", onConnect);
      // socket.on("disconnect", onDisconnect);
      socket.on("newEvent", onNewEvent);

      return () => {
        //when the component unmounts (the app closes), disconnect the socket and close the event listeners

        //close the event listener "connect"
        socket.off("connect", onConnect);
        //close the event listener "newEvent"
        socket.off("newEvent", onNewEvent);
        //disconnect the socket
        socket.disconnect();

        // socket.off("disconnect", onDisconnect);
      };
    }, []);
  }
};

import { useEffect, useRef } from "react";
import { socket } from "./socket";
import { emit } from "../../APIs/emit";
import { onNewEvent } from "./event-handlers/on-new-event";
import { onMessageDelivered } from "./event-handlers/on-message-delivered";
import { onMessagesRead } from "./event-handlers/on-message-read";
import { getItemAsync } from "expo-secure-store";
import NetInfo from "@react-native-community/netinfo";

const MAX_RECONNECT_ATTEMPTS = 10;
const INITIAL_RETRY_INTERVAL = 2000;

export const SocketEvents = ({ children }: { children: React.ReactNode }) => {
  //websocket event listeners and cleanup
  useEffect(() => {
    //if already connected, and this is the first time the component is mounted, run connection function
    if (socket.connected) {
      onConnect();
    }

    function onDisconnect() {
      //something that should happen if the server goes down
      reconnectToSocket();
    }

    //listen to events and run functions accordingly
    socket.on("connect", onConnect);
    //something that should happen if the server goes down
    socket.on("disconnect", onDisconnect);
    socket.on("newEvent", onNewEvent);
    //the message the user sent was delivered
    socket.on("messageDelivered", onMessageDelivered);
    //the message the user sent was read
    socket.on("messagesRead", onMessagesRead);
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected) {
        connectSocket();
      } else {
        disconnectSocket();
      }
    });
    return () => {
      //when the component unmounts (the app closes), disconnect the socket and close the event listeners

      //close the event listener "connect"
      socket.off("connect", onConnect);
      //close the event listener "newEvent"
      socket.off("newEvent", onNewEvent);
      //remove the event listener "disconnect"
      socket.off("disconnect", onDisconnect);
      //disconnect the socket
      socket.disconnect();

      unsubscribe();
    };
  }, []);

  return <>{children}</>;

  function reconnectToSocket() {
    if (socket.connected) return;

    // attempts count
    let reconnectAttempts = 0;
    let timeoutId: NodeJS.Timeout;

    // Clean up if connection succeeds
    socket.once("connect", () => {
      clearTimeout(timeoutId);
      reconnectAttempts = 0;
    });

    attemptReconnect();

    function attemptReconnect() {
      if (socket.connected || reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        clearTimeout(timeoutId);
        return;
      }
      reconnectAttempts++;
      //each reconnection attempt is 1.5 times longer than the previous one
      const backoffTime =
        INITIAL_RETRY_INTERVAL * Math.pow(1.5, reconnectAttempts - 1);

      console.log(
        `Attempting to reconnect (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`
      );

      socket.connect();

      // Schedule next attempt if this one fails
      timeoutId = setTimeout(attemptReconnect, backoffTime);
    }
  }

  async function onConnect() {
    //set as currently connected
    //there should be a token in the secure store since the socket is established only once the user opens the "Tabs" screen.
    //we send the token instead of userId from the context because the context is too slow, and gives us an empty string instead of the userId.
    const userToken = await getItemAsync("TILK-token");
    if (userToken) {
      emit(
        socket,
        "setCurrentlyConnected",
        userToken,
        (error: Error | null) => {
          if (error) {
            console.error("Failed to authenticate socket:", error);
          } else {
            console.log("websocket (re/)connected!");
          }
        }
      );
    }
  }
};

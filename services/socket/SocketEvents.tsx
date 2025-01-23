import { useEffect, useRef } from "react";
import { socket } from "./socket";
import { emit } from "../../APIs/emit";
import { onNewEvent } from "./event-handlers/on-new-event-client";
import { onMessageDelivered } from "./event-handlers/on-message-delivered";
import { onMessagesRead } from "./event-handlers/on-message-read";
import { getItemAsync } from "expo-secure-store";
import { useAuthState } from "../../AuthContext";
import NetInfo from "@react-native-community/netinfo";
import {
  SetCurrentlyConnectedPayload,
  SetCurrentlyConnectedResponseType,
} from "../../types/types";

const MAX_RECONNECT_ATTEMPTS = 10;
const INITIAL_RETRY_INTERVAL = 2000;

export const SocketEvents = ({ children }: { children: React.ReactNode }) => {
  const { userId } = useAuthState();
  const noInternetRef = useRef(false);
  //websocket event listeners and cleanup
  useEffect(() => {
    //if already connected, and this is the first time the component is mounted, run connection function
    if (socket.connected) {
      onConnect();
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("newEvent", onNewEvent);
    //the message the user sent was delivered
    socket.on("messageDelivered", onMessageDelivered);
    //the message the user sent was read
    socket.on("messagesRead", onMessagesRead);

    //if internet connection is regained, reconnect to the socket
    const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
      // Only proceed if user is logged in
      if (!userId) return;

      if (!state.isConnected) {
        socket.disconnect();
        noInternetRef.current = true;
      } else if (noInternetRef.current) {
        // Reconnect only if we previously lost connection
        reconnectToSocket();
        noInternetRef.current = false;
      }
    });
    //websocket listeners for debugging
    if (process.env.EXPO_PUBLIC_NODE_ENV !== "production") {
      socket.on("reconnect", handleReconnect);
      socket.on("reconnect_attempt", handleReconnectAttempt);
      socket.on("reconnect_error", handleReconnectError);
      socket.on("reconnect_failed", handleReconnectFailed);
      socket.on("ping", handlePing);
      socket.on("pong", handlePong);
    }
    return () => {
      //when the component unmounts (the app closes), disconnect the socket and close the event listeners

      //close the event listener "connect"
      socket.off("connect", onConnect);
      //close the event listener "newEvent"
      socket.off("newEvent", onNewEvent);
      //remove the event listener "disconnect"
      socket.off("disconnect", onDisconnect);
      //remove the debug event listeners
      if (process.env.EXPO_PUBLIC_NODE_ENV !== "production") {
        socket.off("reconnect", handleReconnect);
        socket.off("reconnect_attempt", handleReconnectAttempt);
        socket.off("reconnect_error", handleReconnectError);
        socket.off("reconnect_failed", handleReconnectFailed);
        socket.off("ping", handlePing);
        socket.off("pong", handlePong);
      }
      unsubscribeNetInfo();
      //disconnect the socket
      socket.disconnect();
    };
  }, []);

  return <>{children}</>;

  function reconnectToSocket() {
    if (socket.connected) return;

    // Check internet connectivity before attempting reconnection
    NetInfo.fetch().then((state) => {
      if (!state.isConnected) {
        console.log("Skipping reconnection attempt - No internet connection");
        return;
      }
    });

    // attempts count
    let reconnectAttempts = 0;
    let timeoutId: NodeJS.Timeout;

    // Clean up if connection succeeds
    socket.once("connect", () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
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
    const token = await getItemAsync("TILK-token");
    if (token) {
      emit<SetCurrentlyConnectedResponseType>(
        socket,
        "setCurrentlyConnected",
        { token } as SetCurrentlyConnectedPayload,
        ({ error, response }) => {
          if (error) {
            console.error("Failed to authenticate socket:", error);
          } else {
            console.log("websocket (re/)connected!");
          }
        }
      );
    }
  }

  function onDisconnect(reason: string, details: any) {
    //log why it disconnected
    logSocketStatus(reason, details);

    reconnectToSocket();
    //once the socket is connected, a listener will run the onConnect function
    //and set the user as currently connected.
  }

  function logSocketStatus(reason: string, details: any) {
    console.log("the reason for the disconnection: ", reason);
    console.log(
      "the low-level reason for the disconnection: ",
      details.message
    );
    console.log(
      "some additional description for the disconnection: ",
      details.description
    );
    console.log(
      "some additional context for the disconnection: ",
      details.context
    );
    console.log("Socket state:", {
      connected: socket.connected,
      disconnected: socket.disconnected,
      id: socket.id,
      active: socket.active,
    });
  }

  function handleReconnect(attemptNumber: number) {
    console.log("Socket reconnected after", attemptNumber, "attempts");
  }

  function handleReconnectAttempt(attemptNumber: number) {
    console.log("Reconnection attempt:", attemptNumber);
  }

  function handleReconnectError(error: Error) {
    console.log("Reconnection error:", error);
  }

  function handleReconnectFailed() {
    console.log("Reconnection failed");
  }

  function handlePing() {
    console.log("Ping sent to server");
  }

  function handlePong(latency: number) {
    console.log("Pong received from server. Latency:", latency, "ms");
  }
};

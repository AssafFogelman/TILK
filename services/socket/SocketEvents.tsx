import { useEffect } from "react";
import { socket } from "./socket";
import { onNewEvent } from "./event-handlers/on-new-event-client";
import { onMessageDelivered } from "./event-handlers/on-message-delivered";
import { onMessagesRead } from "./event-handlers/on-message-read";
import { useAuthState } from "../../AuthContext";
import {
  handlePing,
  handlePong,
  handleReconnect,
  handleReconnectAttempt,
  handleReconnectError,
  handleReconnectFailed,
  stateListener,
  useSocketEventsAPIs,
} from "./event-handlers/socket-events-APIs";

export const SocketEvents = ({ children }: { children: React.ReactNode }) => {
  const { userId } = useAuthState();
  const {
    onConnect,
    onDisconnect,
    reconnectToSocket,
    internetRegainedListener,
  } = useSocketEventsAPIs({
    userId,
  });

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
    const unsubscribeNetInfo = internetRegainedListener();
    //websocket listeners for debugging
    if (process.env.EXPO_PUBLIC_NODE_ENV !== "production") {
      socket.on("reconnect", handleReconnect);
      socket.on("reconnect_attempt", handleReconnectAttempt);
      socket.on("reconnect_error", handleReconnectError);
      socket.on("reconnect_failed", handleReconnectFailed);
      socket.on("ping", handlePing);
      socket.on("pong", handlePong);
      socket.on("connecting", stateListener);
      socket.on("reconnecting", stateListener);
    }
    return () => {
      //when the component unmounts (the app closes), disconnect the socket and close the event listeners
      socket.off("connect", onConnect);
      socket.off("newEvent", onNewEvent);
      socket.off("disconnect", onDisconnect);
      if (process.env.EXPO_PUBLIC_NODE_ENV !== "production") {
        socket.off("reconnect", handleReconnect);
        socket.off("reconnect_attempt", handleReconnectAttempt);
        socket.off("reconnect_error", handleReconnectError);
        socket.off("reconnect_failed", handleReconnectFailed);
        socket.off("ping", handlePing);
        socket.off("pong", handlePong);
        socket.off("connecting", stateListener);
        socket.off("reconnecting", stateListener);
      }
      unsubscribeNetInfo();
      //disconnect the socket
      socket.disconnect();
    };
  }, [
    onConnect,
    onDisconnect,
    reconnectToSocket,
    internetRegainedListener,
    userId,
  ]);

  return <>{children}</>;
};

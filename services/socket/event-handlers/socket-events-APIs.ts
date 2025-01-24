import { SetCurrentlyConnectedPayload } from "../../../types/types";
import { useCallback, useRef } from "react";
import { socket } from "../socket";
import NetInfo from "@react-native-community/netinfo";
import { getItemAsync } from "expo-secure-store";
import { SetCurrentlyConnectedResponseType } from "../../../types/types";
import { emit } from "../../../APIs/emit";

const MAX_RECONNECT_ATTEMPTS = 10;
const INITIAL_RETRY_INTERVAL = 2000;
export const useSocketEventsAPIs = ({ userId }: { userId: string }) => {
  const noInternetRef = useRef(false);

  const reconnectToSocket = useCallback(function reconnectToSocket(
    attempt = 1
  ) {
    if (socket.connected || attempt >= MAX_RECONNECT_ATTEMPTS) return;

    //Check internet connectivity before attempting reconnection.
    //when the internet returns, a reconnection will be triggered.
    NetInfo.fetch().then((state) => {
      if (!state.isConnected) {
        console.log("Skipping reconnection attempt - No internet connection");
        return;
      }
    });

    console.log(`reconnecting (${attempt}/${MAX_RECONNECT_ATTEMPTS})`);
    socket.connect();
    const backoffTime = INITIAL_RETRY_INTERVAL * Math.pow(1.5, attempt);
    const timeoutId = setTimeout(
      () => reconnectToSocket(attempt + 1),
      backoffTime
    );
    return () => clearTimeout(timeoutId);
  }, []);

  const onConnect = useCallback(async () => {
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
  }, []);

  const onDisconnect = useCallback(
    (reason: string, details: any) => {
      //log why it disconnected
      logSocketStatus(reason, details);

      reconnectToSocket();
      //once the socket is connected, a listener will run the onConnect function
      //and set the user as currently connected.
    },
    [reconnectToSocket]
  );

  const internetRegainedListener = useCallback(() => {
    return NetInfo.addEventListener((state) => {
      // Only proceed if user is logged in
      if (!userId) return;

      if (!state.isConnected) {
        noInternetRef.current = true;
      } else if (noInternetRef.current) {
        // Reconnect only if we previously lost connection
        noInternetRef.current = false;
        reconnectToSocket();
      }
    });
  }, [reconnectToSocket, userId]);

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

  return {
    reconnectToSocket,
    onConnect,
    onDisconnect,
    internetRegainedListener,
  };
};

export function handleReconnect(attemptNumber: number) {
  console.log("Socket reconnected after", attemptNumber, "attempts");
}

export function handleReconnectAttempt(attemptNumber: number) {
  console.log("Reconnection attempt:", attemptNumber);
}

export function handleReconnectError(error: Error) {
  console.log("Reconnection error:", error);
}

export function handleReconnectFailed() {
  console.log("Reconnection failed");
}

export function handlePing() {
  console.log("Ping sent to server");
}

export function handlePong(latency: number) {
  console.log("Pong received from server. Latency:", latency, "ms");
}

export function stateListener() {
  console.log("=== SOCKET STATE CHANGED ===", {
    connected: socket.connected,
    disconnected: socket.disconnected,
    id: socket.id,
    active: socket.active,
  });
}

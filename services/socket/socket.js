import { io } from "socket.io-client";
// "undefined" means the URL will be computed from the `window.location` object
const URL =
  process.env.EXPO_PUBLIC_NODE_ENV === "production" ||
  process.env.EXPO_PUBLIC_NODE_ENV === "PRODUCTION"
    ? undefined
    : process.env.EXPO_PUBLIC_SERVER_ADDRESS;

//TODO: we will have to see whether setting the URL to undefined in production indeed works
export const socket = io(URL, {
  path: "/ws/",
  autoConnect: false, //do not connect on app startup
  reconnection: true, //try to reconnect if the connection is lost
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000, // max delay for exponential backoff
  timeout: 20000, // Connection timeout
  pingTimeout: 30000, // Time to consider the connection dead
  pingInterval: 25000, // How often to check the connection
  //delivery guarantee method - storing the last received event id
  auth: { lastReceivedEventId: undefined },
});

// debug websocket listeners
if (process.env.EXPO_PUBLIC_NODE_ENV !== "production") {
  socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("Socket disconnected. Reason:", reason);
    console.log("Socket state:", {
      connected: socket.connected,
      disconnected: socket.disconnected,
      id: socket.id,
      active: socket.active,
    });
  });

  socket.on("reconnect", (attemptNumber) => {
    console.log("Socket reconnected after", attemptNumber, "attempts");
  });

  socket.on("reconnect_attempt", (attemptNumber) => {
    console.log("Reconnection attempt:", attemptNumber);
  });

  socket.on("reconnect_error", (error) => {
    console.log("Reconnection error:", error);
  });

  socket.on("reconnect_failed", () => {
    console.log("Reconnection failed");
  });

  socket.on("ping", () => {
    console.log("Ping sent to server");
  });

  socket.on("pong", (latency) => {
    console.log("Pong received from server. Latency:", latency, "ms");
  });
}

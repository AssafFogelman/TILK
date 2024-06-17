import { io } from "socket.io-client";
// "undefined" means the URL will be computed from the `window.location` object
const URL =
  process.env.EXPO_PUBLIC_DEV_OR_PRODUCTION === "production" ||
  process.env.EXPO_PUBLIC_DEV_OR_PRODUCTION === "PRODUCTION"
    ? undefined
    : process.env.EXPO_PUBLIC_SERVER_ADDRESS;

export const socket = io(URL, { path: "/ws/" });

//10.100.102.24?
//127.0.0.1?

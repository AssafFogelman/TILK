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
  autoConnect: false,
  //delivery guarantee method - storing the offset of the last received event
  auth: { offset: undefined },
});

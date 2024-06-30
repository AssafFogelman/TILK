// Import the crypto getRandomValues shim (**BEFORE** the shims)
import "react-native-get-random-values";

// Import the the ethers shims (**BEFORE** ethers)
import "@ethersproject/shims";

// Import the ethers library
import { ethers } from "ethers";

import { StyleSheet, Text, View } from "react-native";
import StackNavigator from "./StackNavigator";
import { UserProvider } from "./UserContext";
import { socket } from "./socket.js";

import axios from "axios";
import { useEffect, useState } from "react";
import { PaperProvider } from "react-native-paper";
import { theme } from "./styles/react-paper-theme";
/* config axios */
axios.defaults.baseURL = process.env.EXPO_PUBLIC_SERVER_ADDRESS;

//! is this ecceptable?!!!!
//!we need a secure storae at any rate..
// axios.interceptors.request.use((config) => {
//   const token = localStoage.getItem("token");
//   if (token) {
//     /*
//         the token exists in local storage,
//         the user logged in.
//         if the token exists then we will add it to header of the request
//     */
//     config.headers["TILK-token"] = token;
//   }
//   return config;
// });

export default function App() {
  const [locationEnabled, setLocationEnabled] = useState(false);

  //connect websocket
  const isConnected = useWebSocketConnect();

  return (
    <>
      <Text>
        user is {isConnected ? "connected" : "disconnected"} to websocket
      </Text>
      <UserProvider>
        <PaperProvider theme={theme}>
          <StackNavigator />
        </PaperProvider>
      </UserProvider>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});

function useWebSocketConnect() {
  const [isConnected, setIsConnected] = useState(false);

  //connect websocket
  useEffect(() => {
    //if already connected, run connection function
    if (socket.connected) {
      onConnect();
    }

    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    // function onFooEvent(value) {
    //   setFooEvents(previous => [...previous, value]);
    // }

    //listen to events and run functions accordingly
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    //    socket.on('foo', onFooEvent);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      // socket.off('foo', onFooEvent);
    };
  }, []);
  return isConnected;
}

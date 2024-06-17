// Import the crypto getRandomValues shim (**BEFORE** the shims)
import "react-native-get-random-values";

// Import the the ethers shims (**BEFORE** ethers)
import "@ethersproject/shims";

// Import the ethers library
import { ethers } from "ethers";

import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import StackNavigator from "./StackNavigator";
import { UserContext } from "./UserContext";
import { socket } from "./socket.js";
import * as Location from "expo-location";
import { AppState } from "react-native";

import axios from "axios";
import { useEffect, useState } from "react";
import { PaperProvider } from "react-native-paper";
import { theme } from "./styles/react-paper-theme";
/* config axios */
axios.defaults.baseURL = process.env.EXPO_PUBLIC_SERVER_ADDRESS;

export default function App() {
  const [locationEnabled, setLocationEnabled] = useState(false);

  //connect websocket
  const isConnected = useWebSocketConnect();

  return (
    <>
      <Text>
        user is {isConnected ? "connected" : "disconnected"} to websocket
      </Text>
      <UserContext>
        <PaperProvider theme={theme}>
          <StackNavigator />
        </PaperProvider>
      </UserContext>
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

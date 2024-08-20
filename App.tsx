// Import the crypto getRandomValues shim (**BEFORE** the shims)
import "react-native-get-random-values";

// Import the the ethers shims (**BEFORE** ethers)
import "@ethersproject/shims";

// Import the ethers library
import { ethers } from "ethers";

import { Text } from "react-native";
import StackNavigator from "./StackNavigator";
import { socket } from "./socket.js";

import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { PaperProvider } from "react-native-paper";
import { theme } from "./styles/react-paper-theme";
import { AuthProvider } from "./AuthContext";
import { ErrorBoundary } from "./components/ErrorBoundary/ErrorBoundary";
import Toast from "react-native-toast-message";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { useTrackLocation } from "./hooks/useTrackLocation";

/* config axios */
axios.defaults.baseURL = process.env.EXPO_PUBLIC_SERVER_ADDRESS;

export default function App() {
  //load websocket events and cleanup
  useWebSocketEventsAndDisconnect();
  //is websocket connected
  const isConnected = useIsWebSocketConnected();
  const {
    startDeviceMotionTracking,
    startLocationTrackingInterval,
    knnDataIsLoading,
    knnDataIsError,
    knnData,
  } = useTrackLocation();

  return (
    <>
      <Text>
        user is {isConnected ? "connected" : "disconnected"} to websocket
      </Text>
      <AuthProvider>
        <ErrorBoundary>
          <PaperProvider theme={theme}>
            <GestureHandlerRootView>
              <NavigationContainer>
                <StackNavigator
                  startDeviceMotionTracking={startDeviceMotionTracking}
                  startLocationTrackingInterval={startLocationTrackingInterval}
                  knnDataIsLoading={knnDataIsLoading}
                  knnDataIsError={knnDataIsError}
                  knnData={knnData}
                />
              </NavigationContainer>
            </GestureHandlerRootView>
          </PaperProvider>
        </ErrorBoundary>
      </AuthProvider>
      <Toast />
    </>
  );
}

//is web socket connected?
function useIsWebSocketConnected() {
  //FIXME - we will remove this functionality in production
  const [isConnected, setIsConnected] = useState(false);
  useEffect(() => {
    //if already connected, run connection function
    if (socket.connected) {
      onConnect();
    }

    function onConnect() {
      setIsConnected(true);
    }
    socket.on("connect", onConnect);
    return () => {
      socket.off("connect", onConnect);
    };
  }, []);
  return isConnected;
}

function useWebSocketEventsAndDisconnect() {
  //load websocket events and cleanup
  useEffect(() => {
    //if already connected, run connection function
    if (socket.connected) {
      onConnect();
    }

    function onConnect() {
      console.log("websocket connected!");
    }

    function onDisconnect() {
      console.log(
        "testing testing - websocket successfully disconnected! delete me!",
      );
      /*TODO - the user needs to send his location and receive data.*/
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
}

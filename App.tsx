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
import { adaptNavigationTheme, PaperProvider } from "react-native-paper";
import { useSetTheme } from "./styles/set-react-paper-theme";
import { AuthProvider } from "./AuthContext";
import { ErrorBoundary } from "./components/error-boundary/ErrorBoundary";
import Toast from "react-native-toast-message";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { useTrackLocation } from "./hooks/useTrackLocation";
import { LocationProvider } from "./LocationContext";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";

/* config axios */
axios.defaults.baseURL = process.env.EXPO_PUBLIC_SERVER_ADDRESS;

const queryClient = new QueryClient();

export default function App() {
  //load websocket listeners and cleanup
  useWebSocketEventsAndDisconnect();
  //is websocket connected
  const isConnected = useIsWebSocketConnected();

  //set theme
  const theme = useSetTheme();

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <SafeAreaView style={{ flex: 1 }}>
            {/* <Text>
              user is {isConnected ? "connected" : "disconnected"} to websocket
            </Text> */}
            <AuthProvider>
              <LocationProvider>
                <PaperProvider theme={theme}>
                  <NavigationContainer theme={theme}>
                    <StackNavigator />
                  </NavigationContainer>
                </PaperProvider>
              </LocationProvider>
            </AuthProvider>
          </SafeAreaView>
        </SafeAreaProvider>
        <Toast />
      </GestureHandlerRootView>
    </ErrorBoundary>
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

    // function onDisconnect() {
    //something that should happen if the server goes down
    // }

    // function onFooEvent(value) {
    //   setFooEvents(previous => [...previous, value]);
    // }

    //listen to events and run functions accordingly
    socket.on("connect", onConnect);
    // socket.on("disconnect", onDisconnect);
    //    socket.on('foo', onFooEvent);

    return () => {
      //close the event listener "connect"
      socket.off("connect", onConnect);

      //when the component unmounts (the app closes), disconnect the socket
      socket.disconnect();

      // socket.off("disconnect", onDisconnect);
      // socket.off('foo', onFooEvent);
    };
  }, []);
}

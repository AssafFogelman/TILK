// Import the crypto getRandomValues shim (**BEFORE** the shims)
import "react-native-get-random-values";

// Import  the ethers shims
import "@ethersproject/shims";

// Import the ethers library
// import { ethers } from "ethers";

import StackNavigator from "./StackNavigator";

import axios from "axios";
import { PaperProvider } from "react-native-paper";
import { useSetTheme } from "./styles/set-react-paper-theme";
import { AuthProvider } from "./AuthContext";
import { ErrorBoundary } from "./components/error-boundary/ErrorBoundary";
import Toast from "react-native-toast-message";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { LocationProvider } from "./LocationContext";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { QueryClientProvider } from "@tanstack/react-query";
import { useReactQueryDevTools } from "@dev-plugins/react-query";
import { queryClient } from "./services/queryClient";
import { SocketEvents } from "./services/socket/SocketEvents";

/* config axios */
axios.defaults.baseURL = process.env.EXPO_PUBLIC_SERVER_ADDRESS;

export default function App() {
  //use tanstack query devtools
  useReactQueryDevTools(queryClient);

  //is websocket connected
  // eslint-disable-next-line @typescript-eslint/no-unused-vars

  //set theme
  const theme = useSetTheme();

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <LocationProvider>
            <SocketEvents>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <SafeAreaProvider>
                  <SafeAreaView style={{ flex: 1 }}>
                    <PaperProvider theme={theme}>
                      <NavigationContainer theme={theme}>
                        <StackNavigator />
                      </NavigationContainer>
                    </PaperProvider>
                  </SafeAreaView>
                </SafeAreaProvider>
                <Toast />
              </GestureHandlerRootView>
            </SocketEvents>
          </LocationProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

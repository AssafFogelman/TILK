import React from "react";
import { View, Text, Button } from "react-native";
import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";
import axios from "axios";
import { reloadAsync } from "expo-updates";

export function ErrorBoundary({ children }: ErrorBoundaryProps) {
  // const { resetState } = useAuthDispatch();

  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={logError}
      onReset={async () => {
        try {
          // restart the app
          await reloadAsync();
        } catch (error) {
          console.log("could not reload: ", error);
        }
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
        Oops! Something went wrong.
      </Text>
      <Text style={{ marginBottom: 20 }}>{error.message}</Text>
      <Button title="Try again" onPress={resetErrorBoundary} />
    </View>
  );
}

//FIXME - doesn't seem to succeed. we may need to test the route with postman
async function logError(error: Error, info: React.ErrorInfo) {
  try {
    await axios.post("/error-log", { error, info });
  } catch (error: any) {
    console.log("error trying to send the app's error to the server: ", error);
    console.log("error.response: ", error.response.data);
  }
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

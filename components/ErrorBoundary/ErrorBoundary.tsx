import React from "react";
import { View, Text, Button } from "react-native";
import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";
import RNRestart from "react-native-restart";
import axios from "axios";

export function ErrorBoundary({ children }: ErrorBoundaryProps) {
  // const { resetState } = useAuthDispatch();

  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={logError}
      onReset={() => {
        // restart the app
        RNRestart.Restart();
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

async function logError(error: Error, info: React.ErrorInfo) {
  try {
    await axios.post("/error", { error, info });
  } catch (error) {
    console.log("error trying to send the app's error to the server");
  }
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

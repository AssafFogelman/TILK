import React, { useContext } from "react";
import { View, Text, Button } from "react-native";
import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";
import RNRestart from "react-native-restart";
import { useAuthDispatch } from "../../AuthContext";

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

function logError(error: Error, info: React.ErrorInfo) {
  // Do something with the error
  // E.g. log to an error logging client here
  console.error("Caught an error:", error, info);
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export function ErrorBoundary({ children }: ErrorBoundaryProps) {
  const { resetState } = useAuthDispatch();

  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={logError}
      onReset={() => {
        resetState();
        // alternatively, restarting the app
        // RNRestart.Restart();
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}

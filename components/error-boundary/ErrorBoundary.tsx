import React from "react";
import { View, Text, Button } from "react-native";
import axios from "axios";
import { reloadAsync } from "expo-updates";

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

type ErrorBoundaryProps = {
  children: React.ReactNode;
};

//ErrorBoundary is a React component that catches errors in its child components and logs them to the server
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    //like useState
    this.state = { hasError: false, error: null };
  }

  //update the state when an error occurs
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  //execute a function once an unhandled error occurs
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.logError(error, info);
  }

  async logError(error: Error, info: React.ErrorInfo) {
    // we cannot simply send the error object to the server, because when it JSON stringifies almost all attributes disappear including  a message, name, and cause.
    try {
      const errorForLogging = {
        message: error.message,
        name: error.name,
        cause: error.cause,
      };
      console.log("errorForLogging: ", errorForLogging);

      await axios.post("/errors", { error: errorForLogging, info });
    } catch (error: any) {
      console.log(
        "error trying to send the app's error to the server: ",
        error
      );
      console.log("error.response: ", error.response.data);
    }
  }

  async handleReset() {
    try {
      await reloadAsync();
    } catch (error) {
      console.log("could not reload: ", error);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
            Oops! Something went wrong.
          </Text>
          <Text style={{ marginBottom: 20 }}>{this.state.error?.message}</Text>
          <Button title="Try again" onPress={() => this.handleReset()} />
        </View>
      );
    }

    return this.props.children;
  }
}

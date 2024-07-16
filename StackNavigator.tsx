import { StyleSheet, View } from "react-native";
import React, {
  createContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import {NavigationContainer, useNavigation} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import HomeScreen from "./screens/HomeScreen";
import FriendsScreen from "./screens/FriendsScreen";
import ChatScreen from "./screens/ChatScreen";
import ChatMessageScreen from "./screens/ChatMessageScreen";
import {
  ACTIONS,
  AuthAction,
  AuthState,
  SignUpType,
  StackParamList,
} from "./types/types";
import WelcomeScreen from "./screens/WelcomeScreen";
import PhoneVerificationScreen from "./screens/PhoneVerificationScreen";
import SelectAvatarScreen from "./screens/SelectAvatarScreen";
import PersonalDetailsScreen from "./screens/PersonalDetailsScreen";
import LookingForScreen from "./screens/LookingForScreen";
import SplashScreen from "./screens/SplashScreen";
import { theme } from "./styles/react-paper-theme";
import { PaperProvider } from "react-native-paper";
import { getItemAsync } from "expo-secure-store";
import { ErrorBoundary } from "./components/ErrorBoundary/ErrorBoundary";
import { useAuthDispatch, useAuthState } from "./AuthContext";

const Stack = createNativeStackNavigator<StackParamList>();

const StackNavigator = () => {
  const {
    chosenPhoto,
    chosenBio,
    chosenTags,
    isAdmin,
    isSignOut,
    isLoading,
    userToken,
    userId,
  } = useAuthState();
  const { signIn, signOut, signUp, resetState } = useAuthDispatch();

  const navigation = useNavigation(); // add this line


  if (isLoading) {
    // We haven't finished checking for the token yet
    return <SplashScreen />;
  }

  return (
      <Stack.Navigator
        initialRouteName={
          chosenPhoto
            ? chosenBio
              ? chosenTags
                ? "Home"
                : "LookingFor"
              : "PersonalDetails"
            : "SelectAvatar"
        }
      >
        {userToken ? (
          <>
            <Stack.Screen
              name="SelectAvatar"
              component={SelectAvatarScreen}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="PersonalDetails"
              component={PersonalDetailsScreen}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="LookingFor"
              component={LookingForScreen}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="Home"
              component={HomeScreen}
              // options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Friends"
              component={FriendsScreen}
              // options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Chats"
              component={ChatScreen}
              // options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Messages"
              component={ChatMessageScreen}
              // options={{ headerShown: false }}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Welcome"
              component={WelcomeScreen}
              options={{
                headerShown: false,
                // When logging out, you will automatically be transferred here with a "pop" animation that feels more intuitive
                animationTypeForReplace: isSignOut ? "pop" : "push",
              }}
            />

            <Stack.Screen
              name="PhoneVerification"
              component={PhoneVerificationScreen}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
  );

  // function authReducer(prevState: AuthState, action: AuthAction) {
  //   switch (action.type) {
  //     case ACTIONS.RESTORE_TOKEN:
  //       return {
  //         ...prevState,
  //         userToken: action.token,
  //         isLoading: false,
  //       };
  //     case ACTIONS.SIGN_IN:
  //       return {
  //         ...prevState,
  //         isSignOut: false,
  //         userToken: action.token,
  //       };
  //     case ACTIONS.SIGN_UP:
  //       return {
  //         ...prevState,
  //         isSignOut: false,
  //         userToken: action.data.userToken,
  //         chosenPhoto: action.data.chosenPhoto,
  //         chosenBio: action.data.chosenBio,
  //         chosenTags: action.data.chosenTags,
  //         isAdmin: action.data.isAdmin,
  //         userId: action.data.userId,
  //       };
  //     case ACTIONS.SIGN_OUT:
  //       return {
  //         ...prevState,
  //         isSignOut: true,
  //         userToken: null,
  //       };
  //   }
  // }
};

export default StackNavigator;

const styles = StyleSheet.create({});

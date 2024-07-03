import { StyleSheet, View } from "react-native";
import React, {
  createContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import { NavigationContainer } from "@react-navigation/native";
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
import { useAutoLogin } from "./hooks/useAutoLogin";
import { theme } from "./styles/react-paper-theme";
import { PaperProvider } from "react-native-paper";
import { getItemAsync } from "expo-secure-store";

const Stack = createNativeStackNavigator<StackParamList>();

// const authContextInitial = {
//   signIn: async () => {},
//   signOut: () => {},
//   signUp: async (data: SignUpType) => {},
// };

// const reducerInitialValues = {
//   chosenPhoto: false,
//   chosenBio: false,
//   chosenTags: false,
//   isAdmin: false,
//   isSignOut: false,
//   isLoading: true,
//   userToken: null,
//   userId: "",
// };

// export const AuthContext = createContext(authContextInitial);

const StackNavigator = () => {
  // const [state, dispatch] = useReducer(authReducer, {
  //   chosenPhoto: false,
  //   chosenBio: false,
  //   chosenTags: false,
  //   isAdmin: false,
  //   isSignOut: false,
  //   isLoading: true,
  //   userToken: null,
  //   userId: "",
  // });

  const authContext = useMemo(
    () => ({
      signIn: async () => {
        // In a production app, we need to send some data (usually username, password) to server and get a token
        // We will also need to handle errors if sign in failed
        // After getting token, we need to persist the token using `SecureStore`
        // In the example, we'll use a dummy token
        // dispatch({ type: ACTIONS.SIGN_IN, token: "dummy-auth-token" });
      },
      signOut: () => {} /*dispatch({ type: "SIGN_OUT" })*/,
      signUp: async (data: SignUpType) => {
        /*
        userId,
        chosenPhoto,
        chosenBio,
        chosenTags,
        isAdmin,
        userToken,
        */
        // In a production app, we need to send user data to server and get a token
        // We will also need to handle errors if sign up failed
        // After getting token, we need to persist the token using `SecureStore`
        dispatch({ type: ACTIONS.SIGN_UP, data: data });
      },
    }),
    []
  );

  // speling mistak
  // useAutoLogin();
  // useEffect(() => {
  //   // Fetch the token from storage then navigate to our appropriate place
  //   const getTokenAsync = async () => {
  //     let userToken;

  //     try {
  //       userToken = await getItemAsync("TILK-token");
  //       if (userToken) {
  //         dispatch({ type: ACTIONS.RESTORE_TOKEN, token: userToken });
  //       }
  //     } catch (error) {
  //       console.log("Restoring token failed");
  //     }

  //     // After restoring token, we may need to validate it in production apps

  //     // This will switch to the App screen or Auth screen and this loading
  //     // screen will be unmounted and thrown away.
  //   };

  //   getTokenAsync();
  // }, []);

  if (state.isLoading) {
    // We haven't finished checking for the token yet
    return <SplashScreen />;
  }

  return (
    <AuthContext.Provider value={authContext}>
      <PaperProvider theme={theme}>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName={
              state.chosenPhoto
                ? state.chosenBio
                  ? state.chosenTags
                    ? "Home"
                    : "LookingFor"
                  : "PersonalDetails"
                : "SelectAvatar"
            }
          >
            {state.userToken ? (
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
                    animationTypeForReplace: state.isSignOut ? "pop" : "push",
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
        </NavigationContainer>
      </PaperProvider>
    </AuthContext.Provider>
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

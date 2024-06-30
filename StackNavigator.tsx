import { StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import HomeScreen from "./screens/HomeScreen";
import FriendsScreen from "./screens/FriendsScreen";
import ChatScreen from "./screens/ChatScreen";
import ChatMessageScreen from "./screens/ChatMessageScreen";
import { StackParamList } from "./types/types";
import WelcomeScreen from "./screens/WelcomeScreen";
import PhoneVerificationScreen from "./screens/PhoneVerificationScreen";
import SelectAvatarScreen from "./screens/SelectAvatarScreen";
import PersonalDetailsScreen from "./screens/PersonalDetailsScreen";
import LookingForScreen from "./screens/LookingForScreen";
import SplashScreen from "./screens/SplashScreen";

const Stack = createNativeStackNavigator<StackParamList>();

const StackNavigator = () => {
  const [isSignIn, setIsSignIn] = useState(true);
  const [isSignOut, setIsSignOut] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  // speling mistak
  // useAutoLogin();

  if (isLoading) {
    // We haven't finished checking for the token yet
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {isSignIn ? (
          <>
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
              options={{
                headerShown: false,
              }}
            />
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
  );
};

export default StackNavigator;

const styles = StyleSheet.create({});

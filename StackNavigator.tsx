import { StyleSheet } from "react-native";
import React from "react";
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

const Stack = createNativeStackNavigator<StackParamList>();

const StackNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Welcome">
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{ headerShown: false }}
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
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default StackNavigator;

const styles = StyleSheet.create({});

import {StyleSheet, View} from "react-native";
import React, {
    createContext,
    useEffect,
    useMemo,
    useReducer,
    useState,
} from "react";
import {NavigationContainer, useNavigation} from "@react-navigation/native";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
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
import LookingToScreen from "./screens/LookingToScreen";
import SplashScreen from "./screens/SplashScreen";
import {theme} from "./styles/react-paper-theme";
import {PaperProvider} from "react-native-paper";
import {getItemAsync} from "expo-secure-store";
import {ErrorBoundary} from "./components/ErrorBoundary/ErrorBoundary";
import {useAuthDispatch, useAuthState} from "./AuthContext";
import {useScreenOrder} from "./hooks/useScreenOrder";

const Stack = createNativeStackNavigator<StackParamList>();

const StackNavigator = () => {
    const {
        chosenAvatar,
        chosenBio,
        chosenTags,
        isAdmin,
        isSignOut,
        isLoading,
        userToken,
        userId,
    } = useAuthState();


    if (isLoading) {
        // We haven't finished checking for the token yet
        return <SplashScreen/>;
    }

    return (
        <Stack.Navigator
            initialRouteName={useScreenOrder()}
        >
            {userToken ? (
                <>
                    <Stack.Screen
                        name="SelectAvatar"
                        component={SelectAvatarScreen}
                        options={{headerShown: false}}
                    />

                    <Stack.Screen
                        name="PersonalDetails"
                        component={PersonalDetailsScreen}
                        options={{headerShown: false}}
                    />

                    <Stack.Screen
                        name="LookingTo"
                        component={LookingToScreen}
                        options={{headerShown: false}}
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
                        options={{headerShown: false}}
                    />

                    <Stack.Screen
                        name="Login"
                        component={LoginScreen}
                        options={{headerShown: false}}
                    />
                    <Stack.Screen
                        name="Register"
                        component={RegisterScreen}
                        options={{headerShown: false}}
                    />
                </>
            )}
        </Stack.Navigator>
    );

};

export function screenOrder() {
    return
}

export default StackNavigator;

const styles = StyleSheet.create({});

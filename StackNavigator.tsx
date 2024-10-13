import { StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import ChatMessageScreen from "./screens/ChatMessageScreen";
import { knnDataType, StackParamList } from "./types/types";
import WelcomeScreen from "./screens/WelcomeScreen";
import PhoneVerificationScreen from "./screens/PhoneVerificationScreen";
import SelectAvatarScreen from "./screens/SelectAvatarScreen";
import PersonalDetailsScreen from "./screens/personalDetailsScreen";
import LookingToScreen from "./screens/LookingToScreen";
import SplashScreen from "./screens/SplashScreen";
import { useAuthState } from "./AuthContext";
import { useScreenOrder } from "./hooks/useScreenOrder";
import Tabs from "./screens/Tabs";

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
  const initialRouteName = useScreenOrder();

  if (isLoading) {
    // We haven't finished checking for the token yet
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator initialRouteName={initialRouteName}>
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
            name="LookingTo"
            component={LookingToScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Tabs"
            component={Tabs}
            options={{ headerShown: false }}
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
};

export default StackNavigator;

const styles = StyleSheet.create({});

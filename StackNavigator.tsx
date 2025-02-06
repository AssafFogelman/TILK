import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ChatRoomScreen from "./screens/ChatRoomScreen";
import { StackParamList } from "./types/types";
import WelcomeScreen from "./screens/WelcomeScreen";
import PhoneVerificationScreen from "./screens/PhoneVerificationScreen";
import SelectAvatarScreen from "./screens/SelectAvatarScreen";
import PersonalDetailsScreen from "./screens/personalDetailsScreen";
import LookingToScreen from "./screens/LookingToScreen";
import { useAuthState } from "./context/AuthContext";
import { useScreenOrder } from "./hooks/useScreenOrder";
import Tabs from "./screens/Tabs";
import { useEffect, useRef } from "react";
import SplashScreen from "./screens/SplashScreen";
import { hideAsync } from "expo-splash-screen";
import { AboutScreen } from "./screens/AboutScreen";

const Stack = createNativeStackNavigator<StackParamList>();

const StackNavigator = () => {
  const { isSignOut, isLoading, userToken } = useAuthState();
  const initialRouteFunction = useScreenOrder();
  const isSplashHidden = useRef(false);

  //keep the splash screen visible until we know there is no token.
  //mind you that if there is a saved token, the splash screen will be visible until
  //the user reaches HomeScreen and loads first the knn data
  useEffect(() => {
    if (!isLoading && !userToken && !isSplashHidden.current) {
      hideAsync();

      isSplashHidden.current = true;
    }
  }, [isLoading, userToken]);

  if (isLoading) {
    // We haven't finished checking for the token yet
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator initialRouteName={initialRouteFunction()}>
      {userToken ? (
        <>
          <Stack.Screen
            name="PersonalDetails"
            component={PersonalDetailsScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="SelectAvatar"
            component={SelectAvatarScreen}
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

          <Stack.Screen name="ChatRoom" component={ChatRoomScreen} />
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
        </>
      )}
      <Stack.Group navigationKey={userToken ? "user" : "guest"}>
        <Stack.Screen name="About" component={AboutScreen} />
      </Stack.Group>
    </Stack.Navigator>
  );
};

export default StackNavigator;

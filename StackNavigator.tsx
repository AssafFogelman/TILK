import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ChatRoomScreen from "./screens/ChatRoomScreen";
import { StackParamList } from "./types/types";
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
  const { isSignOut, isLoading, userToken } = useAuthState();
  const initialRouteFunction = useScreenOrder();

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

          <Stack.Screen
            name="ChatRoom"
            component={ChatRoomScreen}
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
        </>
      )}
    </Stack.Navigator>
  );
};

export default StackNavigator;

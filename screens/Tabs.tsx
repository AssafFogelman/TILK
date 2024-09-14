import { StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { BottomNavigation } from "react-native-paper";
import HomeScreen from "./HomeScreen";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import ChatsScreen from "./ChatsScreen";
import ConnectionsScreen from "./ConnectionsScreen";
import Ionicons from "@expo/vector-icons/Ionicons";
import { TabParamList } from "../types/types";
import React, { useState } from "react";

const Tab = createBottomTabNavigator<TabParamList>();

type IconName =
  | "home"
  | "home-outline"
  | "chat"
  | "chat-outline"
  | "people"
  | "people-outline";

type Route = {
  key: string;
  title: string;
  focusedIcon: IconName;
  unfocusedIcon: IconName;
};

const initialTabState = {
  index: 0,
  routes: [
    {
      key: "Home",
      title: "Home",
      focusedIcon: "home",
      unfocusedIcon: "home-outline",
    },
    {
      key: "Chats",
      title: "Chats",
      focusedIcon: "chat",
      unfocusedIcon: "chat-outline",
    },
    {
      key: "Connections",
      title: "Connections",
      focusedIcon: "people",
      unfocusedIcon: "people-outline",
    },
  ] as Route[],
};

const Tabs = () => {
  const [tabState, setTabState] = useState(initialTabState);

  const renderIcon = (route: Route, focused: boolean, color: string) => {
    const iconName = focused ? route.focusedIcon : route.unfocusedIcon;

    switch (iconName) {
      case "home":
      case "home-outline":
      case "chat":
      case "chat-outline":
        return (
          <MaterialCommunityIcons name={iconName} size={24} color={color} />
        );
      case "people":
      case "people-outline":
        return <Ionicons name={iconName} size={24} color={color} />;
      default:
        return null;
    }
  };

  return (
    <Tab.Navigator
      initialRouteName="Home"
      tabBar={({ navigation, state, descriptors, insets }) => (
        <BottomNavigation.Bar
          navigationState={tabState}
          safeAreaInsets={insets}
          onTabPress={({ route }) => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!event.defaultPrevented) {
              navigation.navigate(route.key);
              setTabState((prevState) => ({
                ...prevState,
                index: state.routes.findIndex((r) => r.name === route.key),
              }));
            }
          }}
          renderIcon={({ route, focused, color }) => {
            const currentRoute = tabState.routes.find(
              (r) => r.key === route.key,
            ) as Route;
            return renderIcon(currentRoute, focused, color);
          }}
        />
      )}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Chats" component={ChatsScreen} />
      <Tab.Screen name="Connections" component={ConnectionsScreen} />
    </Tab.Navigator>
  );
};

export default Tabs;

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { BottomNavigation, useTheme } from "react-native-paper";
import HomeScreen from "./HomeScreen";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { ChatsScreen } from "./ChatsScreen";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Route, TabParamList } from "../types/types";
import React, { useState } from "react";
import { getHeaderTitle } from "@react-navigation/elements";
import TabHeader from "../components/home-screen-components/TabHeader";
import { Alert } from "react-native";
import { ConnectionsScreen } from "./ConnectionsScreen";
import { useFetchUnreadEvents } from "../hooks/home-screen-hooks/useFetchUnreadEvents";

const Tab = createBottomTabNavigator<TabParamList>();

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
      key: "Connections",
      title: "Connections",
      focusedIcon: "people",
      unfocusedIcon: "people-outline",
    },
    {
      key: "Chats",
      title: "Chats",
      focusedIcon: "chat",
      unfocusedIcon: "chat-outline",
    },
  ] as Route[],
};

const Tabs = () => {
  const [tabState, setTabState] = useState(initialTabState);
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState("");

  //fetch unread events - unread messages/connection requests/connection approvals
  const { unreadEvents } = useFetchUnreadEvents();

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

  const handleMenuPress = () => {
    Alert.alert("Menu", "You pressed the menu button!");
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
              (r) => r.key === route.key
            ) as Route;
            return renderIcon(currentRoute, focused, color);
          }}
          getBadge={({ route }) => {
            if (
              route.key === "Chats" &&
              unreadEvents?.unread_messages.length > 0
            ) {
              return unreadEvents.unread_messages.length;
            }
            return undefined;
          }}
          theme={theme}
        />
      )}
      screenOptions={({ route }) => ({
        header: ({ navigation, options }) => {
          const title = getHeaderTitle(options, route.name);
          const showSearchIcon =
            route.name === "Connections" || route.name === "Chats";

          return (
            <TabHeader
              title={title}
              onMenuPress={handleMenuPress}
              showSearchIcon={showSearchIcon}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Connections">
        {(props) => <ConnectionsScreen {...props} searchQuery={searchQuery} />}
      </Tab.Screen>

      <Tab.Screen name="Chats">
        {(props) => <ChatsScreen {...props} searchQuery={searchQuery} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

export default Tabs;

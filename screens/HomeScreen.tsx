import { FlatList, Pressable, StyleSheet, View } from "react-native";
import React, {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
// import { UserContext } from "../UserContext";
import { getData } from "../config/asyncStorage";
import axios from "axios";
import { ObjectId } from "mongoose";
import UserSmallDetails from "../components/UserSmallDetails";
import { useHandleAppStateChange } from "../hooks/useHandleAppStateChange";
import { socket } from "../socket";
import { useAuthState } from "../AuthContext";
import {
  HomeProps,
  HomeScreenNavigationProp,
  HomeScreenRouteProp,
  knnDataItemType,
  PhoneVerificationScreenRouteProp,
} from "../types/types";
import * as Location from "expo-location";
import {
  ActivityIndicator,
  Avatar,
  Badge,
  Button,
  Card,
  Chip,
  Text,
} from "react-native-paper";
import { useTheme } from "react-native-paper";
import { FlashList } from "@shopify/flash-list";

/* TODO

 * add "bottom sheet" from RN Paper
 * add cards
 */

const HomeScreen = (props: HomeProps) => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { userId } = useAuthState();
  const theme = useTheme();

  const {
    startDeviceMotionTracking,
    startLocationTrackingInterval,
    knnDataIsLoading,
    knnDataIsError,
    knnData,
  } = props;

  //start location tracking
  useLocationTracking();

  //create a websocket connection
  //and set the userId to the server as "currently connected".
  useSetCurrentlyConnected();

  //set the header
  useSetHeader();

  //when minimizing and returning to app - check if location is enabled. FIXME is this at all necessary?
  // useHandleAppStateChange();

  //knn user card
  const LeftContent = (props: { size: number; small_avatar: string }) => {
    const { small_avatar, ...otherProps } = props;
    return (
      <Avatar.Image
        {...otherProps}
        source={{
          uri: process.env.EXPO_PUBLIC_SERVER_ADDRESS + "/" + small_avatar,
        }}
      ></Avatar.Image>
    );
  };

  function age(dateOfBirth: Date) {
    const diff_ms = Date.now() - dateOfBirth.getTime();
    const age_dt = new Date(diff_ms);

    return Math.abs(age_dt.getUTCFullYear() - 1970) + "";
  }

  const userCard = useCallback(
    ({ item }: { item: knnDataItemType }) => (
      <Card>
        <Card.Title
          title={item.nickname}
          subtitle={item.gender + ", " + age(new Date(item.date_of_birth))}
          left={(props) =>
            LeftContent({ ...props, small_avatar: item.small_avatar })
          }
        />
        <Card.Content>
          <FlatList
            data={item.tags}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <Chip style={{ marginRight: 2 }}>{item}</Chip>
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </Card.Content>
        <Card.Actions>
          <Button>Cancel</Button>
          <Button>Ok</Button>
        </Card.Actions>
      </Card>
    ),
    [],
  );

  return (
    <View style={{ flex: 1 }}>
      {knnDataIsLoading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator animating={true} size={"large"} />
        </View>
      ) : knnDataIsError ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text>Could not load nearby users...</Text>
        </View>
      ) : (
        <View style={{ padding: 10, flex: 1 }}>
          <FlashList
            data={knnData}
            renderItem={userCard}
            //seperator of distance
            estimatedItemSize={59}
            keyExtractor={(item) => item.user_id}
          />
        </View>
      )}
    </View>
  );

  function useLocationTracking() {
    useEffect(() => {
      //subscribe to location updates
      startDeviceMotionTracking();
      //start an interval for location acquirement.
      startLocationTrackingInterval();
    }, []);
  }

  function useSetCurrentlyConnected() {
    useEffect(() => {
      (async () => {
        socket.connect();
        socket.emit("setCurrentlyConnected", userId);
      })();
      //the socket is removed in the "app.js" file in order that the user will be
      //registered as off-line only when the app is closed, and not when "homeScreen" is unmounted
    }, []);
  }

  function useSetHeader() {
    useEffect(() => {
      navigation.setOptions({
        headerTitle: "",
        headerLeft: () => (
          <Text style={{ fontSize: 16, fontWeight: "bold" }}>Tilk</Text>
        ),
        headerRight: () => (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Ionicons
              onPress={() => {
                navigation.navigate("Chats");
              }}
              name="chatbox-ellipses-outline"
              size={24}
              color="black"
            />

            <MaterialIcons
              onPress={() => {
                navigation.navigate("Friends");
              }}
              name="people-outline"
              size={24}
              color="black"
            />
          </View>
        ),
      });
    }, []);
  }
};

export default HomeScreen;

const styles = StyleSheet.create({});

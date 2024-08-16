import { Pressable, StyleSheet, Text, View } from "react-native";
import React, { useContext, useEffect, useLayoutEffect, useState } from "react";
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
  PhoneVerificationScreenRouteProp,
} from "../types/types";
import * as Location from "expo-location";

/* TODO

 * add "bottom sheet" from RN Paper
 * add cards
 */

const HomeScreen = (props: HomeProps) => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { userId } = useAuthState();
  const {
    startDeviceMotionTracking,
    startLocationTrackingInterval,
    locationDataIsLoading,
    locationDataIsError,
    locationData,
  } = props;

  //start location tracking
  useLocationTracking();

  //create a websocket connection
  //and set the userId to the server as "currently connected".
  useSetCurrentlyConnected();

  //setting the header
  useSetHeader();

  //when minimizing and returning to app - check if location is enabled.
  // useHandleAppStateChange();

  return (
    <View>
      {/* mapping the users downloaded from the server */}
      <View style={{ padding: 10 }}>
        {/* {users.map((userData, index) => (
          <UserSmallDetails key={index} userData={userData} />
        ))} */}
      </View>
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

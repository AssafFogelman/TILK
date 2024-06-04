// Import the crypto getRandomValues shim (**BEFORE** the shims)
import "react-native-get-random-values";

// Import the the ethers shims (**BEFORE** ethers)
import "@ethersproject/shims";

// Import the ethers library
import { ethers } from "ethers";

import { Pressable, StyleSheet, Text, View } from "react-native";
import React, { useContext, useEffect, useLayoutEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { UserType } from "../UserContext";
import { getData } from "../config/asyncStorage";
import axios from "axios";
import { ObjectId } from "mongoose";
import { jwtDecode } from "jwt-decode";
import UserSmallDetails from "../components/UserSmallDetails";
import { useHandleAppStateChange } from "../hooks/useHandleAppStateChange";

interface JwtPayload {
  userId: string;
}

const HomeScreen = () => {
  const navigation = useNavigation();
  const { userId, setUserId } = useContext(UserType);
  const [users, setUsers] = useState([]);

  //handle minimizing and returning to app - currently checking if location is enabled. the listener starts only after the user loads the HomeScreen.
  useHandleAppStateChange();

  //setting the header
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

  useEffect(() => {
    //get context "userId" from the asyncStorage &
    //fetch all the user data except this user
    const fetchUsers = async () => {
      try {
        const token = await getData("authToken");
        const decodedToken: JwtPayload = jwtDecode(token);

        //set context with userId
        setUserId(decodedToken.userId);

        //get the list of all the users except this user.
        axios
          .get("http://192.168.1.116:8000/users/" + decodedToken.userId)
          .then((response) => {
            //save the users' data to a state.
            setUsers(response.data);
          })
          .catch((error) => {
            console.log(
              "an error ocurred while trying to retrieve the user list"
            );
            console.log("the error is:", error);
          });
      } catch (error) {
        console.log("error in useEffect of HomeScreen:", error);
      }
    };
    fetchUsers();
  }, []);

  return (
    <View>
      {/* mapping the users downloaded from the server */}
      <View style={{ padding: 10 }}>
        {users.map((userData, index) => (
          <UserSmallDetails key={index} userData={userData} />
        ))}
      </View>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({});

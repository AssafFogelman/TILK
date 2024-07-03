import { StyleSheet, Text, View, Pressable, Image } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import User from "../api/models/user";
// import { UserContext } from "../UserContext";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";

import { HomeScreenNavigationProp } from "../types/types";
import { useNavigation } from "@react-navigation/native";

type UserDataType = {
  __v: number;
  _id: string;
  email: string;
  friends: string[];
  image: string;
  name: string;
  password: string; //! this attribute should not be sent! nor do __v and others.
  receivedFriendRequests: string[];
  sentFriendRequests: string[];
};

const UserSmallDetails = ({ userData }: { userData: UserDataType }) => {
  // const { userId, setUserId } = useContext(UserContext);
  const [requestSentByMe, setRequestSentByMe] = useState(false);
  const [requestSentToMe, setRequestSentToMe] = useState(false);
  const [weAreFriends, setWeAreFriends] = useState(false);

  const navigation = useNavigation<HomeScreenNavigationProp>();

  useEffect(() => {
    /*
    once the component loads, check whether "userData" (the user that is not us and is being shown)
    is friends with us.
    by default the "alreadyFriends" state is set to "true" so the buttons won't show. 
    A variable called "WeAreConnected" checks if that is truly the case.
    If the "for" loop finds that we are friends, nothing happens. 
    If it does not, then we are not friends, and the state changes to "false".
    */

    //are we connected/friends?

    // if (userData.friends.includes(userId)) {
    //   setWeAreFriends(true);
    //   return;
    // }

    //did I send him a connect request?

    // if (userData.receivedFriendRequests.includes(userId)) {
    //   setRequestSentByMe(true);
    //   return;
    // }

    //did he send me a connect request?

    // if (userData.sentFriendRequests.includes(userId)) {
    //   setRequestSentToMe(true);
    //   return;
    // }

    //it is false by default, but better safe than sorry
    setWeAreFriends(false);
  }, []);

  const sendFriendRequest = async (
    sender_userId: string,
    recipient_userId: string
  ) => {
    try {
      const response = await fetch(
        "http://192.168.1.116:8000/request-friendship",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sender_userId: sender_userId,
            recipient_userId: recipient_userId,
          }),
        }
      );
      if (response.ok) {
        setRequestSentByMe(true);
      }
    } catch (error) {
      console.log("error trying to send a friend request:", error);
    }
  };

  const acceptFriendRequest = async (userId: string, friend_id: string) => {
    try {
      const response = await axios.post("accept-friendship", {
        accepted_id: userId,
        asked_id: friend_id,
      });
      if (response.status === 200) {
        setWeAreFriends(true);
        setRequestSentToMe(false);
      }
    } catch (error) {
      console.log(
        "there was an error trying to accept the friend request:",
        error
      );
    }
  };

  return (
    <Pressable
      style={{
        flexDirection: "row-reverse",
        alignItems: "center",
        marginVertical: 10,
        gap: 12,
      }}
    >
      <View>
        <Image
          style={{
            width: 50,
            height: 50,
            borderRadius: 25,
            resizeMode: "cover",
          }}
          source={{ uri: userData.image }}
        />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={{ fontWeight: "bold" }}>{userData.name}</Text>
        <Text style={{ fontSize: 10, color: "grey" }}>looking for:</Text>
        <Text style={{ fontSize: 10, color: "grey" }}>Distance:</Text>
      </View>

      {/* if we are friends, show a chatroom icon     */}
      {weAreFriends && (
        <Ionicons
          onPress={() => {
            //we are also sending the friend's Id
            navigation.navigate("Messages", { friendId: userData._id });
          }}
          name="chatbox-ellipses-outline"
          size={24}
          color="black"
        />
      )}

      {/* if I have sent a request to connect, inform me of that */}
      {requestSentByMe && (
        <Pressable
          style={{
            backgroundColor: "gold",
            padding: 8,
            borderRadius: 9,
          }}
        >
          <Text style={{ textAlign: "center", color: "white", fontSize: 13 }}>
            request sent
          </Text>
        </Pressable>
      )}

      {/* if the friend sent me a connect request, I can accept, and make him my friend */}
      {requestSentToMe && (
        <Pressable
          style={{
            backgroundColor: "#0ABAB5",
            padding: 8,
            borderRadius: 9,
          }}
          onPress={() => {
            // acceptFriendRequest(userId, userData._id);
          }}
        >
          <Text style={{ textAlign: "center", color: "white", fontSize: 13 }}>
            accept request
          </Text>
        </Pressable>
      )}

      {/* if we have nothing between us, I can send a connection request */}
      {!weAreFriends && !requestSentByMe && !requestSentToMe && (
        <Pressable
          onPress={() => {
            // sendFriendRequest(userId, userData._id);
          }}
          style={{
            backgroundColor: "#567189",
            padding: 8,
            borderRadius: 9,
          }}
        >
          <Text style={{ textAlign: "center", color: "white", fontSize: 13 }}>
            Connect
          </Text>
        </Pressable>
      )}
    </Pressable>
  );
};

export default UserSmallDetails;

const styles = StyleSheet.create({});

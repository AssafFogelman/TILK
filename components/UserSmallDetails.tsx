import { StyleSheet, Text, View, Pressable, Image } from "react-native";
import React, { useContext, useState } from "react";
import User from "../api/models/user";
import { UserType } from "../UserContext";
import axios from "axios";

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
  const { userId, setUserId } = useContext(UserType);
  const [requestSent, setRequestSent] = useState(false);

  const sendFriendRequest = async (
    sender_userId: number,
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
      console.log("response:", response);
      if (response.ok) {
        setRequestSent(true);
      }
    } catch (error) {
      console.log("error trying to send a friend request:", error);
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
        <Text style={{ fontSize: 10, color: "grey" }}>{userData.email}</Text>
      </View>

      <Pressable
        onPress={() => {
          sendFriendRequest(userId, userData._id);
        }}
        style={{
          backgroundColor: requestSent ? "gold" : "#567189",
          padding: 8,
          borderRadius: 9,
        }}
      >
        <Text style={{ textAlign: "center", color: "white", fontSize: 13 }}>
          {requestSent ? "request sent" : "Add Friend"}
        </Text>
      </Pressable>
    </Pressable>
  );
};

export default UserSmallDetails;

const styles = StyleSheet.create({});

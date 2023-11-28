import { StyleSheet, Text, View, Pressable, Image } from "react-native";
import React from "react";
import User from "../api/models/user";

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
  return (
    <Pressable style={{ flexDirection: "row", alignItems: "center" }}>
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

      <View>
        <Text>{userData.name}</Text>
        <Text>{userData.email}</Text>
      </View>
    </Pressable>
  );
};

export default UserSmallDetails;

const styles = StyleSheet.create({});

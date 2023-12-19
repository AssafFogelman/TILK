import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import * as React from "react";

type FriendRequestType = {
  _id: string;
  name: string;
  image: string;
  email: string;
};

const FriendRequest = ({
  item,
  friendRequestsData,
  setFriendRequestsData,
}: {
  item: FriendRequestType;
  friendRequestsData: FriendRequestType[];
  setFriendRequestsData: React.Dispatch<React.SetStateAction<never[]>>;
}) => {
  return (
    <Pressable
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginVertical: 10,
      }}
    >
      <Image
        source={{ uri: item.image }}
        style={{ width: 50, height: 50, borderRadius: 25 }}
      />
      <Text>{item.name} sent you a friend request</Text>

      <Pressable
        style={{ backgroundColor: "#0066b2", padding: 10, borderRadius: 6 }}
      >
        <Text style={{ textAlign: "center", color: "white" }}>Accept</Text>
      </Pressable>
    </Pressable>
  );
};

export default FriendRequest;

const styles = StyleSheet.create({});

import React, { useContext } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { UserType } from "../UserContext";
import { useNavigation } from "@react-navigation/native";

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
  setFriendRequestsData: React.Dispatch<
    React.SetStateAction<FriendRequestType[]>
  >;
}) => {
  const { userId, setUserId } = useContext(UserType);

  const navigation = useNavigation();

  const acceptFriendRequest = async (sender_userId: string) => {
    try {
      const response = await fetch(
        "http://192.168.1.116:8000/friend-requests/accept",
        {
          method: "POST",
          mode: "no-cors",
          cache: "no-cache",
          credentials: "same-origin",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sender_userId: sender_userId,
            recipient_userId: userId,
          }), // sender_userId = the user who sent the request. recipient_userId = the user
        }
      );
      if (response.ok) {
        const newFriendRequestsList = friendRequestsData.filter(
          (friendRequest) => friendRequest._id !== sender_userId
        );
        setFriendRequestsData(newFriendRequestsList);
        navigation.navigate("Chats");
      }
    } catch (error) {
      console.log(
        "there was an error trying to accept the friend request: ",
        error
      );
    }
  };
  return (
    <Pressable
      style={{
        gap: 10,
        flexDirection: "row-reverse",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        marginVertical: 10,
      }}
    >
      <Image
        source={{ uri: item.image }}
        style={{ width: 50, height: 50, borderRadius: 25 }}
      />
      <View
        style={{
          flex: 1,
        }}
      >
        <Text style={{ fontWeight: "bold", fontSize: 15 }}>{item.name}</Text>
        <Text style={{ fontSize: 15 }}>sent you a friend request</Text>
      </View>

      <Pressable
        style={{ backgroundColor: "#0066b2", padding: 10, borderRadius: 6 }}
        onPress={() => acceptFriendRequest(item._id)}
        //we are sending to "acceptFriendRequest" function, the id of the asker/sender. But where are we going to get the asked/user's id from?
      >
        <Text style={{ textAlign: "center", color: "white" }}>Accept</Text>
      </Pressable>
    </Pressable>
  );
};

export default FriendRequest;

const styles = StyleSheet.create({});

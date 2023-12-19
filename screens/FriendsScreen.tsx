import { StyleSheet, Text, View } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { UserType } from "../UserContext";
import FriendRequest from "../components/FriendRequest";

const FriendsScreen = () => {
  const [friendRequestsData, setFriendRequestsData] = useState([]);
  useEffect(() => {
    fetchFriendRequests();
  }, []);

  const { userId, setUserId } = useContext(UserType);

  type FriendRequestType = {
    _id: string;
    name: string;
    image: string;
    email: string;
  };

  const fetchFriendRequests = async () => {
    try {
      const response = await axios.get(
        `http://192.168.1.116:8000/friend-requests/${userId}`
      );
      if (response.status === 200) {
        //copy the received friend requests with their attributes to the state
        setFriendRequestsData(JSON.parse(JSON.stringify(response.data)));

        /* this is what the tutorial suggested as a copy. why? */
        // const friendRequestsData = response.data.map(
        //   (friendRequest: FriendRequestType) => ({
        //     _id: friendRequest._id,
        //     name: friendRequest.name,
        //     email: friendRequest.email,
        //     image: friendRequest.image,
        //   })
        // );
      }
    } catch (error) {
      console.log(
        "error while receiving friend requests from the server:",
        error
      );
    }
  };

  return (
    <View style={{ padding: 10, marginHorizontal: 12 }}>
      {friendRequestsData.length > 0 && <Text>Friend Requests</Text>}
      {friendRequestsData.map((item, index) => (
        <FriendRequest
          key={index}
          item={item}
          friendRequestsData={friendRequestsData}
          setFriendRequestsData={setFriendRequestsData}
        />
      ))}
    </View>
  );
};

export default FriendsScreen;

const styles = StyleSheet.create({});

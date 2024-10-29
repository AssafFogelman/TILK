import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useCallback, useContext, useEffect, useState } from "react";
// import { UserContext } from "../UserContext";
import UserChat from "../components/UserChat";
import { useAuthState } from "../AuthContext";
import { useFocusEffect } from "@react-navigation/native";
import axios from "axios";
import { FlashList } from "@shopify/flash-list";
import { UserCard } from "../components/home-screen-components/UserCardKNN";

const ChatsScreen = () => {
  const [friendsList, setFriendsList] = useState<ConnectedUserType[]>([]);
  const { userId } = useAuthState();

  type ConnectedUserType = {
    userId: string;
    smallAvatar: string | null;
    biography: string | null;
    dateOfBirth: string | null;
    gender: "man" | "woman" | "other" | null;
    nickname: string | null;
    currentlyConnected: boolean | null;
  };

  const getFriendsList = async () => {
    try {
      const { connectedUsers } = (await axios
        .get(`/user/get-connections-list`)
        .then((res) => res.data)) as { connectedUsers: ConnectedUserType[] };
      setFriendsList(connectedUsers);
    } catch (error) {
      console.log(
        "error happened while trying to get the users connections list:",
        error
      );
    }
  };

  useFocusEffect(
    useCallback(() => {
      getFriendsList();
    }, [])
  );
  const renderUserCard = useCallback(
    ({ item }: { item: ConnectedUserType }) => (
      <View>
        <Text>{item.userId}</Text>
        <Text>{item.smallAvatar}</Text>
        <Text>{item.biography}</Text>
        <Text>{item.dateOfBirth}</Text>
        <Text>{item.gender}</Text>
        <Text>{item.nickname}</Text>
        <Text>{item.currentlyConnected}</Text>
      </View>
      // <UserCard user={item} onAvatarPress={handleOpenModal} />
    ),
    []
  );
  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: 10, flex: 1 }}>
        <FlashList
          data={friendsList}
          renderItem={renderUserCard}
          estimatedItemSize={100}
          keyExtractor={(item) => item.userId}
        />
      </View>
    </View>
  );
};

export default ChatsScreen;

const styles = StyleSheet.create({});

import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { UserContext } from "../UserContext";
import axios from "axios";
import { ChatMessageType } from "../types/types";
import formatDate from "../services/formatDate";

type friendType = {
  _id: string;
  email: string;
  image: string;
  name: string;
};

const UserChat = ({ friend }: { friend: friendType }) => {
  const navigation = useNavigation();
  const { userId, setUserId } = useContext(UserContext);
  const [lastTextMessage, setLastTextMessage] = useState<string>("");
  const [lastMessageTimestamp, setLastMessageTimestamp] = useState<string>("");

  //fetch chat messages
  const fetchMessages = async () => {
    try {
      const { data }: { data: ChatMessageType[] } = await axios.get(
        `messages/getMessages/${userId}/${friend._id}`
      );
      const textMessages = data.filter(
        (message) => message.messageType === "text"
      );
      if (textMessages.length) {
        setLastTextMessage(
          `${textMessages[textMessages.length - 1].message.substring(0, 25)}${
            textMessages[textMessages.length - 1].message.length > 24
              ? "..."
              : ""
          }`
        );
        setLastMessageTimestamp(
          formatDate(textMessages[textMessages.length - 1]?.timeStamp)
        );
      }
    } catch (error) {
      console.log(
        "there was an error trying to fetch the chat's messages:",
        error
      );
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <Pressable
      style={{
        flexDirection: "row-reverse",
        alignItems: "center",
        gap: 10,
        borderColor: "#D0D0D0",
        borderBottomWidth: 0.7,
        padding: 10,
      }}
      onPress={() => {
        //we are also sending the friend's Id
        navigation.navigate("Messages", {
          friendId: friend._id,
        });
      }}
    >
      <Image
        source={{ uri: friend.image }}
        style={{ width: 50, height: 50, borderRadius: 25, resizeMode: "cover" }}
      />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 15, fontWeight: "500" }}>{friend.name}</Text>
        <Text style={{ marginTop: 3, color: "gray", fontWeight: "400" }}>
          {lastTextMessage}
        </Text>
      </View>

      <View>
        <Text style={{ fontSize: 11, fontWeight: "400", color: "#585858" }}>
          {lastMessageTimestamp}
        </Text>
      </View>
    </Pressable>
  );
};

export default UserChat;

const styles = StyleSheet.create({});

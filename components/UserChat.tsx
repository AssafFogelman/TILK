import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";
import { useNavigation } from "@react-navigation/native";

type friendType = {
  _id: string;
  email: string;
  image: string;
  name: string;
};

const UserChat = ({ friend }: { friend: friendType }) => {
  const navigation = useNavigation();

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
        navigation.navigate("Messages", { friendId: friend._id });
      }}
    >
      <Image
        source={{ uri: friend.image }}
        style={{ width: 50, height: 50, borderRadius: 25, resizeMode: "cover" }}
      />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 15, fontWeight: "500" }}>{friend.name}</Text>
        <Text style={{ marginTop: 3, color: "gray", fontWeight: "500" }}>
          last message comes here
        </Text>
      </View>

      <View>
        <Text style={{ fontSize: 11, fontWeight: "400", color: "#585858" }}>
          15:00
        </Text>
      </View>
    </Pressable>
  );
};

export default UserChat;

const styles = StyleSheet.create({});

import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { BlockedUserType } from "../types/types";
import axios from "axios";
import { FlashList } from "@shopify/flash-list";
import {
  ActivityIndicator,
  Avatar,
  Divider,
  List,
  Menu,
} from "react-native-paper";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "../services/queryClient";
import { useUnblockUser } from "../hooks/useUnblockUser";

const BlockedUsersScreen = () => {
  const {
    data: blockedUsers = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: ["blockedUsers"],
    queryFn: getBlockedUsers,
  });
  const { mutate: unblock } = useUnblockUser();

  if (isPending) {
    return <ActivityIndicator />;
  }

  if (isError) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Error fetching blocked users</Text>;
      </View>
    );
  }

  if (blockedUsers.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>No blocked users</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, paddingHorizontal: 10 }}>
      <FlashList
        data={blockedUsers}
        renderItem={({ item }) => (
          <BlockedUserItem item={item} unblock={unblock} />
        )}
        estimatedItemSize={100}
        ItemSeparatorComponent={() => <Divider />}
      />
    </View>
  );
};

const BlockedUserItem = ({
  item,
  unblock,
}: {
  item: BlockedUserType;
  unblock: (userId: string) => void;
}) => {
  const [visibleMenu, setVisibleMenu] = useState(false);
  const openMenu = () => setVisibleMenu(true);
  const closeMenu = () => setVisibleMenu(false);

  return (
    <Menu
      visible={visibleMenu}
      onDismiss={closeMenu}
      anchor={
        <Pressable onPress={openMenu}>
          <List.Item
            title={item.nickname}
            left={(props) => (
              <Avatar.Image
                size={40}
                source={{
                  uri:
                    process.env.EXPO_PUBLIC_SERVER_ADDRESS + item.smallAvatar,
                }}
              />
            )}
          />
        </Pressable>
      }
    >
      <Menu.Item
        onPress={() => {
          //   closeMenu();
          unblock(item.userId);
        }}
        title={`unblock ${item.nickname}`}
      />
    </Menu>
  );
};

async function getBlockedUsers(): Promise<BlockedUserType[]> {
  try {
    const response = await axios.get("/user/blocked-users");
    return response.data;
  } catch (error) {
    console.error("Error fetching blocked users:", error);
    throw new Error("Error fetching blocked users: " + error);
  }
}

const styles = StyleSheet.create({});

export default BlockedUsersScreen;

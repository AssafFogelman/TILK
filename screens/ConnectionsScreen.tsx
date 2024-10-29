import { Image, StyleSheet, Text, View } from "react-native";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { FlashList } from "@shopify/flash-list";
import { List } from "react-native-paper";

import {
  ErrorView,
  LoadingView,
  NoDataView,
} from "../components/connections-screen-components/StatusViews";
import {
  ConnectionsListItem,
  ConnectionsListType,
  OtherUser,
} from "../types/types";

// why do we need a "connections" tab?
// because the user needs to see who sent him a connection request.
// in addition, if the user wants to start a chat with a connection, he can find him here.
// TODO: we might need to add a search bar here, so the user can search for a connection by nickname.
export const ConnectionsScreen = () => {
  const { isPending, isError, data }: UseQueryResult<ConnectionsListType> =
    useQuery({
      queryKey: ["connectionsList"],
    });

  if (isPending) return <LoadingView />;
  if (isError) return <ErrorView />;
  if (data?.length === 0) return <NoDataView />;

  return (
    <>
      <FlashList
        data={data}
        renderItem={renderItem}
        // estimatedItemSize={50}
        keyExtractor={(item) =>
          "isSeparator" in item ? item.title : item.userId
        }
      />
    </>
  );

  function renderItem({ item }: { item: ConnectionsListItem }) {
    if ("isSeparator" in item) {
      return <List.Subheader>{item.title}</List.Subheader>;
    }
    return <UserItem user={item} />;
  }

  function UserItem({ user }: { user: OtherUser }) {
    return (
      <View style={styles.userItem}>
        <Image
          source={{
            uri: process.env.EXPO_PUBLIC_SERVER_ADDRESS + user.smallAvatar,
          }}
          style={styles.avatar}
        />
        <View style={styles.userInfo}>
          <Text style={styles.nickname}>{user.nickname}</Text>
          <Text style={styles.tags}>{user.tags.join(", ")}</Text>
        </View>
        {user.lastMessage && (
          <View style={styles.lastMessage}>
            <Text style={styles.messageText}>{user.lastMessage.text}</Text>
            {user.lastMessage.unread && <View style={styles.unreadIndicator} />}
          </View>
        )}
        {user.unread && <View style={styles.unreadIndicator} />}
      </View>
    );
  }
};

const styles = StyleSheet.create({
  separator: {
    padding: 10,
    backgroundColor: "#f0f0f0",
  },
  separatorText: {
    fontWeight: "bold",
  },
  userItem: {
    flexDirection: "row",
    padding: 10,
    alignItems: "center",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  userInfo: {
    flex: 1,
  },
  nickname: {
    fontWeight: "bold",
    fontSize: 16,
  },
  tags: {
    fontSize: 14,
    color: "#666",
  },
  lastMessage: {
    alignItems: "flex-end",
  },
  messageText: {
    fontSize: 14,
  },
  unreadIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "blue",
    marginLeft: 5,
  },
});

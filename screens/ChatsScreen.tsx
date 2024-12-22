import { View } from "react-native";
import { useMutation, useQuery, UseQueryResult } from "@tanstack/react-query";
import { FlashList } from "@shopify/flash-list";
import { List } from "react-native-paper";

import { ChatsScreenNavigationProp, ChatsType, ChatType } from "../types/types";
import { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import axios, { isAxiosError } from "axios";
import { queryClient } from "../services/queryClient";
import { UserCard } from "../components/chats-screen-components/UserCardChats";
import { UserInfoModal } from "../components/chats-screen-components/UserInfoModalChats";
import { useQueryClient } from "@tanstack/react-query";
import { fetchChatMessages } from "../APIs/chatAPIs";
import {
  ErrorView,
  LoadingView,
  NoDataView,
} from "../components/chats-screen-components/StatusViewsChats";

// why do we need a "connections" tab?
// because the user needs to see who sent him a connection request.
// in addition, if the user wants to start a chat with a connection, he can find him here.
// TODO: we might need to add a search bar here, so the user can search for a connection by nickname.
export const ChatsScreen = ({ searchQuery }: { searchQuery: string }) => {
  const [modalUserInfo, setModalUserInfo] = useState<ChatType | null>(null);
  const [showModal, setShowModal] = useState(false);

  const navigation = useNavigation<ChatsScreenNavigationProp>();

  const {
    data: chats,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["chatsList"],
    queryFn: fetchChatsList,
  });

  if (isPending) return <LoadingView />;
  if (isError) return <ErrorView />;
  if (chats?.length === 0) return <NoDataView />;

  return (
    <>
      <View style={{ padding: 10, flex: 1 }}>
        <FlashList
          data={filteredData()}
          renderItem={renderItem}
          estimatedItemSize={116}
          keyExtractor={(item) => item.otherUser.userId}
        />
      </View>

      <UserInfoModal
        visible={showModal}
        onDismiss={handleCloseModal}
        userInfo={modalUserInfo}
      />
    </>
  );

  function goToChatRoom(chat: ChatType) {
    // Prefetch the chat data
    queryClient.prefetchQuery({
      queryKey: ["chatMessages", chat.chatId],
      queryFn: () => fetchChatMessages(chat.chatId),
    });

    // Navigate immediately with minimal data
    navigation.navigate("ChatRoom", {
      otherUserData: chat.otherUser,
      chatId: chat.chatId,
      lastReadMessageId: chat.lastReadMessageId,
    });
  }

  function handleOpenModal(chat: ChatType) {
    setModalUserInfo(chat);
    setShowModal(true);
  }

  function handleCloseModal() {
    setShowModal(false);
  }

  function renderItem({ item }: { item: ChatType }) {
    return (
      <UserCard
        chat={item}
        onAvatarPress={handleOpenModal}
        goToChatRoom={goToChatRoom}
      />
    );
  }

  async function fetchChatsList(): Promise<ChatsType> {
    try {
      const { chats } = await axios.get("/chats").then((res) => res.data);

      return chats;
    } catch (error) {
      console.error("Error sending location to server:", error);
      return []; // Return an empty array in case of error
    }
  }

  function filteredData() {
    return chats?.filter((chat) => {
      return chat.otherUser.nickname
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());
    });
  }
};

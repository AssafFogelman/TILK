import { View } from "react-native";
import { useMutation, useQuery, UseQueryResult } from "@tanstack/react-query";
import { FlashList } from "@shopify/flash-list";
import { List } from "react-native-paper";

import {
  ErrorView,
  LoadingView,
  NoDataView,
} from "../components/connections-screen-components/StatusViews";
import {
  ChatsType,
  ChatType,
  ConnectionsScreenNavigationProp,
  ConnectionsScreenUser,
} from "../types/types";
import { useEffect, useState } from "react";
import { UserInfoModal } from "../components/connections-screen-components/UserInfoModal";
import { useNavigation, useRoute } from "@react-navigation/native";
import axios, { isAxiosError } from "axios";
import { queryClient } from "../services/queryClient";
import { UserCard } from "../components/chats-screen-components/UserCardChats";

// why do we need a "connections" tab?
// because the user needs to see who sent him a connection request.
// in addition, if the user wants to start a chat with a connection, he can find him here.
// TODO: we might need to add a search bar here, so the user can search for a connection by nickname.
export const ChatsScreen = ({ searchQuery }: { searchQuery: string }) => {
  const [modalUserInfo, setModalUserInfo] =
    useState<ConnectionsScreenUser | null>(null);
  const [showModal, setShowModal] = useState(false);

  const {
    data: chats,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["chatsList"],
    queryFn: fetchChatsList,
  });
  async function fetchChatsList(): Promise<ChatsType> {
    try {
      const { chats } = await axios.get("/chats").then((res) => res.data);

      return chats;
    } catch (error) {
      console.error("Error sending location to server:", error);
      return []; // Return an empty array in case of error
    }
  }
  // mark unread messages as read when the screen blurs
  const navigation = useNavigation<ConnectionsScreenNavigationProp>();
  // define mutation
  const { mutate: markAsReadMutation } = useMutation({
    mutationFn: markAsReadFunction,
    onSuccess: invalidateQuery,
  });

  // when the screen blurs, mark the unread connection requests as read
  useSetBlurListener();

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
          keyExtractor={(item) =>
            "isSeparator" in item ? item.title : item.userId
          }
        />
      </View>

      <UserInfoModal
        visible={showModal}
        onDismiss={handleCloseModal}
        userInfo={modalUserInfo}
      />
    </>
  );

  function handleOpenModal(user: ConnectionsScreenUser) {
    setModalUserInfo(user);
    setShowModal(true);
  }

  function handleCloseModal() {
    setShowModal(false);
  }

  function renderItem({ item }: { item: ChatType }) {
    return <UserCard chat={item} onAvatarPress={handleOpenModal} />;
  }

  async function markAsReadFunction() {
    try {
      // get the ids of the users who sent a connection request
      const requestingUsersIds = chats
        ?.filter(
          (item): item is ChatType => "unread" in item && item.unread === true
        )
        .map((item) => item.otherUser.userId);
      // mark the connection requests as read
      if (requestingUsersIds && requestingUsersIds.length > 0) {
        await axios.post("/user/mark-as-read", requestingUsersIds);
      }
    } catch (error) {
      console.error(
        "error marking unread connection requests as read",
        isAxiosError(error) ? error.response?.data.message : error
      );
    }
  }

  function invalidateQuery() {
    queryClient.invalidateQueries({ queryKey: ["connectionsList"] });
  }

  function useSetBlurListener() {
    useEffect(() => {
      const markAsRead = navigation.addListener("blur", () => {
        markAsReadMutation();
      });

      return markAsRead;
    });
  }

  function filteredData() {
    return chats?.filter((item) => {
      if ("isSeparator" in item) return true;
      return item.otherUser.nickname
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());
    });
  }
};

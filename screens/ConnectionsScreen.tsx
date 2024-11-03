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
  ConnectionsListItem,
  ConnectionsListType,
  ConnectionsScreenNavigationProp,
  ConnectionsScreenTabRouteProp,
  ConnectionsScreenUser,
} from "../types/types";
import { UserCard } from "../components/connections-screen-components/UserCardConnections";
import { useEffect, useState } from "react";
import { UserInfoModal } from "../components/connections-screen-components/UserInfoModal";
import { useNavigation, useRoute } from "@react-navigation/native";
import axios, { isAxiosError } from "axios";
import { queryClient } from "../services/queryClient";

// why do we need a "connections" tab?
// because the user needs to see who sent him a connection request.
// in addition, if the user wants to start a chat with a connection, he can find him here.
// TODO: we might need to add a search bar here, so the user can search for a connection by nickname.
export const ConnectionsScreen = () => {
  const [modalUserInfo, setModalUserInfo] =
    useState<ConnectionsScreenUser | null>(null);
  const [showModal, setShowModal] = useState(false);

  const route = useRoute<ConnectionsScreenTabRouteProp>();
  const { searchQuery } = route.params;

  const { isPending, isError, data }: UseQueryResult<ConnectionsListType> =
    useQuery({
      queryKey: ["connectionsList"],
    });
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
  if (data?.length === 0) return <NoDataView />;

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

  function renderItem({ item }: { item: ConnectionsListItem }) {
    if ("isSeparator" in item) {
      return <List.Subheader>{item.title}</List.Subheader>;
    }
    return <UserCard user={item} onAvatarPress={handleOpenModal} />;
  }

  async function markAsReadFunction() {
    try {
      // get the ids of the users who sent a connection request
      const requestingUsersIds = data
        ?.filter(
          (item): item is ConnectionsScreenUser =>
            "unread" in item && item.unread === true
        )
        .map((item) => item.userId);
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
    return data?.filter((item) => {
      if ("isSeparator" in item) return true;
      return item.nickname?.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }
};

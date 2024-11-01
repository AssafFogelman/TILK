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
  ConnectionsScreenUser,
} from "../types/types";
import { UserCard } from "../components/connections-screen-components/UserCardConnections";
import { useEffect, useState } from "react";
import { UserInfoModal } from "../components/connections-screen-components/UserInfoModal";
import { useNavigation } from "@react-navigation/native";
import { queryClient } from "../App";

// why do we need a "connections" tab?
// because the user needs to see who sent him a connection request.
// in addition, if the user wants to start a chat with a connection, he can find him here.
// TODO: we might need to add a search bar here, so the user can search for a connection by nickname.
export const ConnectionsScreen = () => {
  const [modalUserInfo, setModalUserInfo] =
    useState<ConnectionsScreenUser | null>(null);
  const [showModal, setShowModal] = useState(false);
  const { isPending, isError, data }: UseQueryResult<ConnectionsListType> =
    useQuery({
      queryKey: ["connectionsList"],
    });
  // mark unread messages as read when the screen blurs
  const navigation = useNavigation<ConnectionsScreenNavigationProp>();
  const markAsReadMutation = useMutation({
    mutationFn: async () => {
      try {
        
      }
      // Update the cache directly
      // return queryClient.setQueryData<ConnectionsListType>(
      //   ["connectionsList"],
      //   (oldData) => {
      //     if (!oldData) return oldData;
      //     return oldData.map((item) => {
      //       if ("isSeparator" in item) return item;
      //       return {
      //         ...item,
      //         unread: false,
      //       };
      //     });
      //   }
      // );
    },
  });

  useEffect(() => {
    const markAsRead = navigation.addListener("blur", () => {
      markAsReadMutation.mutate();
    });

    return markAsRead;
  }, [navigation]);

  if (isPending) return <LoadingView />;
  if (isError) return <ErrorView />;
  if (data?.length === 0) return <NoDataView />;

  return (
    <>
      <View style={{ padding: 10, flex: 1 }}>
        <FlashList
          data={data}
          renderItem={renderItem}
          // estimatedItemSize={109}
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
};

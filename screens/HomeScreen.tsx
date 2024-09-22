import React, { useCallback, useState } from "react";
import { View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useLocation } from "../LocationContext";
import { knnDataItemType } from "../types/types";
import { UserCard } from "../components/home-screen-components/UserCard";
import { UserInfoModal } from "../components/home-screen-components/UserInfoModal";
import { ListHeader } from "../components/home-screen-components/ListHeader";
import { Separator } from "../components/home-screen-components/Separator";
import {
  LoadingView,
  ErrorView,
  NoDataView,
} from "../components/home-screen-components/StatusViews";
import { useStartLocationTracking } from "../hooks/home-screen-hooks/useStartLocationTracking";
import { useSetCurrentlyConnected } from "../hooks/home-screen-hooks/useSetCurrentlyConnected";

const HomeScreen = () => {
  const [modalUserInfo, setModalUserInfo] = useState<knnDataItemType | null>(
    null
  );
  const [showModal, setShowModal] = useState(false);
  const { knnDataIsLoading, knnDataIsError, knnData } = useLocation();

  useStartLocationTracking();
  useSetCurrentlyConnected();

  const handleOpenModal = useCallback((user: knnDataItemType) => {
    setModalUserInfo(user);
    setShowModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
  }, []);

  const renderUserCard = useCallback(
    ({ item }: { item: knnDataItemType }) => (
      <UserCard user={item} onAvatarPress={handleOpenModal} />
    ),
    []
  );

  if (knnDataIsLoading) return <LoadingView />;
  if (knnDataIsError) return <ErrorView />;
  if (!knnData || knnData.length === 0) return <NoDataView />;

  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: 10, flex: 1 }}>
        <FlashList
          data={knnData}
          renderItem={renderUserCard}
          estimatedItemSize={59}
          keyExtractor={(item) => item.user_id}
          ItemSeparatorComponent={Separator}
          ListHeaderComponent={(props) => ListHeader({ ...props, knnData })}
        />
      </View>
      <UserInfoModal
        visible={showModal}
        onDismiss={handleCloseModal}
        userInfo={modalUserInfo}
      />
    </View>
  );
};

export default HomeScreen;

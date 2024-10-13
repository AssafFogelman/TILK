import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { FAB } from "react-native-paper";
import { useLocation } from "../LocationContext";
import { HomeScreenNavigationProp, knnDataItemType } from "../types/types";
import { UserCard } from "../components/home-screen-components/UserCard";
import { UserInfoModal } from "../components/home-screen-components/UserInfoModal";
import { ListHeader } from "../components/home-screen-components/ListHeader";
import { Separator } from "../components/home-screen-components/Separator";
import {
  LoadingView,
  ErrorView,
  NoDataView,
} from "../components/home-screen-components/StatusViews";
import { useSetCurrentlyConnected } from "../hooks/home-screen-hooks/useSetCurrentlyConnected";
import { useNavigation } from "@react-navigation/native";
import Entypo from "@expo/vector-icons/Entypo";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const HomeScreen = () => {
  const [modalUserInfo, setModalUserInfo] = useState<knnDataItemType | null>(
    null
  );
  const [showModal, setShowModal] = useState(false);
  const { knnDataIsLoading, knnDataIsError, knnData } = useLocation();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  useSetCurrentlyConnected();
  // Fetch connections list after knnData is loaded
  // useQuery({
  //   queryKey: ["connectionsList"],
  //   queryFn: fetchConnectionsList,
  //   //start fetching connections only when knnData is loaded
  //   enabled: !knnDataIsLoading,
  // });

  //wanted behavior:
  // at the start, fetch knn data
  //every set interval, refetch the knn data
  //start a location subscription (in this screen or on the main screen?
  // let's try on this screen)

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
      <FAB
        icon={() => <Entypo name="megaphone" size={24} color="black" />}
        style={styles.fab}
        size={"medium"}
        onPress={() => navigation.navigate("LookingTo")}
      />
      <UserInfoModal
        visible={showModal}
        onDismiss={handleCloseModal}
        userInfo={modalUserInfo}
      />
    </View>
  );

  function handleOpenModal(user: knnDataItemType) {
    setModalUserInfo(user);
    setShowModal(true);
  }

  function handleCloseModal() {
    setShowModal(false);
  }

  function renderUserCard({ item }: { item: knnDataItemType }) {
    return <UserCard user={item} onAvatarPress={handleOpenModal} />;
  }
};

async function fetchConnectionsList() {
  try {
    const response = await axios.get(
      `http://${process.env.EXPO_PUBLIC_SERVER_ADDRESS}/user/get-connections-list`
    );
    return response.data;
  } catch (error) {
    console.log("Error fetching connections list:", error);
  }
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    margin: 50,
    right: 0,
    bottom: 0,
  },
});

export default HomeScreen;

import React, { useState } from "react";
import { View, StyleSheet, AppState } from "react-native";
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
import * as Location from "expo-location";
// regardless of the location changes, perform the KNN query every LOCATION_INTERVAL
const LOCATION_INTERVAL = 2 * 60 * 1000; // 2 minutes in milliseconds

const HomeScreen = () => {
  const [modalUserInfo, setModalUserInfo] = useState<knnDataItemType | null>(
    null
  );
  const [showModal, setShowModal] = useState(false);
  const { subscribe, currentLocation } = useLocation();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  //set the user as "currently connected"
  useSetCurrentlyConnected();

  const {
    data: knnData,
    isLoading: knnDataIsLoading,
    isError: knnDataIsError,
  } = useQuery({
    queryKey: ["knnData", currentLocation],
    queryFn: () => sendLocationToServer(currentLocation),
    refetchInterval: LOCATION_INTERVAL,
  });

  // Fetch connections list after knnData is loaded
  // useQuery({
  //     queryKey: ["connectionsList"],
  //     queryFn: fetchConnectionsList,
  //     //start fetching connections only when knnData is loaded
  //     enabled: !knnDataIsLoading,
  //   });
  //start location subscription. I wish the fetching would have happened only after the subscription started. we''ll see how this works.
  subscribe();
  //wanted behavior:
  // at the start, fetch knn data
  //every set interval, refetch the knn data
  //start a location subscription (in this screen or on the main screen?
  // let's try on this screen)

  //if we can't get the location, or if we are in the fetching process, show loading
  if (currentLocation === null || knnDataIsLoading) return <LoadingView />;
  //if there's an error, show error
  if (knnDataIsError) return <ErrorView />;
  //if there's no data, show no data
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
  async function sendLocationToServer(
    location: Location.LocationObject | null
  ) {
    if (!location || AppState.currentState !== "active") return;

    try {
      const { data } = await axios.post("/location", {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        limit: 20,
      });

      return data.knn;
    } catch (error) {
      console.error("Error sending location to server:", error);
    }
  }
};

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    margin: 50,
    right: 0,
    bottom: 0,
  },
});

export default HomeScreen;

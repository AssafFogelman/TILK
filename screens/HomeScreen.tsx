import React, { useEffect, useState } from "react";
import { View, StyleSheet, AppState, I18nManager } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { FAB } from "react-native-paper";
import { useLocation } from "../context/LocationContext";
import {
  ConnectionsListType,
  HomeScreenNavigationProp,
  knnDataItemType,
  knnDataType,
} from "../types/types";
import { UserCard } from "../components/home-screen-components/UserCardKNN";
import { UserInfoModal } from "../components/home-screen-components/UserInfoModal";
import { ListHeader } from "../components/home-screen-components/ListHeader";
import { Separator } from "../components/home-screen-components/Separator";
import {
  LoadingView,
  ErrorView,
  NoDataView,
} from "../components/home-screen-components/StatusViews";
import { useNavigation } from "@react-navigation/native";
import Entypo from "@expo/vector-icons/Entypo";
import { useQuery } from "@tanstack/react-query";
import axios, { AxiosError, isAxiosError } from "axios";
import * as Location from "expo-location";
import { useNotification } from "../context/NotificationContext";
import { useAuthState } from "../context/AuthContext";
import { uploadExpoPushToken } from "../services/uploadExpoPushToken";
// regardless of the location changes, perform the KNN query every LOCATION_INTERVAL
const LOCATION_INTERVAL = 2 * 60 * 1000; // 2 minutes in milliseconds

const HomeScreen = () => {
  const [modalUserInfo, setModalUserInfo] = useState<knnDataItemType | null>(
    null
  );
  const [showModal, setShowModal] = useState(false);
  const { expoPushToken } = useNotification();
  const { subscribe, currentLocation } = useLocation();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  // Set up location subscription
  useEffect(() => {
    subscribe();
  });

  //upload the expo push token to the database
  useEffect(() => {
    if (expoPushToken) {
      uploadExpoPushToken(expoPushToken);
    }
  }, [expoPushToken]);

  const {
    data: knnData,
    isPending: knnDataIsLoading,
    isError: knnDataIsError,
  } = useQuery({
    queryKey: ["knnData", currentLocation],
    queryFn: () => sendLocationToServer(currentLocation),
    refetchInterval: LOCATION_INTERVAL,
    enabled: !!currentLocation,
  });

  // Fetch connections list after knnData is loaded
  useQuery({
    queryKey: ["connectionsList"],
    queryFn: fetchConnectionsList,
    //start fetching connections only when knnData is loaded
    enabled: !knnDataIsLoading,
  });

  //if we can't get the location, or if we are in the fetching process, show loading
  if (currentLocation === null || knnDataIsLoading) return <LoadingView />;
  //if there's an error, show error
  if (knnDataIsError) return <ErrorView />;
  //if there's no data, show a no data message
  if (knnData?.length === 0) return <NoDataView />;

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
        icon={() => (
          <Entypo
            name="megaphone"
            size={24}
            color="black"
            style={I18nManager.isRTL ? styles.rtlIcon : null}
          />
        )}
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

  async function fetchConnectionsList(): Promise<ConnectionsListType> {
    try {
      const response = await axios.get(`/user/get-connections-list`);
      return response.data;
    } catch (error) {
      console.error("Error fetching connections list:", error);
      if (error instanceof AxiosError) {
        console.error("Axios error details:", error.response?.data);
      }
      return []; // Return an empty array in case of error
    }
  }

  async function sendLocationToServer(
    location: Location.LocationObject | null
  ): Promise<knnDataType> {
    // Return an empty array if there's no location or if the app is not active
    if (!location || AppState.currentState !== "active") return [];

    try {
      const { data } = await axios.post("/location", {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        limit: 20,
      });

      return data.knn;
    } catch (error) {
      if (isAxiosError(error)) {
        console.error("Error fetching knn data:", error.response?.data);
      } else {
        console.error("Error fetching knn data:", error);
      }
      return []; // Return an empty array in case of error
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
  rtlIcon: {
    transform: [{ scaleX: -1 }],
  },
});

export default HomeScreen;

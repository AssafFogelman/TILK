import { FlatList, Image, Pressable, StyleSheet, View } from "react-native";
import React, {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
// import { UserContext } from "../UserContext";
import { getData } from "../config/asyncStorage";
import axios from "axios";
import { ObjectId } from "mongoose";
import UserSmallDetails from "../components/UserSmallDetails";
import { useHandleAppStateChange } from "../hooks/useHandleAppStateChange";
import { socket } from "../socket";
import { useAuthState } from "../AuthContext";
import {
  HomeProps,
  HomeScreenNavigationProp,
  HomeScreenRouteProp,
  knnDataItemType,
  PhoneVerificationScreenRouteProp,
} from "../types/types";
import * as Location from "expo-location";
import {
  ActivityIndicator,
  Avatar,
  Badge,
  Button,
  Card,
  Chip,
  Portal,
  Text,
  Modal,
} from "react-native-paper";
import { useTheme } from "react-native-paper";
import { FlashList } from "@shopify/flash-list";
import { log } from "expo/build/devtools/logger";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import ChatScreen from "./ChatScreen";
import ConnectionsScreen from "./ConnectionsScreen";
//between which distances should there be a separator between cards
const distances = [50, 100, 200, 500, 1000, 5000, 10000];
/* TODO

 * add "bottom sheet" from RN Paper
 */

const Tab = createBottomTabNavigator();

const HomeScreen = (props: HomeProps) => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { userId } = useAuthState();
  const theme = useTheme();
  const [modalUserInfo, setModalUserInfo] = useState<knnDataItemType | null>(
    null,
  );
  const [showModal, setShowModal] = useState(false);
  const {
    startDeviceMotionTracking,
    startLocationTrackingInterval,
    knnDataIsLoading,
    knnDataIsError,
    knnData,
  } = props;

  //start location tracking
  useLocationTracking();

  //create a websocket connection
  //and set the userId to the server as "currently connected".
  useSetCurrentlyConnected();

  //set the header
  useSetHeader();

  //when minimizing and returning to app - check if location is enabled. FIXME is this at all necessary?
  // useHandleAppStateChange();
  type leftContentPropsType = knnDataItemType & {
    size: number;
  };

  const LeftContent = (props: leftContentPropsType) => {
    const { small_avatar, ...otherProps } = props;
    return (
      <Pressable
        onPress={() => {
          setModalUserInfo(props);
          setShowModal(true);
        }}
      >
        <Avatar.Image
          {...otherProps}
          source={{
            uri: process.env.EXPO_PUBLIC_SERVER_ADDRESS + small_avatar,
          }}
        ></Avatar.Image>
      </Pressable>
    );
  };

  //user card
  const userCard = useCallback(
    ({ item }: { item: knnDataItemType }) => (
      <Card>
        <Card.Title
          title={item.nickname}
          subtitle={item.gender + ", " + age(new Date(item.date_of_birth))}
          left={(props) => LeftContent({ ...props, ...item })}
          right={(props) =>
            item.currently_connected ? (
              <Badge
                size={15}
                style={{
                  backgroundColor: "chartreuse",
                  marginEnd: 20,
                  borderWidth: 1,
                  borderColor: "whitesmoke",
                }}
              ></Badge>
            ) : undefined
          }
        />
        <Card.Content>
          <FlatList
            data={item.tags}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <Chip style={{ marginRight: 2 }}>{item}</Chip>
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </Card.Content>
        <Card.Actions>
          <Button>Cancel</Button>
          <Button>Ok</Button>
        </Card.Actions>
      </Card>
    ),
    [],
  );

  // the separator
  function Separator({
    leadingItem,
    trailingItem,
  }: {
    leadingItem: knnDataItemType;
    trailingItem: knnDataItemType;
  }) {
    return (
      <View style={{ flex: 1, alignSelf: "center", marginVertical: 5 }}>
        <Chip
          textStyle={{
            fontSize: 11,
            marginVertical: 2,
            color: theme.colors.onSurfaceVariant,
          }}
          style={{ backgroundColor: theme.colors.surfaceVariant }}
        >
          {distanceMessage(leadingItem.distance, trailingItem.distance)}
        </Chip>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {knnDataIsLoading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator animating={true} size={"large"} />
        </View>
      ) : knnDataIsError ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text>Could not load nearby users...</Text>
        </View>
      ) : !knnData || knnData.length === 0 ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text>Could not find any nearby users...</Text>
        </View>
      ) : (
        <View style={{ padding: 10, flex: 1 }}>
          <FlashList
            data={knnData}
            renderItem={userCard}
            estimatedItemSize={59}
            keyExtractor={(item) => item.user_id}
            ItemSeparatorComponent={Separator}
            ListHeaderComponent={ListHeader}
          />
        </View>
      )}
      <Portal>
        <Modal
          visible={showModal}
          onDismiss={() => {
            setShowModal(false);
          }}
          contentContainerStyle={{
            marginHorizontal: 10,
            backgroundColor: theme.colors.surface,
            padding: 20,
            maxHeight: "80%",
            borderRadius: 25,
          }}
        >
          {modalUserInfo !== null && (
            <View style={{ gap: 10 }}>
              <Image
                style={{
                  width: "100%",
                  aspectRatio: 1,
                }}
                resizeMode="cover"
                source={{
                  uri:
                    process.env.EXPO_PUBLIC_SERVER_ADDRESS +
                    modalUserInfo.original_avatars[0],
                }}
              />
              <Text variant="titleMedium">Bio:</Text>
              <Text>{modalUserInfo.biography}</Text>
            </View>
          )}
        </Modal>
      </Portal>
    </View>
  );

  function distanceMessage(
    leadingItemDistance: number | undefined,
    trailingItemDistance: number,
  ) {
    let leadingItemDistanceIsSmallerThanCellNo = 0;
    let trailingItemDistanceIsSmallerThanCellNo = 0;

    const properDistance = (distance: number) => {
      //convert precise distance into meters or KM
      if (distance >= 1000) return Math.trunc(distance / 1000) + " KM";
      return Math.trunc(distance) + " Meters";
    };

    for (let i = 0; i < distances.length; i++) {
      //go over all the distance categories.
      //find between which distance categories do the trailing and/or leading cell lay

      if (leadingItemDistance !== undefined) {
        //if this is the header separator, then we only care about the trailing Item

        if (leadingItemDistance > distances[i]) {
          //if the distance is greater than a certain cell, it assumes that the distance is smaller than the next cell
          //if we reach the end of the array, and still the distance is greater than the last cell, it will get the value of array.length
          leadingItemDistanceIsSmallerThanCellNo = i + 1;
        }
      }
      if (trailingItemDistance > distances[i]) {
        //if the distance is greater than a certain cell, it assumes that the distance is smaller than the next cell
        //if we reach the end of the array, and still the distance is greater than the last cell, it will get the value of array.length
        trailingItemDistanceIsSmallerThanCellNo = i + 1;
      }
    }

    //if this is the header separator
    if (leadingItemDistance === undefined) {
      return properDistance(distances[trailingItemDistanceIsSmallerThanCellNo]);
    }

    //if both items are in the same distance category, return null
    if (
      leadingItemDistanceIsSmallerThanCellNo ===
      trailingItemDistanceIsSmallerThanCellNo
    ) {
      return null;
    }

    //if the distance is greater than any of the distance categories, write that
    if (trailingItemDistanceIsSmallerThanCellNo === distances.length) {
      return `more than ${properDistance(distances[distances.length - 1])}`;
    }
    //return "less than" the next cell
    return properDistance(distances[trailingItemDistanceIsSmallerThanCellNo]);
  }

  function ListHeader() {
    return (
      knnData !== null &&
      knnData.length !== 0 && (
        <View style={{ flex: 1, alignSelf: "center", marginBottom: 5 }}>
          <Chip
            textStyle={{
              fontSize: 11,
              marginVertical: 2,
              color: theme.colors.onSurfaceVariant,
            }}
            style={{ backgroundColor: theme.colors.surfaceVariant }}
          >
            {distanceMessage(undefined, knnData[0].distance)}
          </Chip>
        </View>
      )
    );
  }

  function age(dateOfBirth: Date) {
    const diff_ms = Date.now() - dateOfBirth.getTime();
    const age_dt = new Date(diff_ms);

    return Math.abs(age_dt.getUTCFullYear() - 1970) + "";
  }

  function useLocationTracking() {
    useEffect(() => {
      //subscribe to location updates
      startDeviceMotionTracking();
      //start an interval for location acquirement.
      startLocationTrackingInterval();
    }, []);
  }

  function useSetCurrentlyConnected() {
    useEffect(() => {
      (async () => {
        socket.connect();
        socket.emit("setCurrentlyConnected", userId);
      })();
      //the socket is removed in the "app.js" file in order that the user will be
      //registered as off-line only when the app is closed, and not when "homeScreen" is unmounted
    }, []);
  }

  function useSetHeader() {
    useEffect(() => {
      navigation.setOptions({
        headerTitle: "",
        headerLeft: () => (
          <Text style={{ fontSize: 16, fontWeight: "bold" }}>Tilk</Text>
        ),
        headerRight: () => (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Ionicons
              onPress={() => {
                navigation.navigate("Chats");
              }}
              name="chatbox-ellipses-outline"
              size={24}
              color="black"
            />

            <MaterialIcons
              onPress={() => {
                navigation.navigate("Friends");
              }}
              name="people-outline"
              size={24}
              color="black"
            />
          </View>
        ),
      });
    }, []);
  }
};

export default HomeScreen;

const styles = StyleSheet.create({});

import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  I18nManager,
  Alert,
  Image,
} from "react-native";
import { Entypo, MaterialIcons } from "@expo/vector-icons";
import { Text, useTheme, Searchbar } from "react-native-paper";
import AntDesign from "@expo/vector-icons/AntDesign";
import { UserType } from "../../types/types";

type TabHeaderProps = {
  handleGoBack: () => void;
  selectedMessagesCount: number;
  otherUserData: UserType;
};

export const ChatRoomHeader: React.FC<TabHeaderProps> = ({
  handleGoBack,
  selectedMessagesCount,
  otherUserData,
}) => {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.elevation.level2 },
      ]}
    >
      {/* if there are selected messages, show their amount. if not, show chat recipient details */}
      {selectedMessagesCount > 0 ? (
        <View>
          <Text style={{ fontSize: 16, fontWeight: "500" }}>
            {selectedMessagesCount}
          </Text>
        </View>
      ) : (
        <View style={styles.titleContainer}>
          <TouchableOpacity
            style={{ flexDirection: "row", alignItems: "center" }}
            onPress={handleGoBack}
          >
            <AntDesign
              name={I18nManager.isRTL ? "arrowright" : "arrowleft"}
              size={20}
              color={theme.colors.onSurface}
            />
            <View style={{ marginHorizontal: 1 }}>
              <Image
                source={{
                  uri:
                    process.env.EXPO_PUBLIC_SERVER_ADDRESS +
                    otherUserData.smallAvatar,
                }}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                }}
              />
            </View>
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.colors.onSurface }]}>
            {otherUserData.nickname}
          </Text>
        </View>
      )}
      <View style={styles.endCornerContainer}>
        {
          // shows only if the user selected messages
          selectedMessagesCount > 0 ? (
            <View
              style={{
                flexDirection: "row-reverse",
                alignItems: "center",
                gap: 10,
              }}
            >
              <MaterialIcons
                onPress={() => {
                  deleteSelectedMessages();
                }}
                name="delete"
                size={24}
                color="black"
              />
            </View>
          ) : (
            <TouchableOpacity onPress={onMenuPress}>
              <Entypo
                name="dots-three-vertical"
                size={20}
                color={theme.colors.onSurface}
                style={{ color: theme.colors.onSurface }}
              />
            </TouchableOpacity>
          )
        }
      </View>
    </View>
  );

  function deleteSelectedMessages() {
    Alert.alert("delete pressed");
  }

  function onMenuPress() {
    Alert.alert("menu pressed");
  }
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  titleContainer: {
    flex: 1,
    flexDirection: "row",
    paddingHorizontal: 10,
    alignItems: "center",
    gap: 10,
  },

  endCornerContainer: {
    flexDirection: "row",
    gap: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  searchContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  searchBar: {
    elevation: 0,
    backgroundColor: "transparent",
  },
});

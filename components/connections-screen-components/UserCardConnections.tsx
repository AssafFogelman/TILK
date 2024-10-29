import React, { useCallback } from "react";
import { Pressable, FlatList } from "react-native";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Chip,
  useTheme,
} from "react-native-paper";
import { knnDataItemType } from "../../types/types";
import { age } from "../../utils/dateUtils";

export const UserCard = ({
  user,
  onAvatarPress,
}: {
  user: knnDataItemType;
  onAvatarPress: (user: knnDataItemType) => void;
}) => {
  const theme = useTheme();

  const LeftContent = () => (
    <Pressable onPress={() => onAvatarPress(user)}>
      <Avatar.Image
        size={40}
        source={{
          uri: process.env.EXPO_PUBLIC_SERVER_ADDRESS + user.small_avatar,
        }}
      />
    </Pressable>
  );

  const RightContent = () =>
    user.currently_connected ? (
      <Badge
        size={15}
        style={{
          backgroundColor: "chartreuse",
          marginEnd: 20,
          borderWidth: 1,
          borderColor: "whitesmoke",
        }}
      />
    ) : null;

  return (
    <Card>
      <Card.Title
        title={user.nickname}
        subtitle={`${user.gender}, ${age(new Date(user.date_of_birth))}`}
        left={LeftContent}
        right={RightContent}
      />
      <Card.Content>
        <FlatList
          data={user.tags}
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
        {/* {connectionIcon()} */}
        <Button>Ok</Button>
      </Card.Actions>
    </Card>
  );
};

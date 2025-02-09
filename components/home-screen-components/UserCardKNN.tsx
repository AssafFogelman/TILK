import {
  Pressable,
  FlatList,
  I18nManager,
  TouchableOpacity,
} from "react-native";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Chip,
  Menu,
  useTheme,
} from "react-native-paper";
import {
  ConnectionsCategory,
  ConnectionsListItem,
  knnDataItemType,
} from "../../types/types";
import { age } from "../../utils/dateUtils";
import Entypo from "@expo/vector-icons/Entypo";
import { useCallback, useState } from "react";
import { useBlockUser } from "../../hooks/useBlockUser";
import { useUnsendConnectionRequest } from "../../hooks/useUnsendConnectionRequest";
import { queryClient } from "../../services/queryClient";
import { useSendConnectionRequest } from "../../hooks/useSendConnectionRequest";
import { useQuery } from "@tanstack/react-query";

export const UserCard = ({
  user,
  onAvatarPress,
}: {
  user: knnDataItemType;
  onAvatarPress: (user: knnDataItemType) => void;
}) => {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);
  const { mutate: blockUser } = useBlockUser();
  const { mutate: sendConnectionRequest } = useSendConnectionRequest();
  const { mutate: unsendConnectionRequest } = useUnsendConnectionRequest();
  const { data: connectionsList } = useQuery<ConnectionsListItem[]>({
    queryKey: ["connectionsList"],
  });

  const sentRequest = connectionsList?.some(
    (connection) =>
      connection.userId === user.user_id &&
      connection.category === ConnectionsCategory.SENT_REQUEST
  );

  const LeftContent = useCallback(
    () => (
      <Pressable onPress={() => onAvatarPress(user)}>
        <Avatar.Image
          size={40}
          source={{
            uri: process.env.EXPO_PUBLIC_SERVER_ADDRESS + user.small_avatar,
          }}
        />
        {user.currently_connected && (
          <Badge
            size={10}
            style={[
              {
                backgroundColor: "chartreuse",
                borderWidth: 1,
                borderColor: "whitesmoke",
                position: "absolute",
                top: -2,
              },
              I18nManager.isRTL ? { left: 2 } : { right: 2 },
            ]}
          />
        )}
      </Pressable>
    ),
    [onAvatarPress, user]
  );

  const RightContent = useCallback(
    () => (
      <Menu
        visible={visible}
        onDismiss={() => setVisible(false)}
        anchor={
          <TouchableOpacity
            style={{ marginEnd: 10, marginTop: -15 }}
            onPress={() => setVisible(true)}
          >
            <Entypo
              name="dots-three-vertical"
              size={17}
              color={theme.colors.onSurface}
              style={{ color: theme.colors.onSurface }}
            />
          </TouchableOpacity>
        }
      >
        <Menu.Item
          onPress={() => {
            setVisible(false);
            blockUser({
              userId: user.user_id,
              nickname: user.nickname,
              smallAvatar: user.small_avatar,
            });
          }}
          title="Block user"
        />
      </Menu>
    ),
    [
      blockUser,
      theme.colors.onSurface,
      visible,
      user.user_id,
      user.nickname,
      user.small_avatar,
    ]
  );

  return (
    <Card style={{ marginVertical: 5, marginHorizontal: 3 }}>
      <Card.Title
        title={user.nickname}
        subtitle={`${user.gender}${
          user.date_of_birth !== null
            ? ", " + age(new Date(user.date_of_birth))
            : ""
        }`}
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
        {sentRequest ? (
          <Button
            onPress={() => {
              unsendConnectionRequest(user.user_id);
            }}
          >
            Request sent
          </Button>
        ) : (
          <Button
            onPress={() => {
              sendConnectionRequest(user);
            }}
          >
            Connect
          </Button>
        )}
      </Card.Actions>
    </Card>
  );
};

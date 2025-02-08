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
  ConnectionsScreenUser,
  connectionsUserActionsStates,
} from "../../types/types";
import { age } from "../../utils/dateUtils";
import Entypo from "@expo/vector-icons/Entypo";
import { useBlockUser } from "../../hooks/useBlockUser";
import { useState } from "react";
import { useDisconnectFromUser } from "../../hooks/useDisconnectFromUser";

export const UserCard = ({
  user,
  onAvatarPress,
}: {
  user: ConnectionsScreenUser;
  onAvatarPress: (user: ConnectionsScreenUser) => void;
}) => {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);
  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);
  const { mutate: blockUser } = useBlockUser();
  const { mutate: disconnectFromUser } = useDisconnectFromUser();
  const LeftContent = () => (
    <Pressable onPress={() => onAvatarPress(user)}>
      <Avatar.Image
        size={40}
        source={{
          uri: process.env.EXPO_PUBLIC_SERVER_ADDRESS + user.smallAvatar,
        }}
      />
      {user.currentlyConnected && (
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
  );

  const RightContent = () => (
    <Menu
      visible={visible}
      onDismiss={closeMenu}
      anchor={
        <TouchableOpacity
          style={{ marginEnd: 10, marginTop: -15 }}
          onPress={openMenu}
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
          closeMenu();
          blockUser({
            userId: user.userId,
            nickname: user.nickname,
            smallAvatar: user.smallAvatar,
          });
        }}
        title="Block user"
      />
      {/* only show disconnect from user if the user is connected */}
      {user.userType === "connectedUser" && (
        <Menu.Item
          onPress={() => {
            closeMenu();
            disconnectFromUser(user);
          }}
          title="disconnect from user"
        />
      )}
    </Menu>
  );

  return (
    <Card
      style={{
        margin: 5,
      }}
    >
      <Card.Title
        titleStyle={user.unread ? { fontWeight: "bold" } : undefined}
        subtitleStyle={user.unread ? { fontWeight: "bold" } : undefined}
        title={user.nickname}
        subtitle={`${user.gender}${user.dateOfBirth !== null ? ", " + age(new Date(user.dateOfBirth)) : ""}`}
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
        {connectionsUserActionsStates[user.userType].map((action) => (
          <Button
            key={action}
            labelStyle={user.unread ? { fontWeight: "bold" } : undefined}
            style={user.unread ? { borderWidth: 2 } : undefined}
          >
            {action}
          </Button>
        ))}
      </Card.Actions>
    </Card>
  );
};

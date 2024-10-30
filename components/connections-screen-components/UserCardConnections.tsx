import { Pressable, FlatList } from "react-native";
import { Avatar, Badge, Button, Card, Chip } from "react-native-paper";
import {
  ConnectionsScreenUser,
  connectionsUserActionsStates,
} from "../../types/types";
import { age } from "../../utils/dateUtils";

export const UserCard = ({
  user,
  onAvatarPress,
}: {
  user: ConnectionsScreenUser;
  onAvatarPress: (user: ConnectionsScreenUser) => void;
}) => {
  const LeftContent = () => (
    <Pressable onPress={() => onAvatarPress(user)}>
      <Avatar.Image
        size={40}
        source={{
          uri: process.env.EXPO_PUBLIC_SERVER_ADDRESS + user.smallAvatar,
        }}
      />
    </Pressable>
  );

  const RightContent = () =>
    user.currentlyConnected ? (
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
        subtitle={`${user.gender}, ${user.dateOfBirth !== null && age(new Date(user.dateOfBirth))}`}
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
          <Button key={action}>{action}</Button>
        ))}
        {/* {connectionIcon()} */}
        <Button>Ok</Button>
      </Card.Actions>
    </Card>
  );
};

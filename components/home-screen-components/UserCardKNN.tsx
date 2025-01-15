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
  useTheme,
} from "react-native-paper";
import { knnDataItemType } from "../../types/types";
import { age } from "../../utils/dateUtils";
import Entypo from "@expo/vector-icons/Entypo";

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
  );

  const RightContent = () => (
    <TouchableOpacity
      style={{ marginEnd: 10, marginTop: -15 }}
      onPress={() => {}}
    >
      <Entypo
        name="dots-three-vertical"
        size={17}
        color={theme.colors.onSurface}
        style={{ color: theme.colors.onSurface }}
      />
    </TouchableOpacity>
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
        <Button>Connect</Button>
      </Card.Actions>
    </Card>
  );
};

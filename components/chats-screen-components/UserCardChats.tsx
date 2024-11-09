import { Pressable, I18nManager, View } from "react-native";
import { Avatar, Badge, Card, useTheme, Text } from "react-native-paper";
import { ChatType, MessageType } from "../../types/types";
import formatDate from "../../utils/dateUtils";

export const UserCard = ({
  chat,
  onAvatarPress,
}: {
  chat: ChatType;
  onAvatarPress: (user: ChatType) => void;
}) => {
  const LeftContent = () => (
    <Pressable onPress={() => onAvatarPress(chat)}>
      <Avatar.Image
        size={40}
        source={{
          uri:
            process.env.EXPO_PUBLIC_SERVER_ADDRESS + chat.otherUser.smallAvatar,
        }}
      />
    </Pressable>
  );

  const RightContent = () => (
    <View>
      <Text>{formatDate(chat.messages[chat.messages.length - 1].date)}</Text>
      {/* this difference between an unread chat and unread messages makes it 
      possible to mark a chat as unread even though all messages are read */}
      {chat.unread && (
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
        >
          {unreadCount(chat.messages) || ""}
        </Badge>
      )}
    </View>
  );

  return (
    <Card
      style={{
        margin: 5,
      }}
    >
      <Card.Title
        titleStyle={chat.unread ? { fontWeight: "bold" } : undefined}
        subtitleStyle={chat.unread ? { fontWeight: "bold" } : undefined}
        title={chat.otherUser.nickname}
        left={LeftContent}
        right={RightContent}
      />
    </Card>
  );
};

function unreadCount(messages: MessageType[]) {
  const unreadMessageCount = messages.filter(
    (message) => message.unread === true
  ).length;
  if (unreadMessageCount > 0) {
    return unreadMessageCount;
  }
  return null;
}

import { Pressable, I18nManager, View } from "react-native";
import { Avatar, Badge, Card, Text } from "react-native-paper";
import { ChatType, MessageType } from "../../types/types";
import formatDate from "../../utils/dateUtils";

export const UserCard = ({
  chat,
  onAvatarPress,
  goToChatRoom,
}: {
  chat: ChatType;
  onAvatarPress: (chat: ChatType) => void;
  goToChatRoom: (chat: ChatType) => void;
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
    <View
      style={{
        flex: 1,
        flexDirection: "column",
        alignItems: "flex-end",
        marginEnd: 10,
        paddingTop: 5,
        paddingBottom: 10,
        justifyContent: "space-between",
      }}
    >
      <Text style={{ color: chat.unread ? "#25D366" : "#545454" }}>
        {formatDate(chat.lastMessageDate)}
      </Text>
      {/* this difference between an unread chat and unread messages makes it 
      possible to mark a chat as unread even though all messages are read */}
      {chat.unread && (
        <Badge
          size={25}
          style={[
            {
              backgroundColor: "#25D366",
              borderWidth: 1,
              borderColor: "whitesmoke",
            },
            I18nManager.isRTL ? { left: 2 } : { right: 2 },
          ]}
        >
          {chat.unreadCount || ""}
        </Badge>
      )}
    </View>
  );

  return (
    <Pressable onPress={() => goToChatRoom(chat)}>
      <Card
        style={{
          margin: 5,
        }}
      >
        <Card.Title
          titleStyle={chat.unread ? { fontWeight: "bold" } : undefined}
          subtitleStyle={{ color: "#545454" }}
          title={chat.otherUser.nickname}
          subtitle={chat.lastMessageText}
          left={LeftContent}
          right={RightContent}
        />
      </Card>
    </Pressable>
  );
};

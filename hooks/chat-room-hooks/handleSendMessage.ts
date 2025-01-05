import { emit } from "../../APIs/emit";
import { queryClient } from "../../services/queryClient";
import { socket } from "../../services/socket/socket";
import {
  ChatType,
  MessageType,
  SendMessageResponseType,
  TilkEventType,
} from "../../types/types";

export const handleSendMessage = async (
  textInput: string,
  setTextInput: React.Dispatch<React.SetStateAction<string>>,
  chatId: string,
  userId: string,
  otherUserId: string
) => {
  const tempId = Date.now().toString();
  try {
    //create the message object
    const newMessage: MessageType = {
      messageId: tempId, // Temporary ID for optimistic update
      sentDate: new Date(),
      receivedDate: null,
      text: textInput,
      unread: true,
      //if the message is sent by the user, and then becomes read, that means that the other user read it
      //if the message is sent by the other user, and then becomes read, that means that the user read it
      //and so, when sending a message, it initially is unread, but should still look in the UI as a read sent message.
      senderId: userId,
      recipientId: otherUserId,
      gotToServer: 0,
      chatId,
    };

    // Optimistically update the chat messages query
    queryClient.setQueryData(
      ["chatMessages", chatId],
      (oldData: MessageType[] = []) => [...oldData, newMessage]
    );

    //optimistically update the chat's last message info
    queryClient.setQueryData(["chatsList"], (oldData: ChatType[] = []) => {
      if (!oldData.length) return oldData;
      return oldData.map((chat) =>
        chat.chatId === chatId
          ? {
              ...chat,
              unread: false,
              unreadCount: 0,
              lastMessageDate: newMessage.sentDate,
              lastMessageSender: newMessage.senderId,
              lastMessageText: newMessage.text,
              lastReadMessageId: newMessage.messageId, //it's the temporary id
            }
          : chat
      );
    });

    //send the message using websocket
    emit<SendMessageResponseType>(
      socket,
      "newEvent",
      { ...newMessage, eventType: TilkEventType.MESSAGE },
      acknowledgement
    );

    setTextInput("");
  } catch (error) {
    // Rollback on error
    queryClient.invalidateQueries({
      queryKey: ["chatMessages", chatId],
    });
    console.log("there was a problem sending the message:", error);
  }

  // Acknowledgment callback - update the messageId and gotToServer
  function acknowledgement(
    error: Error | null,
    response?: SendMessageResponseType
  ) {
    if (error || !response?.success) {
      //we received this error from the server, meaning that the message arrived but
      // something is off or the message was already sent by us earlier. roll back the optimistic update
      console.log("could not send message:", error);
      queryClient.invalidateQueries({ queryKey: ["chatMessages", chatId] });
      queryClient.invalidateQueries({ queryKey: ["chatsList"] });
      return;
    }
    if (response?.success) {
      // Update the temporary ID with the real one - important for selecting and deleting messages later
      queryClient.setQueryData(["chatsList"], (oldData: ChatType[] = []) => {
        if (!oldData.length) return oldData;
        oldData?.map((chat) =>
          chat.chatId === chatId
            ? {
                ...chat,
                lastReadMessageId: response.messageId,
              }
            : chat
        );
      });
      //optimistically update the chat message as gotToServer
      queryClient.setQueryData(
        ["chatMessages", chatId],
        (oldData: MessageType[] = []) => {
          if (!oldData.length) return oldData;
          return oldData.map((message) =>
            message.messageId === tempId
              ? {
                  ...message,
                  messageId: response.messageId,
                  gotToServer: true,
                }
              : message
          );
        }
      );
    }
  }
};

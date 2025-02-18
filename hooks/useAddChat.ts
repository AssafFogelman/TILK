import { useMutation } from "@tanstack/react-query";
import axios, { isAxiosError } from "axios";
import {
  ChatRoomScreenNavigationProp,
  ChatType,
  ConnectionsScreenUser,
} from "../types/types";
import { queryClient } from "../services/queryClient";
import { fetchChatMessages } from "../APIs/chatAPIs";
import { useNavigation } from "@react-navigation/native";

async function addChat(otherUser: ConnectionsScreenUser) {
  try {
    const { chatId } = await axios
      .post("/chats/add-chat", {
        otherUserId: otherUser.userId,
      })
      .then((res) => res.data);
    return { chatId };
  } catch (error) {
    if (isAxiosError(error)) {
      console.error(
        "Error declining connection request:",
        error.response?.data.message
      );

      throw new Error(
        "Error declining connection request:" + error.response?.data.message
      );
    }
    console.error("Error declining connection request:", error);
    throw new Error("Error declining connection request:" + error);
  }
}
//and go to the chat room
export function useGoToChat() {
  const navigation = useNavigation<ChatRoomScreenNavigationProp>();

  return useMutation({
    // before sending the request, optimistically update the chats list
    onMutate: (otherUser: ConnectionsScreenUser) => {
      const currentChats = queryClient.getQueryData<ChatType[]>(["chatsList"]);
      //check if there is already a chat with the other user
      const chat = currentChats?.find(
        (chat) => chat.otherUser.userId === otherUser.userId
      );
      if (chat) {
        // Prefetch the chat data
        queryClient.prefetchQuery({
          queryKey: ["chatMessages", chat.chatId],
          queryFn: () => fetchChatMessages(otherUser.userId),
        });
        //navigate to the chat room
        navigation.navigate("ChatRoom", {
          otherUserData: chat.otherUser,
          chatId: chat.chatId,
          lastReadMessageId: chat.lastReadMessageId,
        });
      } else {
        //optimistically add the chat to the chats list with a temporary chatId.
        //we will navigate to th chat only once we get a chat Id from the server.
        optimisticAddChat(otherUser);
      }
    },

    mutationFn: addChat,
    onError: () => {
      console.log("error trying to send connection request");
      //roll back the optimistic update
      queryClient.invalidateQueries({
        queryKey: ["connectionsList"],
      });
      queryClient.invalidateQueries({ queryKey: ["chatsList"] });
    },
    onSuccess: (
      { chatId }: { chatId: string },
      otherUser: ConnectionsScreenUser
    ) => {
      queryClient.invalidateQueries({ queryKey: ["connectionsList"] });
      queryClient.invalidateQueries({ queryKey: ["chatsList"] });
      //navigate to the chat room using the newly gotten chatId
      navigation.navigate("ChatRoom", {
        otherUserData: {
          userId: otherUser.userId,
          nickname: otherUser.nickname,
          smallAvatar: otherUser.smallAvatar,
          originalAvatar: otherUser.originalAvatar[0],
          biography: otherUser.biography,
        },
        chatId: chatId,
        lastReadMessageId: null,
      });
    },
  });

  function optimisticAddChat(otherUser: ConnectionsScreenUser) {
    queryClient.setQueryData(["chatsList"], (old: ChatType[]) => [
      ...old,
      {
        otherUser: {
          userId: otherUser.userId,
          nickname: otherUser.nickname,
          smallAvatar: otherUser.smallAvatar,
          originalAvatar: otherUser.originalAvatar,
          biography: otherUser.biography,
        },
        chatId: otherUser.userId, //some temporary id
        name: otherUser.nickname,
        lastMessage: null,
        lastMessageDate: null,
        lastMessageText: null,
        unread: false,
        unreadCount: 0,
        lastReadMessageId: null,
      },
    ]);
  }
}

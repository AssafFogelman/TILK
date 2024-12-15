import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { socket } from "../services/socket";
import { MessageType } from "../types/types";

export function useMessages(chatId: string) {
  const queryClient = useQueryClient();

  // Query for fetching messages
  const messagesQuery = useQuery({
    queryKey: ["messages", chatId],
    queryFn: () => fetchMessages(chatId),
  });

  // Mutation for sending messages
  const sendMessageMutation = useMutation({
    mutationFn: (newMessage: MessageType) => {
      return new Promise((resolve, reject) => {
        socket.emit("sendMessageToServer", newMessage, (ack: any) => {
          if (ack.success) resolve(ack.data);
          else reject(ack.error);
        });
      });
    },
    onMutate: async (newMessage) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["messages", chatId] });

      // Optimistically update cache
      queryClient.setQueryData(["messages", chatId], (old: Message[] = []) => [
        ...old,
        { ...newMessage, status: "pending" },
      ]);

      return { newMessage };
    },
    onError: (err, newMessage, context) => {
      // Revert optimistic update on error
      queryClient.setQueryData(["messages", chatId], (old: Message[] = []) =>
        old.filter((msg) => msg.messageId !== newMessage.messageId)
      );
    },
  });

  // Socket event listeners
  useEffect(() => {
    // Message received by server confirmation
    socket.on("messageReceivedByServer", (message: Message) => {
      queryClient.setQueryData(["messages", chatId], (old: Message[] = []) =>
        old.map((msg) =>
          msg.messageId === message.messageId ? { ...msg, status: "sent" } : msg
        )
      );
    });

    // New message received from other client
    socket.on("newMessageReceived", (message: Message) => {
      queryClient.setQueryData(["messages", chatId], (old: Message[] = []) => [
        ...old,
        message,
      ]);

      // Acknowledge receipt
      socket.emit("messageReceivedByClient", {
        messageId: message.messageId,
        receiverId: message.receiverId,
      });
    });

    // Message read confirmation
    socket.on("messageReceivedByClient", (messageId: string) => {
      queryClient.setQueryData(["messages", chatId], (old: Message[] = []) =>
        old.map((msg) =>
          msg.messageId === messageId ? { ...msg, status: "delivered" } : msg
        )
      );
    });

    return () => {
      socket.off("messageReceivedByServer");
      socket.off("newMessageReceived");
      socket.off("messageReceivedByClient");
    };
  }, [chatId, queryClient]);

  return {
    messages: messagesQuery.data ?? [],
    isLoading: messagesQuery.isLoading,
    sendMessage: sendMessageMutation.mutate,
  };
}

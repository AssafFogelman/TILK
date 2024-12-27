import { useEffect } from "react";
import { socket } from "./socket";
import { ChatType, MessageType, TilkEvent, TilkEvents } from "./types/types";
import { useAuthState } from "./AuthContext";
import { emit } from "./APIs/emit";
import { queryClient } from "./services/queryClient";

export const SocketEvents = ({ children }: { children: React.ReactNode }) => {
  //load websocket event listeners and cleanup
  const { userId } = useAuthState();
  useWebSocketEventsAndDisconnect();
  return <>{children}</>;

  function useWebSocketEventsAndDisconnect() {
    //load websocket event listeners and cleanup
    useEffect(() => {
      //if already connected, run connection function
      if (socket.connected) {
        onConnect();
      }

      function onConnect() {
        console.log("websocket connected!");
        emit(socket, "setCurrentlyConnected", userId);
      }

      function onEvent(
        event: TilkEvent,
        callback: ({
          offset,
          receivedDate,
        }: {
          offset: Date;
          receivedDate: Date;
        }) => void
      ) {
        const receivedDate = new Date();
        //do something with the event, and update the offset.
        console.log("incoming event:", event);
        switch (event.eventType) {
          //in the case the event is a message
          case "unread_messages":
            const newMessage: MessageType = {
              messageId: event.messageId,
              text: event.text,
              sentDate: event.sentDate.toISOString(),
              receivedDate: receivedDate.toISOString(),
              unread: true,
              senderId: event.otherUserId,
              gotToServer: true,
            };

            // Optimistically add the message to the chat messages query (if it exists)
            queryClient.setQueryData(
              ["chatMessages", event.chatId],
              (oldData: MessageType[] = []) => {
                if (!oldData.length) return [];
                return [...oldData, newMessage];
              }
            );
            // Optimistically update the specific chat in the chatsList query
            queryClient.setQueryData(
              ["chatsList"],
              (oldData: ChatType[] = []) => {
                if (!oldData.length) return oldData;
                return oldData.map((chat) =>
                  chat.chatId === event.chatId
                    ? {
                        ...chat,
                        unread: true,
                        unreadCount: chat.unreadCount + 1,
                        lastMessageDate: receivedDate,
                        lastMessageSender: newMessage.senderId,
                        lastMessageText: newMessage.text,
                      }
                    : chat
                );
              }
            );
        }

        // Optimistically update the unread events query
        queryClient.setQueryData(["unreadEvents"], (oldData: TilkEvents) => {
          if (!oldData) return oldData;
          const newData = {
            ...oldData,
            [event.eventType]: [...(oldData[event.eventType] || []), event],
          };
          return newData;
        });

        //the offset is the date of the last received event
        socket.auth = { ...socket.auth, offset: event.offset } as {
          offset?: Date;
        };
        callback({ offset: event.offset, receivedDate });
      }

      // function onDisconnect() {
      //something that should happen if the server goes down
      // }

      // function onFooEvent(value) {
      //   setFooEvents(previous => [...previous, value]);
      // }

      //listen to events and run functions accordingly
      socket.on("connect", onConnect);
      // socket.on("disconnect", onDisconnect);
      socket.on("event", onEvent);

      return () => {
        //when the component unmounts (the app closes), disconnect the socket and close the event listeners

        //close the event listener "connect"
        socket.off("connect", onConnect);
        //close the event listener "event"
        socket.off("event", onEvent);
        //disconnect the socket
        socket.disconnect();

        // socket.off("disconnect", onDisconnect);
        // socket.off('foo', onFooEvent);
      };
    }, []);
  }
};

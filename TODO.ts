/*

    main app:
    * when a new user signs in, he is sent into "HomeScreen". He passes other screen, 
     although it does look like they do load because I saw that certain requests that are in useEffects in "AvatarScreen" got triggered.
    so check "verification screen".


    menu in "HomeScreen":
    * edit avatar
    * edit bio
    * blocked users
    

    

    home screen:
    * button for "connect"/"request sent"/"connected"/"request received unread"/"request received read"
    * button for "chat" if user is connected to us
    * menu for person - block

    connections screen:
    * button for "chat" if user is connected to us
    * option for disconnecting
    * option for blocking a user
    * show only connected users and users that sent you a request
    * main menu: blocked list
    * // TODO: we might need to add a search bar here, so the user can search for a connection by nickname.
    * menu for person - block
    
    chats screen:
    it's a list of users sorted by the last time you chatted with them.
    once you click on a user, you go to the chat screen that covers the footer of the tabs. and a different header too. (if you return it returns).
    * can we invalidate only one chat and not the entire chat list? problems for later.



    chat room screen:
    * when a message is sent to the server, it should update the chat of the last message in addition to adding a new message.

    profile screen:
    * edit avatar
    * edit bio

    looking to screen:
    * if the useEffect is running regardless, make this screen 'lazy'

    select avatar screen:
    * if the useEffect is running regardless, make this screen 'lazy'

    * when the server starts, it needs set all the chat exit times to now. 
    *this might prevent the phenomenon of chats with an enter date but no exit date.


    * the websocket needs to reconnect without losing data - take from the websocket site
    * change the "open cage" request to go to the server instead directly to the site to prevent key theft

    * consider using tanStack query for api calls


    * data fetching for user connections
    * data fetching for user chats
    * buttons for userCards in "HomeScreen"
    * menu in "HomeScreen"
    
    * internationalization for names and date schemas
    */

/*!DONE LIST: 
    
    
    
    
    
    */

/*
sending and receiving a message:

0.when entering the chat room:
optimistically: 
- the chat "unread count" turns to 0, and the chat's "unread" becomes false.
- the "unread" of every message *that the client received* becomes false.
0.1 DB update:
the chat read date - chatReadDate  update. 
unread count
the "unread" of every message *that the client received* 
0.5 the client emits to the server ("messagesRead") to update this.
0.53 the server updates the DB that the chat is now not "unread", and marks all the last messages as "unread" = false
0.55 the server emits to the recipient client ("messagesRead").
0.56 the recipient client optimistically updates the status of the chat and the messages he sent as not "unread"
0.6 the client invalidates the chats query. (I don't think we need to invalidate the messages' query)
1. the client (A) presses the "send" button
2. the cache optimistically updates with that message as "pending"
3. the message is emitted to the server ("sendMessageToServer") and an acknowledgement is received
4. upon acknowledgement, the client (A) updates the chat messages and chats optimistically (and its predecessors that were not received by the server), and invalidates both queries.
5. the server finds the last message that was received, and checks the integrity of the chat - maybe the client already sent the messages but did not get an acknowledgement (?) which messages he needs to update (by their websocket pId)
4. the server updates the db - 
in chats - 
lastMessageDate,
lastMessageSender,
lastMessageText,
unread,
unreadCount

in chatMessages - a new message with:
gotToServer - true
new messageId

last message and that is was received.


6. the socket on the server emits to the client (B) ("newMessageReceived").
7. the client (B) listens to the event ("newMessageReceived"), and optimistically updates the cache - 
chats: updates the chat to unread, unread count and so on. 
chat messages: if that query exists, it adds the new message
then invalidates the query.
8. the client (B) emits ("messageReceivedByClient") to the server.
9. the server updates the DB that the last message was received by the client
10. the server emits ("messageReceivedByClient") to the client (A)
11. the client (A) optimistically updates the message, (and its predecessors that were not read) in the cache. 





the chat messages update only once with REST API and later with invalidation. And so you do not need stale time to be zero:

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
    },
  },
})





*/

/*

  and error log schema TTL:

  example:
 
  export const cacheEntries = pgTable(
  "cache_entries",
  {
    key: text("key").primaryKey(),
    value: text("value").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    *expiresAt: timestamp("expires_at").notNull(),
  },
  (table) => ({
    *ttlIndex: index("cache_ttl_index").on(table.expiresAt),
  })
);

*/

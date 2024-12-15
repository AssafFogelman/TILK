/*

    main app:
    * when a new user signs in, he is sent into "Homescreen". He passes other screen, 
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

    chat room screen:
    * when a message is sent to the server, it should update the chat of the last message in addition to adding a new message.

    profile screen:
    * edit avatar
    * edit bio

    looking to screen:
    * if the useEffect is running regardless, make this screen 'lazy'

    select avatar screen:
    * if the useEffect is running regardless, make this screen 'lazy'


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

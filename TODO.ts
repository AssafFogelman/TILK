/*
    why can't I see Yonatan's profile? and why did he get an error?

    menu in "HomeScreen":
    * edit avatar
    * edit bio
    

    home screen:
    * button for "connect"/"request sent"/"connected"/"request received unread"/"request received read"
    * button for "chat" if user is connected to us

    connections screen:
    * button for "chat" if user is connected to us
    * option for disconnecting
    * option for blocking a user
    * show only connected users and users that sent you a request
    * main menu: blocked list
    
    chats screen:
    it's a list of users sorted by the last time you chatted with them.
    once you click on a user, you go to the chat screen that covers the footer of the tabs. and a different header too. (if you return is returns).
    
    profile screen:
    * edit avatar
    * edit bio

    looking to screen:


    Tabs Screen:
    *    make the tab icons outlined when not selected
    * change the color of the icons from black to "on primary"


    * the websocket needs to reconnect without losing data - take from the websocket site
    * the buttons - connect, chat
    * add a menu where the user can see the blocked users, change their profile
    * add FAB of "looking to"
    * check again whether the user list in "HomeScreen" actually update every once in a while (It should periodically)
    * change the "open cage" request to go to the server instead directly to the site to prevent key theft
    * check why when we get to the ErrorBoundary, the Error log  request fails due to invalid token
    * consider using tanStack query for api calls

    TagsScreen:
    * when you come from HomeScreen, I want the selected tags to be selected in the list.

    * development build
    * data fetching for user connections
    * data fetching for user chats
    * buttons for userCards in "HomeScreen"
    * menu in "HomeScreen"
    * FAB in "HomeScreen"
    * see when a tab is unmounted
    */

/*
    TODO: does the useStartLocationTracking hook really rerender in HomeScreen all the time? if so, it's a problem, because it's going to be called a lot of times, and it's going to affect the performance of the app

    menu in "HomeScreen":
    * edit avatar
    * edit bio
    * blocked users
    

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
    once you click on a user, you go to the chat screen that covers the footer of the tabs. and a different header too. (if you return it returns).
    
    profile screen:
    * edit avatar
    * edit bio

    looking to screen:




    * the websocket needs to reconnect without losing data - take from the websocket site
    * change the "open cage" request to go to the server instead directly to the site to prevent key theft

    * consider using tanStack query for api calls


    * data fetching for user connections
    * data fetching for user chats
    * buttons for userCards in "HomeScreen"
    * menu in "HomeScreen"
    */

import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useContext, useEffect, useState } from "react";
// import { UserContext } from "../UserContext";
import UserChat from "../components/UserChat";

const ChatsScreen = () => {
  const [friendsList, setFriendsList] = useState([]);
  // const { userId, setUserId } = useContext(UserContext);

  useEffect(() => {
    //get friends data
    const getFriendsList = async () => {
      try {
        // const response = await fetch(
        //   `http://192.168.1.116:8000/chat/${userId}`
        // );
        // //response is of type "Response", meaning, you need to do something with it. it has a method called ".json()" that extrapolates the data out.
        // //this must be done in "fetch". It isn't axios sadly. Mind you.
        // if (response.ok) {
        //   const tempFriendsList = await response.json();
        //   setFriendsList(tempFriendsList);
        // }
      } catch (error) {
        console.log(
          "error happened while trying to get the users friends list:",
          error,
        );
      }
    };
    getFriendsList();
  }, []);

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Pressable>
        {/* {friendsList.map((friend, index) => (
          <UserChat key={index} friend={friend}></UserChat>
        ))} */}
      </Pressable>
    </ScrollView>
  );
};

export default ChatsScreen;

const styles = StyleSheet.create({});

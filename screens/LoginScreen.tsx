import {
  Alert,
  KeyboardAvoidingView,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { ParamListBase, useNavigation } from "@react-navigation/native";
import axios from "axios";
import storeData from "../config/asyncStorage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

const LoginScreen = () => {
  const [email, setEmail] = useState("assaf.fogelman@gmail.com"); //! change this, right?
  const [password, setPassword] = useState("Aa123456!"); //! change this too, right?
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

  // useEffect(() => {
  //   //auto login
  //   const checkLoginStatus = async () => {
  //     try {
  //       const token = await AsyncStorage.getItem("authToken");
  //       //! shouldn't we also check the expiration date of the token?
  //       if (token) {
  //         //! we need to add a check with the server the the userId is in fact still valid
  //         //! or even a valid token at all.

  //         //if there is a token, go to Home Screen.
  //         navigation.replace("Home");
  //       } else {
  //         //token not found. it will automatically go to the first screen which is "Login"
  //       }
  //     } catch (error) {
  //       console.log(
  //         "error trying to retrieve the value of the token. It's probably because there is no token, meaning, this is the user's first time on the app"
  //       );
  //     }
  //   };
  //   checkLoginStatus();
  // }, []);

  const handleLogin = () => {
    const userDetails = {
      email: email,
      password: password,
    };
    axios
      .post("http://192.168.1.116:8000/login", userDetails)
      .then((response) => {
        Alert.alert("you have been logged in", "Login was successful");
        const token = response.data.token;

        //store token in asyncStorage
        storeData("authToken", token);

        navigation.replace("Home");
      })
      .catch((error) => {
        Alert.alert("could not login", "please try again");
        console.log("error:", error);
      });
  };

  const resetAllUsersValues = async () => {
    try {
      const response = await fetch("http://192.168.1.116:8000/resetValues", {
        method: "DELETE",
      });
      if (response.ok) console.log("all the users' Values were deleted");
    } catch (error) {
      console.log(
        "there was an error trying to reach the server in order to reset the users' values"
      );
    }
  };

  const deleteAllMessages = async () => {
    try {
      const response = await fetch("http://192.168.1.116:8000/deleteMessages", {
        method: "DELETE",
      });
      if (response.ok) console.log("all the users' messages were deleted");
    } catch (error) {
      console.log(
        "there was an error trying to reach the server in order to delete the users' messages"
      );
    }
  };

  //! delete me !
  // const deleteOnlyMe = async () => {
  //   try {
  //     const messageIdsToDelete: object[] = [];

  //     const response = await axios.delete(
  //       "http://192.168.1.116:8000/messages",
  //       {
  //         data: messageIdsToDelete,
  //       }
  //     );
  //     if (response.status === 200)
  //       console.log("the specific message was ordered to be deleted!");
  //   } catch (error) {
  //     console.log("there was an error deleting a specific message");
  //   }
  // };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView>
        <View style={styles.innerContainer}>
          <Text style={styles.signInText}>Sign In</Text>
          <Text style={styles.signInToYourAccountText}>
            Sign In To Your Account
          </Text>
        </View>

        <View style={{ marginTop: 50 }}>
          <View>
            <Text style={{ fontSize: 18, fontWeight: "600", color: "grey" }}>
              Email
            </Text>

            <TextInput
              style={{
                borderBottomColor: "gray",
                borderBottomWidth: 1,
                marginVertical: 10,
                width: 300,
                fontSize: 18,
              }}
              placeholderTextColor={"black"}
              placeholder="Enter Your Email"
              value={email}
              onChangeText={(text) => setEmail(text.toLocaleLowerCase())}
            />
          </View>
          <View style={{ marginTop: 10 }}>
            <Text style={{ fontSize: 18, fontWeight: "600", color: "grey" }}>
              Password
            </Text>

            <TextInput
              style={{
                borderBottomColor: "gray",
                borderBottomWidth: 1,
                marginVertical: 10,
                width: 300,
                fontSize: 18,
              }}
              secureTextEntry={true}
              placeholderTextColor={"black"}
              placeholder="Enter Your Password"
              value={password}
              onChangeText={(text) => setPassword(text)}
            />
          </View>

          <Pressable
            style={{
              width: 200,
              backgroundColor: "#4A55A2",
              padding: 15,
              marginTop: 50,
              marginRight: "auto",
              marginLeft: "auto",
              borderRadius: 6,
            }}
            onPress={handleLogin}
          >
            <Text
              style={{
                color: "white",
                fontSize: 16,
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              Login
            </Text>
          </Pressable>

          <Pressable
            style={{ marginTop: 15 }}
            onPress={() => navigation.navigate("Register")}
          >
            <Text style={{ textAlign: "center", color: "grey", fontSize: 16 }}>
              Don't have an account? Sign Up
            </Text>
          </Pressable>
        </View>
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            marginTop: 60,
          }}
        >
          <Pressable
            style={{
              justifyContent: "center",
              alignItems: "center",

              width: 150,
              height: 50,
              backgroundColor: "red",
            }}
            onPress={resetAllUsersValues}
          >
            <Text style={{ color: "white", textAlign: "center" }}>
              Reset all user values
            </Text>
          </Pressable>
        </View>
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            marginTop: 60,
          }}
        >
          <Pressable
            style={{
              justifyContent: "center",
              alignItems: "center",

              width: 150,
              height: 50,
              backgroundColor: "red",
            }}
            onPress={deleteAllMessages}
          >
            <Text style={{ color: "white", textAlign: "center" }}>
              Delete all messages
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    padding: 10,
    alignItems: "center",
  },
  innerContainer: {
    marginTop: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  signInText: {
    color: "#4A55A2",
    fontSize: 17,
    fontWeight: "600",
  },
  signInToYourAccountText: {
    fontSize: 17,
    fontWeight: "600",
    marginTop: 15,
  },
});

export default LoginScreen;

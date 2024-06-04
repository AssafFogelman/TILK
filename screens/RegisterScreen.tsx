import {
  Alert,
  KeyboardAvoidingView,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import React, { useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import axios from "axios";
import {
  RegisterScreenNavigationProp,
  RegisterScreenRouteProp,
} from "../types/types";

const RegisterScreen = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [image, setImage] = useState("");

  const route = useRoute<RegisterScreenRouteProp>();
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const { userCountry } = route.params;

  const handleRegister = () => {
    const user = {
      name: name,
      email: email,
      password: password,
      image: image,
    };
    // send a post request to the backend API to register the user

    /* 192.168.1.116 is the IP of Assaf's router at home */
    axios
      .post("http://192.168.1.116:8000/register", user)
      .then((response) => {
        console.log("the response from the backend is:", response);
        Alert.alert(
          "Registration successful",
          "You have been registered successfully!"
        );
        setName("");
        setEmail("");
        setPassword("");
        setImage("");
      })
      .catch((error) => {
        console.log("the error from the backend is:", error);

        Alert.alert(
          "registration Error",
          "An Error occurred while registering"
        );
      });
  };
  return (
    <View style={styles.container}>
      <KeyboardAvoidingView>
        <View style={styles.innerContainer}>
          <Text style={styles.signInText}>Register</Text>
          <Text style={styles.signInToYourAccountText}>
            Register Your Account
          </Text>
        </View>

        <View>
          <Text>
            the user's country is: {userCountry ? userCountry : "unknown"}
          </Text>
        </View>

        {/* inputs */}
        <View style={{ marginTop: 50 }}>
          {/* Name */}
          <View>
            <Text style={{ fontSize: 18, fontWeight: "600", color: "grey" }}>
              Name
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
              placeholder="Enter Your Name"
              value={name}
              onChangeText={(text) => setName(text)}
            />
          </View>
          {/* Email */}
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
              onChangeText={(text) => setEmail(text)}
            />
          </View>
          {/* Password */}
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
          {/* Image */}
          <View style={{ marginTop: 10 }}>
            <Text style={{ fontSize: 18, fontWeight: "600", color: "grey" }}>
              Image
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
              placeholder="Image"
              value={image}
              onChangeText={(text) => setImage(text)}
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
            onPress={handleRegister}
          >
            <Text
              style={{
                color: "white",
                fontSize: 16,
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              Register
            </Text>
          </Pressable>

          <Pressable
            style={{ marginTop: 15 }}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={{ textAlign: "center", color: "grey", fontSize: 16 }}>
              Already have an account? Sign in
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

export default RegisterScreen;

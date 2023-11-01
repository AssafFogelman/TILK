import {
  KeyboardAvoidingView,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();
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
              onChangeText={(text) => setEmail(text)}
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

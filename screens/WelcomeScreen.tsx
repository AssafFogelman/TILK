import {
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { WelcomeScreenNavigationProp } from "../types/types";
import { useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";
import axios from "axios";

const WelcomeScreen = () => {
  const navigation = useNavigation<WelcomeScreenNavigationProp>();
  const [location, setLocation] = useState<Location.LocationObject | null>();

  const handleButtonClick = async () => {
    try {
      const coordinates = await getLocation();
      let userCountry: string | null = null;
      if (coordinates) {
        userCountry = await getCountry(coordinates);
      }
      navigation.navigate("PhoneVerification", { userCountry });
    } catch (error) {
      console.log("there was an error handling the button click:", error);
    }
  };

  return (
    <ImageBackground
      source={require("../assets/background.jpg")}
      style={styles.backgroundImage}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Welcome to TILK</Text>
        <Text style={styles.subtitle}>Where like-minded people connect</Text>
        <TouchableOpacity style={styles.button} onPress={handleButtonClick}>
          <Text style={styles.buttonText}>I want to see who's there!</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

export default WelcomeScreen;

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#ffffff",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: "#ffffff",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
    marginBottom: 30,
  },
  button: {
    backgroundColor: "#ffffff",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    elevation: 3,
  },
  buttonText: {
    color: "#333333",
    fontWeight: "bold",
    fontSize: 16,
  },
});

async function getLocation() {
  try {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.log("Permission to access location was denied");
      return null;
    }

    //we use this method instead of "getCurrentPositionAsync" since it's faster.
    //yet is is less accurate. but we just need to know the user's country.
    let location = await Location.getLastKnownPositionAsync({});
    //returns null if there is no last location

    if (!location) {
      // if the phone hasn't had the chance to get a location prior, get a location now (takes longer)
      location = await Location.getCurrentPositionAsync({});
    }

    //if we still don't have a location (for example, if the phone was turned on in a building with no reception), continue to registration
    //question - what would the response look like if we couldn't

    if (location.coords.latitude && location.coords.longitude) {
      console.log("location is:", location);
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    }

    return null;
  } catch (error) {
    console.log("error trying to get location");
  }
}

async function getCountry({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}) {
  try {
    const countryName = await axios
      .get(
        `https://api.opencagedata.com/geocode/v1/json?q=${latitude}%2C${longitude}&key=${process.env.EXPO_PUBLIC_OPEN_CAGE_API_KEY}`
      )
      .then((response) => response.data.results[0].components.country);
    console.log("the country of the user is:", countryName);
    return countryName;
  } catch (error) {
    console.log("error trying to get the user's country:", error);
    return null;
  }
}

import React, { useState, useEffect } from "react";
import { View, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Button } from "react-native-paper";
import { Camera } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import { SelectAvatarScreenNavigationProp } from "../types/types";
import { useAuthDispatch } from "../AuthContext";
import Toast from "react-native-toast-message";

const SelectAvatarScreen = () => {
  const [mainAvatar, setMainAvatar] = useState<string | null>(null);
  const [smallAvatars, setSmallAvatars] = useState<(string | null)[]>([
    null,
    null,
    null,
  ]);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(
    null
  );
  const [galleryPermission, setGalleryPermission] = useState<boolean | null>(
    null
  );
  const navigation = useNavigation<SelectAvatarScreenNavigationProp>();
  const { avatarWasChosen } = useAuthDispatch();

  useEffect(() => {
    (async () => {
      const cameraStatus = await Camera.requestCameraPermissionsAsync();
      setCameraPermission(cameraStatus.status === "granted");

      const galleryStatus =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      setGalleryPermission(galleryStatus.status === "granted");

      // Fetch saved avatars from server
      try {
        const response = await axios.get("/user/avatar-links");
        const savedAvatars = response.data;
        if (savedAvatars.length > 0) {
          setMainAvatar(savedAvatars[0]);
          setSmallAvatars(savedAvatars.slice(1, 4));
        }
      } catch (error) {
        console.error("Error fetching avatars:", error);
      }
    })();
  }, []);

  const handleImageSelection = async (index: number) => {
    try {
    } catch (error) {
      console.log('error at "handleImageSelection" function:', error);
    }

    if (!cameraPermission || !galleryPermission) {
      showToast("oops", "Camera and gallery permissions are required...");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      if (index === -1) {
        // Main avatar
        if (mainAvatar) {
          const newSmallAvatars = [mainAvatar, ...smallAvatars.slice(0, -1)];
          setSmallAvatars(newSmallAvatars);
        }
        setMainAvatar(result.assets[0].uri);
      } else {
        // Small avatar
        const newSmallAvatars = [...smallAvatars];
        newSmallAvatars[index] = result.assets[0].uri;
        setSmallAvatars(newSmallAvatars);
      }
    }
  };

  //if the user clicks a small frame that has an avatar, that avatar is switched with the main frame avatar.
  const handleAvatarSwap = (index: number) => {
    const newMainAvatar = smallAvatars[index];
    const newSmallAvatars = [...smallAvatars];
    newSmallAvatars[index] = mainAvatar;
    setMainAvatar(newMainAvatar);
    setSmallAvatars(newSmallAvatars);
  };

  const handleNext = async () => {
    if (mainAvatar) {
      try {
        const allAvatars = [
          mainAvatar,
          ...smallAvatars.filter((avatar) => avatar !== null),
        ];
        //!  the server needs to update the database that the avatars were chosen mistak
        await axios.post("YOUR_SERVER_URL/user/post-avatar", {
          avatars: allAvatars,
        });

        //update the context that the avatar was chosen
        avatarWasChosen();
        navigation.navigate("PersonalDetails");
      } catch (error) {
        console.error("Error posting avatars:", error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.mainFrame}
        onPress={() => handleImageSelection(-1)}
      >
        {mainAvatar ? (
          <Image source={{ uri: mainAvatar }} style={styles.avatar} />
        ) : (
          <View style={styles.emptyFrame} />
        )}
      </TouchableOpacity>

      <View style={styles.smallFramesContainer}>
        {smallAvatars.map((avatar, index) => (
          <TouchableOpacity
            key={index}
            style={styles.smallFrame}
            onPress={() =>
              avatar ? handleAvatarSwap(index) : handleImageSelection(index)
            }
          >
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.emptyFrame} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      <Button
        mode="contained"
        onPress={handleNext}
        disabled={!mainAvatar}
        style={styles.nextButton}
      >
        Next
      </Button>
    </View>
  );
};

const showToast = (
  headline: string = "Enter Headline",
  content: string = "Enter Content"
) => {
  Toast.show({
    type: "info",
    text1: headline,
    text2: content,
  });
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  mainFrame: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  smallFramesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
  },
  smallFrame: {
    width: 100,
    height: 100,
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  emptyFrame: {
    width: "100%",
    height: "100%",
    backgroundColor: "#e0e0e0",
    borderRadius: 10,
  },
  nextButton: {
    marginTop: 20,
  },
});

export default SelectAvatarScreen;

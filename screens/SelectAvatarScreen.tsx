import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Pressable,
} from "react-native";
import { Button, Text } from "react-native-paper";
import { Camera } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import { SelectAvatarScreenNavigationProp } from "../types/types";
import { useAuthDispatch } from "../AuthContext";
import Toast from "react-native-toast-message";
import placeholderImage from "../assets/Profile_avatar_placeholder_large.png";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";

const SelectAvatarScreen = () => {
  const [indexOfFrame, setIndexOfFrame] = useState<number>(-1);
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

  // ref
  const bottomSheetRef = useRef<BottomSheet>(null);

  // callbacks
  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
  }, []);

  useEffect(() => {
    (async () => {
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

  async function handleImageSelection(index: number) {
    try {
      //check if we have camera and gallery permissions
      const cameraStatus = await Camera.requestCameraPermissionsAsync();
      const galleryStatus =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (
        cameraStatus.status !== "granted" ||
        galleryStatus.status !== "granted"
      ) {
        showToast("oops", "Camera and gallery permissions are required...");
        return;
      }
      //saves the index number so the bottom sheet will know to send it to the right function
      setIndexOfFrame(index);
      //let the user choose whether to pick or take a photo
      openBottomSheet();
    } catch (error) {
      console.log('error at "handleImageSelection" function:', error);
    }
  }

  async function launchCamera(index: number) {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        updateAvatar(index, result.assets[0].uri);
      }
    } catch (error) {
      console.log('error at "launchCamera" function:', error);
    }
  }

  async function launchImageLibrary(index: number) {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        updateAvatar(index, result.assets[0].uri);
      }
    } catch (error) {
      console.log('error at "launchImageLibrary" function:', error);
    }
  }

  function updateAvatar(index: number, uri: string) {
    if (index === -1) {
      // Main avatar
      if (mainAvatar) {
        //if there was already a photo on the main frame,
        //pass it to the small frames and put the new photo in the main frame
        const newSmallAvatars = [mainAvatar, ...smallAvatars.slice(0, -1)];
        setSmallAvatars(newSmallAvatars);
      }
      setMainAvatar(uri);
    } else {
      // Small avatar
      const newSmallAvatars = [...smallAvatars];
      newSmallAvatars[index] = uri;
      setSmallAvatars(newSmallAvatars);
    }
  }
  //if the user clicks a small frame that has an avatar, that avatar is switched with the main frame avatar.
  const handleAvatarSwap = (index: number) => {
    const newMainAvatar = smallAvatars[index];
    const newSmallAvatars = [...smallAvatars];
    newSmallAvatars[index] = mainAvatar;
    setMainAvatar(newMainAvatar);
    setSmallAvatars(newSmallAvatars);
  };

  // Function to open the bottom sheet
  const openBottomSheet = useCallback(() => {
    bottomSheetRef.current?.expand();
  }, []);

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
      <View>
        <Text style={styles.headline}>Choose An Avatar</Text>
      </View>
      <TouchableOpacity
        style={styles.mainFrame}
        onPress={() => handleImageSelection(-1)}
      >
        <Image
          source={mainAvatar ? { uri: mainAvatar } : placeholderImage}
          style={styles.avatar}
        />
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
            <Image
              source={avatar ? { uri: avatar } : placeholderImage}
              style={styles.avatar}
            />
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
      <BottomSheet
        ref={bottomSheetRef}
        onChange={handleSheetChanges}
        snapPoints={["40%"]}
        index={-1} //starts closed
        enablePanDownToClose={true}
      >
        <BottomSheetView style={styles.bottomSheetContentContainer}>
          <View style={styles.bottomSheetHeadline}>
            <Text style={{ fontSize: 20 }}>Choose Image Source</Text>
          </View>
          <View style={styles.bottomSheetContent}>
            <Pressable
              style={styles.bottomSheetButton}
              onPress={() => launchCamera(indexOfFrame)}
            >
              <Text style={{ color: "white" }}>Take a Photo</Text>
            </Pressable>
            <Pressable
              style={styles.bottomSheetButton}
              onPress={() => launchImageLibrary(indexOfFrame)}
            >
              <Text style={{ color: "white" }}>Choose from Gallery</Text>
            </Pressable>
          </View>
        </BottomSheetView>
      </BottomSheet>
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
    justifyContent: "space-between",
    padding: 20,
  },
  bottomSheetContentContainer: {
    flex: 1,
    alignItems: "center",
  },
  bottomSheetHeadline: {
    marginTop: 20,
    justifyContent: "center",
    alignItems: "center",
    flex: 0.2,
  },
  bottomSheetContent: {
    alignItems: "center",
    justifyContent: "center",
    gap: 30,
    marginBottom: 20,
    flex: 0.8,
  },
  bottomSheetButton: {
    backgroundColor: "#007bff",
    padding: 5,
    marginEnd: 15,
    marginStart: 9,
    paddingVertical: 10,
    paddingStart: 15,
    paddingEnd: 15,
    borderRadius: 25,
  },

  headline: {
    paddingTop: 50,
    fontSize: 25,
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
    resizeMode: "cover",
  },

  nextButton: {
    marginTop: 20,
    alignSelf: "flex-end",
  },
});

export default SelectAvatarScreen;

/*
Alert.alert(
        "Choose Image Source",
        "Would you like to take a new photo or choose from gallery?",
        [
          {
            text: "Take Photo",
            onPress: () => launchCamera(index),
          },
          {
            text: "Choose from Gallery",
            onPress: () => launchImageLibrary(index),
          },
          {
            text: "Cancel",
            style: "cancel",
          },
        ]
      );
*/

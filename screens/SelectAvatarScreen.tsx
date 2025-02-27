import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from "react-native";
import { Button, Text } from "react-native-paper";
import { Camera } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import axios, { isAxiosError } from "axios";
import { useAuthDispatch, useAuthState } from "../context/AuthContext";
import Toast from "react-native-toast-message";
import placeholderImage from "../assets/Profile_avatar_placeholder_large.png";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import * as FileSystem from "expo-file-system";
import { useNavigation } from "@react-navigation/native";
import { SelectAvatarScreenNavigationProp } from "../types/types";

const SelectAvatarScreen = () => {
  const [indexOfFrame, setIndexOfFrame] = useState<number>(-1);
  const [mainAvatar, setMainAvatar] = useState<string | null>(null);
  const [smallAvatars, setSmallAvatars] = useState<(string | null)[]>([
    null,
    null,
    null,
  ]);
  const { avatarWasChosen } = useAuthDispatch();

  const { chosenBio, chosenTags } = useAuthState();

  const navigation = useNavigation<SelectAvatarScreenNavigationProp>();

  // ref
  const bottomSheetRef = useRef<BottomSheet>(null);

  // callbacks
  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
  }, []);

  // Fetch saved avatars from server
  useEffect(() => {
    console.log(
      "app is fetching avatars. does that make sense? If not, make the stack screen 'lazy'"
    );
    (async () => {
      try {
        let { originalAvatars } = await axios
          .get("/user/avatar-links")
          .then((res) => res.data);

        originalAvatars = originalAvatars.map(
          (avatarPath: string) =>
            process.env.EXPO_PUBLIC_SERVER_ADDRESS + avatarPath
        );
        if (originalAvatars.length > 0) {
          setMainAvatar(originalAvatars[0]);
        }
        if (originalAvatars.length > 1) {
          setSmallAvatars([
            ...originalAvatars.slice(1, 4),
            ...Array(4 - originalAvatars.length).fill(null),
          ]);
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
    //close the bottom sheet
    closeBottomSheet();
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
    //close the bottom sheet
    closeBottomSheet();
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

  // Function to close the bottom sheet
  const closeBottomSheet = () => {
    bottomSheetRef.current?.close();
  };

  /**********
   *
   *
   * makes an array with either null, string that starts with "http", or file of FileType
   * sends it
   * updates the state
   * navigates to the next screen
   * */

  const handleNext = async () => {
    if (!mainAvatar) return;
    try {
      const allAvatarUris = [mainAvatar, ...smallAvatars];

      //turn file URIs into base64 files
      const base64Files = await Promise.all(
        allAvatarUris.map(async (uri) => {
          if (!uri) return null;
          if (uri.startsWith("http")) return uri;
          if (uri.startsWith("file"))
            return await FileSystem.readAsStringAsync(uri, {
              encoding: FileSystem.EncodingType.Base64,
            });
          return null; //safety precaution
        })
      );

      // make the content into files
      const payload = {
        avatars: base64Files.map((content, index) => {
          if (!content) return null;
          if (content.startsWith("http")) return content;
          return {
            content,
            type: "image/jpeg",
            name: `avatar-${index}.jpg`,
          };
        }),
      };

      await axios.post("user/post-avatars", payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      //update the context that the avatar was chosen
      avatarWasChosen();
      // navigate to home screen unless the user hasn't chosen a bio
      if (!chosenBio || !chosenTags) {
        navigation.navigate("LookingTo");
      } else {
        navigation.navigate("Tabs", { screen: "Home" });
      }
    } catch (error: unknown) {
      console.log("Error posting avatars:", error);
      if (isAxiosError(error)) {
        console.log("Error posting avatars:(request) ", error?.request);
        console.log("Error posting avatars: (response) ", error?.response);
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

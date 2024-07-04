import React, { useState, useRef, useCallback, useEffect } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import {
  Camera,
  CameraDevice,
  useCameraDevices,
} from "react-native-vision-camera";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";

const SelectAvatarScreen: React.FC = () => {
  const [avatar, setAvatar] = useState<string | null>(null);
  const [cameraPermission, setCameraPermission] = useState(false);
  const cameraRef = useRef<Camera>(null);
  const devices = useCameraDevices();
  const device = devices.find((d) => d.position === "front");

  useEffect(() => {
    (async () => {
      const newCameraPermission = await Camera.requestCameraPermission();
      setCameraPermission(newCameraPermission === "granted");
    })();
  }, []);

  const takePicture = useCallback(async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePhoto();
        setAvatar(photo.path);
      } catch (error) {
        console.error("Failed to take picture:", error);
      }
    }
  }, []);

  const pickImage = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setAvatar(result.assets[0].uri);
    }
  }, []);

  const uploadAvatar = useCallback(async () => {
    if (avatar) {
      try {
        const base64 = await FileSystem.readAsStringAsync(avatar, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const response = await fetch("YOUR_SERVER_URL/upload-avatar", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ avatar: base64 }),
        });

        if (response.ok) {
          console.log("Avatar uploaded successfully");
        } else {
          console.error("Failed to upload avatar");
        }
      } catch (error) {
        console.error("Error uploading avatar:", error);
      }
    }
  }, [avatar]);

  if (!device) return <Text>Camera not available</Text>;

  return (
    <View style={styles.container}>
      {avatar ? (
        <Image source={{ uri: avatar }} style={styles.avatar} />
      ) : cameraPermission ? (
        <Camera
          ref={cameraRef}
          style={styles.camera}
          device={device}
          isActive={true}
          photo={true}
        />
      ) : (
        <Text>Camera permission not granted</Text>
      )}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={takePicture}>
          <Text style={styles.buttonText}>Take Picture</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={pickImage}>
          <Text style={styles.buttonText}>Choose from Gallery</Text>
        </TouchableOpacity>
        {avatar && (
          <TouchableOpacity style={styles.button} onPress={uploadAvatar}>
            <Text style={styles.buttonText}>Upload Avatar</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  camera: {
    width: 300,
    height: 300,
  },
  avatar: {
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 20,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
});

export default SelectAvatarScreen;

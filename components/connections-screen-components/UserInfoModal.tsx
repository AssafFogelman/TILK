import React from "react";
import { View, Image } from "react-native";
import { Button, Modal, Portal, Text, useTheme } from "react-native-paper";
import { ConnectionsScreenUser } from "../../types/types";

export const UserInfoModal = ({
  visible,
  onDismiss,
  userInfo,
}: {
  visible: boolean;
  onDismiss: () => void;
  userInfo: ConnectionsScreenUser | null;
}) => {
  const theme = useTheme();

  if (!userInfo) return null;

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={{
          marginHorizontal: 20,
          backgroundColor: theme.colors.surface,
          padding: 20,
          maxHeight: "80%",
          borderRadius: 25,
          elevation: 5,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
        }}
      >
        <View style={{ gap: 15 }}>
          <Image
            style={{
              width: "100%",
              aspectRatio: 1,
              borderRadius: 15,
            }}
            resizeMode="cover"
            source={{
              uri:
                process.env.EXPO_PUBLIC_SERVER_ADDRESS +
                userInfo.originalAvatar[0],
            }}
          />
          <Text variant="headlineSmall" style={{ fontWeight: "bold" }}>
            {userInfo.nickname}
          </Text>
          <Text variant="titleMedium" style={{ color: theme.colors.primary }}>
            Bio:
          </Text>
          <Text variant="bodyMedium" style={{ lineHeight: 22 }}>
            {userInfo.biography}
          </Text>
          <Button
            mode="contained"
            onPress={onDismiss}
            style={{ marginTop: 10 }}
          >
            Close
          </Button>
        </View>
      </Modal>
    </Portal>
  );
};

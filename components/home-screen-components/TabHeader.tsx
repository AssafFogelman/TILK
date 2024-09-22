import React from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { Entypo } from "@expo/vector-icons";
import { Text, useTheme } from "react-native-paper";

interface TabHeaderProps {
  title: string;
  onMenuPress: () => void;
}

const TabHeader: React.FC<TabHeaderProps> = ({ title, onMenuPress }) => {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.elevation.level2 },
      ]}
    >
      <View style={styles.titleContainer}>
        <Text style={[styles.title, { color: theme.colors.onSurface }]}>
          {title === "Home" ? "Tilk" : title}
        </Text>
        <TouchableOpacity onPress={onMenuPress}>
          <Entypo
            name="dots-three-vertical"
            size={20}
            color={theme.colors.onSurface}
            style={{ color: theme.colors.onSurface }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TabHeader;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  titleContainer: {
    flex: 1,
    flexDirection: "row",
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
});

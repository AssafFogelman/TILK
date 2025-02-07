import React, { useState } from "react";
import { TouchableOpacity } from "react-native";
import { Entypo } from "@expo/vector-icons";
import { useTheme } from "react-native-paper";
import { Menu } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";

import { TabsScreenNavigationProp } from "../../types/types";

export const TabsMenu: React.FC /*<MenuProps>*/ = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const theme = useTheme();
  const navigation = useNavigation<TabsScreenNavigationProp>();
  return (
    <>
      <Menu
        visible={isMenuOpen}
        onDismiss={closeMenu}
        anchor={
          <TouchableOpacity onPress={openMenu}>
            <Entypo
              name="dots-three-vertical"
              size={20}
              color={theme.colors.onSurface}
              style={{ color: theme.colors.onSurface }}
            />
          </TouchableOpacity>
        }
      >
        <Menu.Item
          onPress={() => {
            navigation.navigate("PersonalDetails");
          }}
          title="personal details"
        />
        <Menu.Item onPress={() => {}} title="blocked users" />
        <Menu.Item
          onPress={() => {
            navigation.navigate("About");
          }}
          title="About"
        />
      </Menu>
    </>
  );
  function openMenu() {
    setIsMenuOpen(true);
  }

  function closeMenu() {
    setIsMenuOpen(false);
  }
};

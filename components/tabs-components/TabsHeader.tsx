import React, { useState } from "react";
import { StyleSheet, View, TouchableOpacity, I18nManager } from "react-native";
import { Text, useTheme, Searchbar } from "react-native-paper";
import AntDesign from "@expo/vector-icons/AntDesign";
import { TabsMenu } from "./TabsMenu";

type TabsHeaderProps = {
  title: string;
  onMenuPress: () => void;
  showSearchIcon: boolean;
  searchQuery: string;
  onSearchChange?: (query: string) => void;
};

const TabsHeader: React.FC<TabsHeaderProps> = ({
  title,
  onMenuPress,
  showSearchIcon = false,
  searchQuery = "",
  onSearchChange,
}) => {
  const theme = useTheme();
  const [showSearchBar, setShowSearchBar] = useState(false);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.elevation.level2 },
      ]}
    >
      {showSearchBar ? (
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search connections"
            value={searchQuery}
            onChangeText={onSearchChange}
            style={styles.searchBar}
            right={() => (
              <TouchableOpacity onPress={() => setShowSearchBar(false)}>
                <AntDesign
                  name={I18nManager.isRTL ? "arrowright" : "arrowleft"}
                  size={20}
                  color={theme.colors.onSurface}
                />
              </TouchableOpacity>
            )}
          />
        </View>
      ) : (
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: theme.colors.onSurface }]}>
            {title === "Home" ? "Tilk" : title}
          </Text>
          <View style={styles.rightCornerContainer}>
            {showSearchIcon ? (
              <TouchableOpacity onPress={() => setShowSearchBar(true)}>
                <AntDesign
                  name="search1"
                  size={20}
                  color={theme.colors.onSurface}
                />
              </TouchableOpacity>
            ) : null}

            <TabsMenu />
          </View>
        </View>
      )}
    </View>
  );
};

export default TabsHeader;

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

  rightCornerContainer: {
    flexDirection: "row",
    gap: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  searchContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  searchBar: {
    elevation: 0,
    backgroundColor: "transparent",
  },
});

import {
  adaptNavigationTheme,
  MD3DarkTheme,
  MD3LightTheme,
} from "react-native-paper";
import { useMaterial3Theme } from "@pchmn/expo-material3-theme";
import { useColorScheme } from "react-native";
import {
  customLightModeColors,
  customDarkModeColors,
} from "./customThemeColors";
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
} from "@react-navigation/native";

//dark-light mode depending on system preferences
// + an integration with react navigation themes
// + option to customize colors

export function useSetTheme() {
  //has the user defined his phone to be light or dark mode
  const colorScheme = useColorScheme();
  //the device's actual system colors (on android)
  const { theme } = useMaterial3Theme();

  //react navigation themes, adjusted to work with react native paper
  const { LightTheme, DarkTheme } = adaptNavigationTheme({
    reactNavigationLight: NavigationDefaultTheme,
    reactNavigationDark: NavigationDarkTheme,
  });

  //customizing the app's theme, if at all needed
  return colorScheme === "dark"
    ? {
        ...MD3DarkTheme,
        ...DarkTheme,
        colors: {
          ...MD3DarkTheme.colors,
          ...DarkTheme.colors,
          ...theme.dark,
          ...customDarkModeColors.colors,
        },
      }
    : {
        ...MD3LightTheme,
        ...LightTheme,
        colors: {
          ...MD3LightTheme.colors,
          ...LightTheme.colors,
          ...theme.light,
          ...customLightModeColors.colors,
        },
      };
}

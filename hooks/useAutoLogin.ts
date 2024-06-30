import { useEffect } from "react";
import { getItemAsync } from "expo-secure-store";

function useAutoLogin() {
  useEffect(() => {
    // Fetch the token from storage then navigate to our appropriate place
    const getTokenAsync = async () => {
      let userToken;

      try {
        userToken = await getItemAsync("TILK-token");
        if (userToken) {
        }
      } catch (error) {
        console.log("Restoring token failed");
      }

      // After restoring token, we may need to validate it in production apps

      // This will switch to the App screen or Auth screen and this loading
      // screen will be unmounted and thrown away.
      dispatch({ type: "RESTORE_TOKEN", token: userToken });
    };

    getTokenAsync();
  }, []);
}

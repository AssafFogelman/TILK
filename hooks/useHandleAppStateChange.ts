import { useEffect, useState } from "react";
import * as Location from "expo-location";
import { AppState } from "react-native";

export function useHandleAppStateChange() {
  //!MAKE LOCATION ENABLED A CONTEXT thing.
  //!because the user might be off-grid by choice.
  //!or maybe the check only needs to be once a user pushes the button "switch to "on-grid"...
  const [locationEnabled, setLocationEnabled] = useState(false);

  //check whether location setting and permissions are enabled every time the app minimizes and returns
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: string) => {
      if (nextAppState === "active") {
        //app becomes active (in the foreground)

        //is the location setting on?
        const locationServiceEnabled = await Location.hasServicesEnabledAsync(); //true-false

        //if the location setting in disabled
        if (!locationServiceEnabled) {
          //*make the user invisible to others and others invisible to him
          //!ADD - make the user "off-grid" on the database.
          setLocationEnabled(false);

          //!ADD - send a message that tells the user how to enable the location settings
          console.log("location settings are not enabled!");
          console.log(
            "a message that tells the user how to enable the location settings"
          );
          console.log(
            "logic that makes a user invisible to others and makes other invisible to him"
          );
        }
        //if the location service in enabled, check for location permissions
        if (locationServiceEnabled) {
          //did the user permit getting the location?
          const { canAskAgain, granted } =
            await Location.getForegroundPermissionsAsync();

          if (granted) {
            //!ADD - check if the user has set himself as "off-grid".
            //! if not, then tell the database to make him "on-grid"
            //! show others to the user
            setLocationEnabled(true);
            console.log("location enabled!");
          }
          if (!granted) {
            //! ADD - tell the database to make him "off-grid"
            //! hide others from the user
            setLocationEnabled(false);
            console.log("location disabled!");
            //!ADD pop-up:
            console.log(
              "TILK needs permission to your location for you to see other users"
            );
            //pop-up window with an "approval" button

            //ask again (if the user lets us)
            await Location.requestForegroundPermissionsAsync();
            //did the user grant the permission?
            const { granted } = await Location.getForegroundPermissionsAsync();
            if (granted) {
              //!ADD - check if the user has set himself as "off-grid".
              //! if not, then tell the database to make him "on-grid"
              //! show others to the user
              setLocationEnabled(true);
              console.log("location enabled!");
            } else {
              console.log(
                "we can't ask again. let's leave the user alone, off-grid"
              );
            }
          }
        }
      }
    };

    //add a listener to when the app minimizes and returns
    const appStateListener = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      //removing the listener once the app is closed.
      appStateListener.remove();
    };
  }, []);
}

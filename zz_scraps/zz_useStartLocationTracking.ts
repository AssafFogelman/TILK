import { useEffect, useState, useCallback, useRef } from "react";
import { useLocation } from "../context/LocationContext";
import { AppState, AppStateStatus } from "react-native";
import * as Location from "expo-location";
import Toast from "react-native-toast-message";

//executed in the HomeScreen to start the location tracking
//also, if the user returns to the app from the background,
//the app asks him whether he would like to track his location
export function useStartLocationTracking() {
  const { startLocationTracking } = useLocation();
  const appStateRef = useRef(AppState.currentState);

  useEffect(() => {
    console.log(
      "the useEffect of home screen (useStartLocationTracking) is running"
    );
    startLocationTracking();

    // //set listener for app state change
    const appStateListener = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    //function that handles the app state change
    async function handleAppStateChange(nextAppState: AppStateStatus) {
      console.log("appStateRef.current:", appStateRef.current);
      console.log("nextAppState:", nextAppState);

      if (
        //if the last appState was active, update and return.
        //if the next appState is not active, update and return.
        appStateRef.current.match(/active/) &&
        nextAppState !== "active"
      ) {
        appStateRef.current = nextAppState;
        return;
      }
      //only if the last appState was not active and the next appState is active, continue.
      appStateRef.current = nextAppState;

      console.log("App has come to the foreground!");
      //is the location setting on the device on?
      const locationServiceEnabled = await Location.hasServicesEnabledAsync(); //true-false
      //if the location service is off, the hook returns true
      if (!locationServiceEnabled) {
        showToast("Location Service is Disabled", "Please turn it on");
        return;
      }

      //check for location permission
      const { granted, canAskAgain } =
        await Location.getForegroundPermissionsAsync();
      //if the user has declined the location permission permanently, the hook returns true
      console.log("granted:", granted);
      console.log("canAskAgain:", canAskAgain);
      if (!granted) {
        if (canAskAgain) {
          //ask again
          showToast("Location permission is Disabled", "Please turn it on");
          const { granted } =
            await Location.requestForegroundPermissionsAsync();
          if (granted) {
            //start the location tracking
            startLocationTracking();
            return;
          }
        } else {
          showToast(
            "Location permission is Disabled",
            "Please turn it on in the phone's settings"
          );
          return;
        }
      }

      if (granted) {
        //theoretically, if the user does not minimize the app, this function (and the location tracking) will never be called.
        //however, practically, the listener switches the app state several times when the app is first loaded.
        //or does it?! :D
        startLocationTracking();
      }
    }

    //listener cleanup
    return () => {
      appStateListener.remove();
    };
  }, []);

  //   //if the user has granted location permission, it starts the device motion tracking and the location tracking interval
}

function showToast(
  headline: string = "Enter Headline",
  content: string = "Enter Content"
) {
  Toast.show({
    type: "info",
    text1: headline,
    text2: content,
  });
}
//TODO: does the hook really rerender in HomeScreen all the time? if so, it's a problem, because it's going to be called a lot of times, and it's going to affect the performance of the app

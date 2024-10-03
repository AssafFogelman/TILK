import { useCallback, useEffect, useRef, useState } from "react";
import * as Location from "expo-location";
import axios, { AxiosError } from "axios";
import { knnDataType } from "../types/types";
import { AppState } from "react-native";

/**
 * useTrackLocation Hook
 *
 * This custom hook manages location tracking and nearby user data fetching for the app.
 * It provides functionality to:
 * 1. Start and stop device motion tracking using Expo's Location API.
 * 2. Manage a periodic interval for location updates and data fetching.
 * 3. Fetch nearby user data (KNN - K-Nearest Neighbors) based on the current location.
 * 4. Handle loading and error states for the KNN data fetching process.
 *
 * The hook exposes methods to start and stop tracking, as well as state variables
 * for the current location, KNN data, and related loading/error states.
 *
 * sends location to the server every 30 seconds if the location changes more than 50 meters - in order to get new knn data
 * also sends location to the server every 2 minutes if the location doesn't change - in order to get new knn data
 */

export function useTrackLocation() {
  const locationRef = useRef<null | Location.LocationObject>(null);
  const [isIntervalActive, setIsIntervalActive] = useState(false);
  const intervalRef = useRef<null | NodeJS.Timeout>(null);
  const locationSubscription = useRef<null | Location.LocationSubscription>(
    null
  );
  const [knnDataIsLoading, setKnnDataIsLoading] = useState(true);
  const [knnDataIsError, setKnnDataIsError] = useState(false);
  const [knnData, setKnnData] = useState<knnDataType>(null);

  //cleanup
  useEffect(() => {
    return () => {
      stopLocationTracking();
      stopInterval();
    };
  }, []);

  return {
    startLocationTracking,

    knnDataIsLoading,
    knnDataIsError,
    knnData,
  };
  function startLocationTracking() {
    startDeviceMotionTracking();
    startLocationTrackingInterval();
  }

  function stopInterval() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      setIsIntervalActive(false);
    }
  }

  function stopLocationTracking() {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
    }
  }

  async function sendLocationToServer(
    location: Location.LocationObject | null
  ) {
    try {
      if (!location) return; // this might happen if the interval starts before the subscription starts

      if (AppState.currentState !== "active") return; //if the app is not in the foreground, do nothing

      console.log(
        "location is: lat- ",
        location.coords.latitude,
        " lon- ",
        location.coords.longitude,
        " time- ",
        location.timestamp
      );
      const { knn } = await axios
        .post("/location", {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          //limit is the number of nearby users to return
          limit: 20,
        })
        .then((response) => response.data);
      setKnnData(knn);
      setKnnDataIsLoading(false);
    } catch (error) {
      setKnnDataIsError(true);
      setKnnDataIsLoading(false);
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.log("axios error:", error.response?.data);
        } else if (error.request) {
          // The request was made but no response was received
          console.log("No response received from the server:", error.request);
        }
      } else {
        //this is not an axios related error
        console.log("Error sending location to server:", error);
      }
    }
  }

  //periodically send location to the server even if the location doesn't change
  function startLocationTrackingInterval() {
    if (!isIntervalActive) {
      intervalRef.current = setInterval(
        () => {
          if (locationRef.current) {
            sendLocationToServer(locationRef.current);
          }
        },
        2 * 60 * 1000
      ); // 2 minutes in milliseconds. executes for the first time only after 2 min.
      setIsIntervalActive(true);
    }
  }

  //subscribe to location services
  async function startDeviceMotionTracking() {
    try {
      // if we are already subscribed to the location services, do nothing.
      if (locationSubscription.current) {
        return;
      }
      //request permission to access location
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        //TODO: show a message to the user with a button to go to the settings
        return;
      }
      if (!locationSubscription.current) {
        //if we haven't subscribed to location services yet, get the last known location (for speed's sake)
        let lastKnownLocation = await Location.getLastKnownPositionAsync({});
        //returns null if there is no last location
        handleNewLocation(lastKnownLocation);
      }

      //subscribe to location services
      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 50,
          //If you want to check that it works without having to move 50 meters, change distanceInterval to 0 (update regardless of location change)
          timeInterval: 1000 * 30, //update location if the device moved more than 50 meters, and no more that an update every 30 seconds
        },
        handleNewLocation
      );
    } catch (error) {
      console.log("error in startDeviceMotionTracking function: ", error);
    }
  }

  function handleNewLocation(newLocation: Location.LocationObject | null) {
    //if new location in null, do nothing
    if (!newLocation) return;
    locationRef.current = newLocation;
    sendLocationToServer(newLocation);
  }
}

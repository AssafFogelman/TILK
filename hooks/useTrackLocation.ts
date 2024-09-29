import { useCallback, useEffect, useRef, useState } from "react";
import * as Location from "expo-location";
import axios from "axios";
import { knnDataType } from "../types/types";

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

  const stopInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      setIsIntervalActive(false);
    }
  }, []);

  //cleanup
  useEffect(() => {
    return () => {
      stopLocationTracking();
      stopInterval();
    };
  }, [stopInterval]);

  function stopLocationTracking() {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
    }
  }

  //subscribe to location services
  const startDeviceMotionTracking = async () => {
    try {
      // if we are already subscribed to the location services, do nothing.
      if (locationSubscription.current) {
        return;
      }
      //request permission to access location
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
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
  };

  //periodically send location to the server even if the location doesn't change
  const startLocationTrackingInterval = useCallback(() => {
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
  }, [isIntervalActive, locationRef.current]);

  const handleNewLocation = useCallback(
    (newLocation: Location.LocationObject) => {
      //if new location in null, do nothing
      //FIXME: does this prevent the interval from working?
      //does it solve the problem of the app crashing?
      if (!newLocation) return;
      locationRef.current = newLocation;
      sendLocationToServer(newLocation);
    },
    []
  );

  async function sendLocationToServer(location: Location.LocationObject) {
    try {
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
          limit: 20,
        })
        .then((response) => response.data);
      setKnnData(knn);
      setKnnDataIsLoading(false);
    } catch (error) {
      setKnnDataIsError(true);
      setKnnDataIsLoading(false);
      console.error("Error sending location to server:", error);
    }
  }

  return {
    startDeviceMotionTracking,
    startLocationTrackingInterval,
    knnDataIsLoading,
    knnDataIsError,
    knnData,
  };
}

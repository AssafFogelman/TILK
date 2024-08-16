import { useCallback, useEffect, useRef, useState } from "react";
import * as Location from "expo-location";

export function useTrackLocation() {
  const locationRef = useRef<null | Location.LocationObject>(null);
  const [isIntervalActive, setIsIntervalActive] = useState(false);
  const intervalRef = useRef<null | NodeJS.Timeout>(null);
  const locationSubscription = useRef<null | Location.LocationSubscription>(
    null,
  );
  const [locationDataIsLoading, setLocationDataIsLoading] = useState(true);
  const [locationDataIsError, setLocationDataIsError] = useState(false);
  const [locationData, setLocationData] = useState(null);

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

  const startDeviceMotionTracking = async () => {
    // if we are already subscribed, do nothing.
    // this could happen if the "home" screen unmounts and then remounts
    // (once the user left it and then returned to it)
    if (locationSubscription.current) {
      return;
    }

    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.log("Permission to access location was denied");
      return;
    }
    locationSubscription.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        distanceInterval: 50,
        //If you want to check that it works without having to move 50 meters, change distanceInterval to 0 (update regardless of location change)
        timeInterval: 1000 * 30, //update location if the device moved more than 50 meters, and no more that an update every 30 seconds
      },
      handleNewLocation,
    );
  };

  //periodically send location to the server even if the location doesn't change
  const startLocationTrackingInterval = useCallback(() => {
    if (!isIntervalActive) {
      intervalRef.current = setInterval(
        () => {
          console.log("the interval is active");
          if (locationRef.current) {
            console.log("location is not null");
            sendLocationToServer(locationRef.current);
          }
        },
        2 * 60 * 1000,
      ); // 2 minutes in milliseconds. executes for the first time only after 2 min.
      setIsIntervalActive(true);
    }
  }, [isIntervalActive, locationRef.current]);

  const handleNewLocation = useCallback(
    (newLocation: Location.LocationObject) => {
      locationRef.current = newLocation;
      sendLocationToServer(newLocation);
    },
    [],
  );

  async function sendLocationToServer(location: Location.LocationObject) {
    try {
      setLocationDataIsLoading(true);
      console.log(
        "location is: lat- ",
        location.coords.latitude,
        " lon- ",
        location.coords.longitude,
        " time- ",
        location.timestamp,
      );
      console.log("this location was going to be sent to the server. fix it");
      // await axios.post("YOUR_SERVER_URL", {
      //   latitude: location.coords.latitude,
      //   longitude: location.coords.longitude,
      //   timestamp: location.timestamp,
      // });
      // console.log("Location sent to server successfully");
      //FIXME
    } catch (error) {
      console.error("Error sending location to server:", error);
    }
  }

  return {
    startDeviceMotionTracking,
    startLocationTrackingInterval,
    locationDataIsLoading,
    locationDataIsError,
    locationData,
  };
}

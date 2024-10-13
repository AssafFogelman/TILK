// import { useTrackLocation } from "./hooks/useTrackLocation";
import { knnDataType } from "./types/types";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import * as Location from "expo-location";

// regardless of the location changes, perform the query every LOCATION_INTERVAL
const LOCATION_INTERVAL = 2 * 60 * 1000; // 2 minutes in milliseconds
//if the location changes more than DISTANCE_INTERVAL, perform only after TIME_INTERVAL
const DISTANCE_INTERVAL = 50; // 50 meters
const TIME_INTERVAL = 30 * 1000; // 30 seconds

type LocationContextType = {
  subscribe: () => void;
  currentLocation: Location.LocationObject | null;
};

export const LocationContext = createContext<LocationContextType | undefined>(
  undefined
);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const { subscribe, currentLocation } = useSubscribeLocation();
  //askLocationPermissionWhenAppReturnsToForeground:
  //in case the user gave a location permission it the phone's settings,
  //and returns to the app, the app should ask him to whether he would like to track his location
  return (
    <LocationContext.Provider value={{ subscribe, currentLocation }}>
      {children}
    </LocationContext.Provider>
  );
}

function useSubscribeLocation() {
  const locationSubscription = useRef<Location.LocationSubscription | null>(
    null
  );
  const [currentLocation, setCurrentLocation] =
    useState<Location.LocationObject | null>(null);

  useEffect(() => {
    return () => {
      if (locationSubscription.current) {
        // Intentionally using current ref value at cleanup time
        // eslint-disable-next-line react-hooks/exhaustive-deps
        locationSubscription.current.remove();
      }
    };
  }, []);

  return { subscribe, currentLocation };

  async function subscribe() {
    try {
      if (locationSubscription.current) return;

      //ask for location permission
      const { granted } = await Location.requestForegroundPermissionsAsync();
      if (!granted) {
        console.error("Permission to access location was denied");
        return;
      }

      //for the first time the user subscribes to location updates, we get the last known location
      const lastKnownLocation = await Location.getLastKnownPositionAsync({});
      setCurrentLocation(lastKnownLocation);

      //then we start the location subscription for location updates
      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: DISTANCE_INTERVAL,
          timeInterval: TIME_INTERVAL,
        },
        handleNewLocation
      );
    } catch (error) {
      console.error("Error in startDeviceMotionTracking:", error);
    }

    function handleNewLocation(location: Location.LocationObject) {
      setCurrentLocation(location);
    }
  }
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
}

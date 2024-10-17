// import { useTrackLocation } from "./hooks/useTrackLocation";
import { knnDataType } from "./types/types";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import * as Location from "expo-location";
import { AppState, AppStateStatus, Platform } from "react-native";
import { focusManager } from "@tanstack/react-query";

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

//provides location subscription and refetching of all Data on app focus
export function LocationProvider({ children }: { children: React.ReactNode }) {
  const { subscribe, currentLocation } = useSubscribeLocation();
  useRefetchDataOnAppFocus();
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
      //if we are already subscribed, return
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

    function handleNewLocation(location: Location.LocationObject | null) {
      if (location === null) return;
      setCurrentLocation(location);
    }
  }
}

function useRefetchDataOnAppFocus() {
  useEffect(() => {
    const subscription = AppState.addEventListener("change", onAppStateChange);

    return () => subscription.remove();
  }, []);

  function onAppStateChange(status: AppStateStatus) {
    if (Platform.OS !== "web") {
      focusManager.setFocused(status === "active");
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

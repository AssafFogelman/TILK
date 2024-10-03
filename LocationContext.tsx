import { knnDataType } from "./types/types";
import { createContext, useContext } from "react";
import { useTrackLocation } from "./hooks/useTrackLocation";

type LocationContextType = {
  startLocationTracking: () => void;
  knnDataIsLoading: boolean;
  knnDataIsError: boolean;
  knnData: knnDataType;
};

export const LocationContext = createContext<LocationContextType | undefined>(
  undefined
);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const { startLocationTracking, knnDataIsLoading, knnDataIsError, knnData } =
    useTrackLocation();
  //askLocationPermissionWhenAppReturnsToForeground:
  //in case the user gave a location permission it the phone's settings,
  //and returns to the app, the app should ask him to whether he would like to track his location
  return (
    <LocationContext.Provider
      value={{
        startLocationTracking,
        knnDataIsLoading,
        knnDataIsError,
        knnData,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
}

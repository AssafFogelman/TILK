import { knnDataType } from "./types/types";
import { createContext, useContext } from "react";
import { useTrackLocation } from "./hooks/useTrackLocation";

type LocationContextType = {
  startDeviceMotionTracking: () => Promise<void>;
  startLocationTrackingInterval: () => void;
  knnDataIsLoading: boolean;
  knnDataIsError: boolean;
  knnData: knnDataType;
};

export const LocationContext = createContext<LocationContextType | undefined>(
  undefined,
);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const {
    startDeviceMotionTracking,
    startLocationTrackingInterval,
    knnDataIsLoading,
    knnDataIsError,
    knnData,
  } = useTrackLocation();

  return (
    <LocationContext.Provider
      value={{
        startDeviceMotionTracking,
        startLocationTrackingInterval,
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

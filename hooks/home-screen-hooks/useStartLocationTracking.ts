import { useEffect } from "react";
import { useLocation } from "../../LocationContext";

export const useStartLocationTracking = () => {
  const { startDeviceMotionTracking, startLocationTrackingInterval } =
    useLocation();

  useEffect(() => {
    startDeviceMotionTracking();
    startLocationTrackingInterval();
  }, [startDeviceMotionTracking, startLocationTrackingInterval]);
};

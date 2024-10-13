// import { useEffect, useRef, useState } from "react";
// import * as Location from "expo-location";
// import axios from "axios";
// import { knnDataType } from "../types/types";
// import { AppState } from "react-native";
// import { useQuery, useQueryClient } from "@tanstack/react-query";

// /**
//  * useTrackLocation Hook
//  *
//  * manages location tracking and nearby user data (KNN - K-Nearest Neighbors) fetching for the app.
//  * It provides functionality to:
//  * 1. device motion tracking - Start and stop.
//  * 2. periodic interval for data fetching - in case the user hasn't changed its location.
//  * 3. returns loading and error states for the KNN data fetching process.
//  * 4. returns the KNN data.
//  *
//  * sends location to the server every 30 seconds if the location changes more than 50 meters - and receives new knn data.
//  * also sends location to the server every 2 minutes if the location hasn't changed - and gets new knn data.
//  */

// //regardless of the location changes, perform the query every LOCATION_INTERVAL
// const LOCATION_INTERVAL = 2 * 60 * 1000; // 2 minutes in milliseconds
// //if the location changes more than DISTANCE_INTERVAL, perform only after TIME_INTERVAL
// const DISTANCE_INTERVAL = 50; // 50 meters
// const TIME_INTERVAL = 30 * 1000; // 30 seconds

// export function useTrackLocation() {
//   const queryClient = useQueryClient();
//   const locationRef = useRef<Location.LocationObject | null>(null);
//   const [isIntervalActive, setIsIntervalActive] = useState(false);
//   const intervalRef = useRef<NodeJS.Timeout | null>(null);
//   const locationSubscription = useRef<Location.LocationSubscription | null>(
//     null
//   );

//   useEffect(() => {
//     startLocationTracking();
//     return () => {
//       stopLocationTracking();
//       // stopInterval();
//     };
//   });

//   const {
//     data: knnData,
//     isLoading: knnDataIsLoading,
//     isError: knnDataIsError,
//   } = useQuery({
//     //if locationRef.current changes (new location), perform the query
//     queryKey: ["knnData", locationRef.current],
//     queryFn: () => sendLocationToServer(locationRef.current),
//     //perform the query only if locationRef.current is not null
//     enabled: !!locationRef.current,
//     //refetch the query every LOCATION_INTERVAL
//     refetchInterval: LOCATION_INTERVAL,
//   });

//   // const stopInterval = () => {
//   //   if (intervalRef.current) {
//   //     clearInterval(intervalRef.current);
//   //     setIsIntervalActive(false);
//   //   }
//   // };

//   const stopLocationTracking = () => {
//     if (locationSubscription.current) {
//       locationSubscription.current.remove();
//     }
//   };

//   const sendLocationToServer = async (
//     location: Location.LocationObject | null
//   ) => {
//     if (!location || AppState.currentState !== "active") return;

//     try {
//       const { data } = await axios.post("/location", {
//         latitude: location.coords.latitude,
//         longitude: location.coords.longitude,
//         limit: 20,
//       });
//       return data.knn;
//     } catch (error) {
//       console.error("Error sending location to server:", error);
//       throw error;
//     }
//   };

//   const handleNewLocation = (newLocation: Location.LocationObject | null) => {
//     if (!newLocation) return;
//     queryClient.invalidateQueries({ queryKey: ["knnData"] });
//     locationRef.current = newLocation;
//   };

//   const startDeviceMotionTracking = async () => {
//     try {
//       if (locationSubscription.current) return;

//       const { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== "granted") {
//         console.error("Permission to access location was denied");
//         return;
//       }

//       //for the first time, we get the last known location
//       const lastKnownLocation = await Location.getLastKnownPositionAsync({});
//       handleNewLocation(lastKnownLocation);

//       //then we start the location subscription for location updates
//       locationSubscription.current = await Location.watchPositionAsync(
//         {
//           accuracy: Location.Accuracy.High,
//           distanceInterval: DISTANCE_INTERVAL,
//           timeInterval: TIME_INTERVAL,
//         },
//         handleNewLocation
//       );
//     } catch (error) {
//       console.error("Error in startDeviceMotionTracking:", error);
//     }
//   };

//   const startLocationTracking = () => {
//     startDeviceMotionTracking();
//     //if in the useQuery there is the "refetch interval" option, then we don't need this
//     // if (!isIntervalActive) {
//     //   intervalRef.current = setInterval(() => {
//     //     if (locationRef.current) {
//     //       queryClient.invalidateQueries({ queryKey: ["knnData"] });
//     //       //do we need this?
//     //       // sendLocationToServer(locationRef.current);
//     //     }
//     //   }, LOCATION_INTERVAL);
//     //   setIsIntervalActive(true);
//     // }
//   };

//   return {
//     knnData,
//     knnDataIsLoading,
//     knnDataIsError,
//   };
// }

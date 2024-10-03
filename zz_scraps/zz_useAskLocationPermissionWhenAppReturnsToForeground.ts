// import { useEffect, useState } from "react";
// import { AppState, AppStateStatus } from "react-native";
// import { useLocation } from "../../LocationContext";
// import * as Location from "expo-location";

//TODO: DELETEMEE
// //in case the user gave a location permission it the phone's settings,
// //and returns to the app, the app should ask him to whether he would like to track his location
// export function useAskLocationPermissionWhenAppReturnsToForeground() {
//   const { startDeviceMotionTracking, startLocationTrackingInterval } =
//     useLocation();
//   const [hasLocationPermission, setHasLocationPermission] = useState(false);
//   useEffect(() => {
//     const checkLocationPermission = async () => {
//       const { status } = await Location.requestForegroundPermissionsAsync();
//       setHasLocationPermission(status === "granted");
//     };

//     const handleAppStateChange = async (nextAppState: AppStateStatus) => {
//       //this will only perform the action only if the app was in the background

//       if (nextAppState === "active") {
//         console.log("app is in foreground");
//         await checkLocationPermission();
//         if (hasLocationPermission) {
//           startDeviceMotionTracking();
//           startLocationTrackingInterval();
//         }
//       }
//     };

//     const subscription = AppState.addEventListener(
//       "change",
//       handleAppStateChange
//     );

//     return () => {
//       subscription.remove();
//     };
//   }, [hasLocationPermission]);
// }

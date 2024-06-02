// Import the crypto getRandomValues shim (**BEFORE** the shims)
import "react-native-get-random-values";

// Import the the ethers shims (**BEFORE** ethers)
import "@ethersproject/shims";

// Import the ethers library
import { ethers } from "ethers";

import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import StackNavigator from "./StackNavigator";
import { UserContext } from "./UserContext";
import { socket } from "./socket.js";
import * as Location from "expo-location";
import { AppState } from "react-native";

import axios from "axios";
import { useEffect, useState } from "react";
/* config axios */
axios.defaults.baseURL = process.env.EXPO_PUBLIC_SERVER_ADDRESS;

export default function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");
  const [locationEnabled, setLocationEnabled] = useState(false);

  //connect websocket
  useEffect(() => {
    //if already connected, run connection function
    if (socket.connected) {
      onConnect();
    }

    function onConnect() {
      setIsConnected(true);
      // "transport" is the method of the connection - http/websocket. irrelevant really
      setTransport(socket.io.engine.transport.name);

      socket.io.engine.on("upgrade", (transport) => {
        setTransport(transport.name);
      });
    }

    function onDisconnect() {
      setIsConnected(false);
      setTransport("N/A");
    }

    // function onFooEvent(value) {
    //   setFooEvents(previous => [...previous, value]);
    // }

    //listen to events and run functions accordingly
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    //    socket.on('foo', onFooEvent);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      // socket.off('foo', onFooEvent);
    };
  }, []);

  //check whether location setting and permissions are enabled every time the app minimizes and returns
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: string) => {
      if (nextAppState === "active") {
        //app becomes active (in the foreground)

        //is the location setting on?
        const locationServiceEnabled = await Location.hasServicesEnabledAsync(); //true-false

        //if the location setting in disabled
        if (!locationServiceEnabled) {
          //*make the user invisible to others and others invisible to him
          //!ADD - make the user "off-grid" on the database.
          setLocationEnabled(false);

          //!ADD - send a message that tells the user how to enable the location settings
          console.log("location settings are not enabled!");
          console.log(
            "a message that tells the user how to enable the location settings"
          );
          console.log(
            "logic that makes a user invisible to others and makes other invisible to him"
          );
        }
        //if the location service in enabled, check for location permissions
        if (locationServiceEnabled) {
          //did the user permit getting the location?
          const { canAskAgain, granted } =
            await Location.getForegroundPermissionsAsync();

          if (granted) {
            //!ADD - check if the user has set himself as "off-grid".
            //! if not, then tell the database to make him "on-grid"
            //! show others to the user
            setLocationEnabled(true);
            console.log("location enabled!");
          }
          if (!granted) {
            //! ADD - tell the database to make him "off-grid"
            //! hide others from the user
            setLocationEnabled(false);
            console.log("location disabled!");
            //!ADD pop-up:
            console.log(
              "TILK needs permission to your location for you to see other users"
            );
            //pop-up window with an "approval" button
            if (canAskAgain) {
              //ask again
              await Location.enableNetworkProviderAsync();
              //did the user grant the permission?
              const { granted } =
                await Location.getForegroundPermissionsAsync();
              if (granted) {
                //!ADD - check if the user has set himself as "off-grid".
                //! if not, then tell the database to make him "on-grid"
                //! show others to the user
                setLocationEnabled(true);
                console.log("location enabled!");
              }
            }
            if (!canAskAgain) {
              //!show the user how to enable location permission in the phones` settings.
              //!this will make him minimize the app and restart the process.
            }
          }
        }
      }
    };
    //add a listener to when the app minimizes and returns
    const appStateListener = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      //removing the listener once the app is closed.
      appStateListener.remove();
    };
  }, []);

  return (
    <>
      <Text>
        user is {isConnected ? "connected" : "disconnected"} to websocket
      </Text>
      <UserContext>
        <StackNavigator />
      </UserContext>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});

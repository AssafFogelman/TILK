import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

const storeData = async (key: string, value: object) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
    console.log("successfully stored data in Async Storage");
  } catch (error) {
    console.log("error saving data to Async Storage");
    throw { message: "error saving data to Async Storage", error };
  }
};

const getData = async (key: string) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    Alert.alert(
      "error fetching data from Async Storage",
      "perhaps the key doesn't exist"
    );
    throw { message: "error fetching data from Async Storage", error };
  }
};

export default storeData;
export { getData };

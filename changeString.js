const dependenciesString = `@ethersproject/shims": "^5.7.0",
    "@expo/vector-icons": "^14.0.1",
    "@react-native-async-storage/async-storage": "1.23.1",
    "@react-navigation/native": "^6.1.17",
    "@react-navigation/native-stack": "^6.9.26",
    "axios": "^1.6.8",
    "babel-preset-react-native": "^4.0.1",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "ethers": "^6.12.1",
    "expo": "^51.0.2",
    "expo-file-system": "~17.0.1",
    "expo-image-picker": "~15.0.4",
    "expo-status-bar": "~1.12.1",
    "jwt-decode": "^4.0.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-native": "0.74.1",
    "react-native-emoji-selector": "^0.2.0",
    "react-native-get-random-values": "~1.11.0",
    "react-native-safe-area-context": "4.10.1",
    "react-native-screens": "~3.31.1",
    "@babel/core": "^7.24.5",
    "@types/multer": "^1.4.11",
    "@types/react": "^18.3.2",
    "@types/react-dom": "~18.3.0",
    "@types/react-native": "^0.72.8",
    "typescript": "^5.4.5",`;

const newString = dependenciesString.split('"');
// console.log("newString:", newString);
const newStringLength = newString.length;
// console.log("newString.length", newString.length);
let result = "";
for (let i = 0; i < newStringLength; i += 4) {
  //   console.log("i:", i);
  result = result + "npm i " + newString[i] + "@latest ";
}
console.log("result:", result);

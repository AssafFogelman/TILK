import { RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

//change this if you want to add "initialParams" to certain screens:
export type StackParamList = {
  Welcome: undefined; //there are no params that are sent to this screen
  Login: undefined; //there are no params that are sent to this screen
  Register: undefined; //there are no params that are sent to this screen
  Home: undefined; //there are no params that are sent to this screen
  Friends: undefined; //there are no params that are sent to this screen
  Chats: undefined; //there are no params that are sent to this screen
  Messages: { friendId: string }; //this screen will receive a param named "friendID" of type string */;
};

//this is the type for the useRoute() in "Messages" Screen
export type MessagesScreenRouteProp = RouteProp<StackParamList, "Messages">;

//this is the type for the useNavigation() in "Messages" Screen
export type MessagesScreenNavigationProp = NativeStackNavigationProp<
  StackParamList,
  "Messages"
>;

//this is the type for the useNavigation() in "Messages" Screen
export type HomeScreenNavigationProp = NativeStackNavigationProp<
  StackParamList,
  "Home"
>;

//this is the type for the useNavigation() in "Messages" Screen
export type WelcomeScreenNavigationProp = NativeStackNavigationProp<
  StackParamList,
  "Welcome"
>;

export type ChatMessageType = {
  __v: string;
  _id: string;
  imageUrl: string;
  messageType: string;
  recipientId: string;
  senderId: { _id: string; name: string };
  timeStamp: string;
  message: string;
};

export type MessageIdType = string;

import {RouteProp} from "@react-navigation/native";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";

//change this if you want to add "initialParams" to certain screens:
export type StackParamList = {
    Welcome: undefined; //there are no params that are sent to this screen
    PhoneVerification: { userCountry: string | null }; //we are sending data to this screen
    Login: undefined; //there are no params that are sent to this screen
    Register: undefined; //there are no params that are sent to this screen
    Home: undefined; //there are no params that are sent to this screen
    Friends: undefined; //there are no params that are sent to this screen
    Chats: undefined; //there are no params that are sent to this screen
    Messages: { friendId: string }; //this screen will receive a param named "friendID" of type string */;
    SelectAvatar: undefined; //there are no params that are sent to this screen
    PersonalDetails: undefined; //there are no params that are sent to this screen
    LookingTo: undefined; //there are no params that are sent to this screen
};

//this is the type for the useRoute() in "Welcome" Screen
export type WelcomeScreenRouteProp = RouteProp<StackParamList, "Welcome">;

//this is the type for the useRoute() in "Messages" Screen
export type MessagesScreenRouteProp = RouteProp<StackParamList, "Messages">;

//this is the type for the useNavigation() in "Messages" Screen
export type MessagesScreenNavigationProp = NativeStackNavigationProp<
    StackParamList,
    "Messages"
>;

//this is the type for the useNavigation() in "SelectAvatar" Screen
export type SelectAvatarScreenNavigationProp = NativeStackNavigationProp<
    StackParamList,
    "SelectAvatar"
>;


//this is the type for the useNavigation() in "PhoneVerificationScreen" Screen
export type PhoneVerificationScreenNavigationProp = NativeStackNavigationProp<
    StackParamList,
    "SelectAvatar"
>;

//this is the type for the useNavigation() in "PersonalDetailsScreen" Screen
export type PersonalDetailsScreenNavigationProp = NativeStackNavigationProp<
    StackParamList,
    "PersonalDetails"
>;


//this is the type for the useNavigation() in "Home" Screen
export type HomeScreenNavigationProp = NativeStackNavigationProp<
    StackParamList,
    "Home"
>;

//this is the type for the useNavigation() in "Welcome" Screen
export type WelcomeScreenNavigationProp = NativeStackNavigationProp<
    StackParamList,
    "Welcome"
>;

//this is the type for the useRoute() in "PhoneVerification" Screen
export type PhoneVerificationScreenRouteProp = RouteProp<
    StackParamList,
    "PhoneVerification"
>;

//this is the type for the useNavigation() in "Register" Screen
export type RegisterScreenNavigationProp = NativeStackNavigationProp<
    StackParamList,
    "Register"
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

//auth Context Types

export const ACTIONS = {
    RESTORE_TOKEN: "RESTORE_TOKEN",
    SIGN_IN: "SIGN_IN",
    SIGN_UP: "SIGN_UP",
    SIGN_OUT: "SIGN_OUT",
    RESET: "RESET",
    AVATAR_WAS_CHOSEN: "AVATAR_WAS_CHOSEN",
    BIO_WAS_CHOSEN: "BIO_WAS_CHOSEN",
    TAGS_WERE_CHOSEN: "TAGS_WERE_CHOSEN",
} as const;

export interface AuthState {
    isLoading: boolean;
    isSignOut: boolean;
    userToken: string | null;
    chosenAvatar: boolean;
    chosenBio: boolean;
    chosenTags: boolean;
    isAdmin: boolean;
    userId: string;
}

export type AuthAction =
    | { type: typeof ACTIONS.RESTORE_TOKEN; data: SignUpType }
    | { type: typeof ACTIONS.SIGN_IN; token: string }
    | { type: typeof ACTIONS.SIGN_OUT }
    | { type: typeof ACTIONS.SIGN_UP; data: SignUpType }
    | { type: typeof ACTIONS.AVATAR_WAS_CHOSEN }
    | { type: typeof ACTIONS.BIO_WAS_CHOSEN }
    | { type: typeof ACTIONS.TAGS_WERE_CHOSEN }
    | { type: typeof ACTIONS.RESET };

export type SignUpType = {
    userId: string;
    chosenAvatar: boolean;
    chosenBio: boolean;
    chosenTags: boolean;
    isAdmin: boolean;
    userToken: string;
};

export type MessageIdType = string;

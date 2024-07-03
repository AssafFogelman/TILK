import {
  ReactNode,
  createContext,
  useContext,
  useMemo,
  useReducer,
  useState,
} from "react";
import { ACTIONS, AuthAction, AuthState } from "./types/types";

/*
explanation:

1. we are providing the father component a state called "userId":

****

 <UserContext>
        <StackNavigator />
  </UserContext>

****

2. the component in of type "ReactNode"

3. { children }: { children: ReactNode }  - setting the type of the inner object of "children"

4. contextDefaultValue - the default value of the context, if nothing else defines it.

5. setUserId: (userId: null) => {} - gives it the correct type as a callback function receiving "userId"

*/

const contextDefaultValue = {
  // userId: null as unknown as string,
  // setUserDetails: (userId: string) => {}, // noop default callback
  userAttributes: {
    userId: "",
    chosenPhoto: false,
    chosenBio: false,
    chosenTags: false,
    isAdmin: false,
    offGrid: true,
    isSignOut: false,
  },
  setUserAttributes: (userAttributes: {
    userId: string;
    chosenPhoto: boolean;
    chosenBio: boolean;
    chosenTags: boolean;
    isAdmin: boolean;
    offGrid: boolean;
    isSignOut: boolean;
  }) => {}, // noop default callback
};

// const AuthContext = createContext();

// const AuthProvider = ({ children }: { children: ReactNode }) => {
//   return (
{
  /* <AuthContext.Provider value={authContext}>{children}</AuthContext.Provider>; */
}
//   );
// };

// export const authContext = useMemo(
//   () => ({
//     signIn: async (data) => {
//       // In a production app, we need to send some data (usually username, password) to server and get a token
//       // We will also need to handle errors if sign in failed
//       // After getting token, we need to persist the token using `SecureStore`
//       // In the example, we'll use a dummy token

//       dispatch({ type: ACTIONS.SIGN_IN, token: "dummy-auth-token" });
//     },
//     signOut: () => dispatch({ type: "SIGN_OUT" }),
//     signUp: async (data: AuthState) => {
//       // In a production app, we need to send user data to server and get a token
//       // We will also need to handle errors if sign up failed
//       // After getting token, we need to persist the token using `SecureStore`
//       // In the example, we'll use a dummy token

//       dispatch({ type: "SIGN_IN", token: "dummy-auth-token" });
//     },
//   }),
//   []
// );

export const [state, dispatch] = useReducer(reducer, initialValues);

// export { AuthContext, AuthProvider };

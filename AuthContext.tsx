import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import { ACTIONS, AuthAction, AuthState, SignUpType } from "./types/types";
import { deleteItemAsync, getItemAsync } from "expo-secure-store";
import axios, { AxiosError } from "axios";

const initialAuthDispatchContext = {
  signIn: async () => {},
  signOut: () => {},
  signUp: async (data: SignUpType) => {},
  resetState: () => {},
  avatarWasChosen: () => {},
  bioWasChosen: () => {},
  tagsWereChosen: () => {},
};

const reducerInitialValues: AuthState = {
  chosenAvatar: false,
  chosenBio: false,
  chosenTags: false,
  isAdmin: false,
  isSignOut: false,
  isLoading: true,
  userToken: null,
  userId: "",
};

function authReducer(prevState: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    //used for auto login
    case ACTIONS.RESTORE_TOKEN:
      return {
        ...prevState,
        isLoading: false,
        isSignOut: false,
        userToken: action.data.userToken,
        chosenAvatar: action.data.chosenAvatar,
        chosenBio: action.data.chosenBio,
        chosenTags: action.data.chosenTags,
        isAdmin: action.data.isAdmin,
        userId: action.data.userId,
      };
    case ACTIONS.SIGN_IN:
      return {
        ...prevState,
        isSignOut: false,
        userToken: action.token,
      };
    //used for when there is no token in the secure store
    //and the user signs up  (new or existing user)
    case ACTIONS.SIGN_UP:
      return {
        ...prevState,
        isSignOut: false,
        userToken: action.data.userToken,
        chosenAvatar: action.data.chosenAvatar,
        chosenBio: action.data.chosenBio,
        chosenTags: action.data.chosenTags,
        isAdmin: action.data.isAdmin,
        userId: action.data.userId,
      };
    case ACTIONS.SIGN_OUT:
      return {
        ...prevState,
        isSignOut: true,
        userToken: null,
        isLoading: false,
      };
    case ACTIONS.RESET:
      return {
        ...reducerInitialValues,
      };
    case ACTIONS.AVATAR_WAS_CHOSEN:
      return {
        ...prevState,
        chosenAvatar: true,
      };
    case ACTIONS.BIO_WAS_CHOSEN:
      return {
        ...prevState,
        chosenBio: true,
      };
    case ACTIONS.TAGS_WERE_CHOSEN:
      return {
        ...prevState,
        chosenTags: true,
      };
  }
}

export const AuthStateContext = createContext(reducerInitialValues);
export const AuthDispatchContext = createContext(initialAuthDispatchContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, reducerInitialValues);
  useAutoLogin();

  const authActions = useMemo(
    () => ({
      signIn: async () => {
        //TODO - insert the functionality in here
        // In a production app, we need to send some data (usually username, password) to server and get a token
        // We will also need to handle errors if sign in failed
        // After getting token, we need to persist the token using `SecureStore`
        // In the example, we'll use a dummy token
        // dispatch({ type: ACTIONS.SIGN_IN, token: "dummy-auth-token" });
      },
      signOut: () => {
        //TODO - insert the functionality in here
        dispatch({ type: "SIGN_OUT" });
      },

      signUp: async (data: SignUpType) => {
        //TODO - insert the functionality in here
        /*
          userId,
          chosenAvatar,
          chosenBio,
          chosenTags,
          isAdmin,
          userToken,
          */
        // In a production app, we need to send user data to server and get a token
        // We will also need to handle errors if sign up failed
        // After getting token, we need to persist the token using `SecureStore`
        dispatch({ type: ACTIONS.SIGN_UP, data: data });
      },
      resetState: () => {
        dispatch({ type: ACTIONS.RESET });
      },
      avatarWasChosen: () => {
        dispatch({ type: ACTIONS.AVATAR_WAS_CHOSEN });
      },
      bioWasChosen: () => {
        dispatch({ type: ACTIONS.BIO_WAS_CHOSEN });
      },
      tagsWereChosen: () => {
        dispatch({ type: ACTIONS.TAGS_WERE_CHOSEN });
      },
    }),
    []
  );

  return (
    <AuthStateContext.Provider value={state}>
      <AuthDispatchContext.Provider value={authActions}>
        {children}
      </AuthDispatchContext.Provider>
    </AuthStateContext.Provider>
  );

  function useAutoLogin() {
    useEffect(() => {
      // Fetch the token from storage then navigate to our appropriate place
      const getTokenAsync = async () => {
        let userToken: string | null;
        let user;
        let interceptorId: number | undefined;
        try {
          userToken = await getItemAsync("TILK-token");
          if (userToken) {
            //add the token to the header in every request
            interceptorId = axios.interceptors.request.use((config) => {
              config.headers["TILK-token"] = userToken;
              return config;
            });
            //validate the token in the server and get user details
            user = await axios
              .get("/user/user-data")
              .then((response) => response.data.user);
            console.log("user:", user);
            //if everything is OK, update the state. this also makes "isLoading" false.
            const data = {
              userToken,
              userId: user.userId,
              chosenAvatar: user.smallAvatar ? true : false,
              chosenBio: user.biography ? true : false,
              chosenTags: user.tagsUsers.length ? true : false, //is it an empty array
              isAdmin: user.admin,
            };
            //get out of the loading phase, as a signed-in user
            dispatch({ type: ACTIONS.RESTORE_TOKEN, data: data });
          } else {
            //get out of the loading phase, as a guest
            dispatch({ type: ACTIONS.SIGN_OUT });
          }
        } catch (error) {
          //if the problem came from the server, then the token is invalid (or the route address is wrong)
          if (axios.isAxiosError(error)) {
            if (error.response) {
              // The request was made and the server responded with a status code
              // that falls out of the range of 2xx
              const axiosError = error as AxiosError;
              console.log("axios error:", axiosError.response?.data);
              try {
                //delete the corrupt token
                await deleteItemAsync("TILK-token");
                //delete the axios interceptor with the bad token
                if (typeof interceptorId !== "undefined") {
                  axios.interceptors.request.eject(interceptorId);
                }
                //get out of the loading phase, as a guest
                dispatch({ type: ACTIONS.SIGN_OUT });
              } catch (deleteError) {
                console.log(
                  "problem occurred while deleting token",
                  deleteError
                );
              }
            } else if (error.request) {
              // The request was made but no response was received
              console.log(
                "No response received from the server:",
                error.request
              );
            }
          } else {
            //this is not an axios related error
            console.log("Restoring token failed for some reason:", error);
          }
        }
      };

      getTokenAsync();
    }, []);
  }
}

// Custom hooks to use auth state and dispatch

/*

Now, in your components, you can use these contexts like this:
javascript
function SomeComponent() {
  const { userToken, userId } = useAuthState();
  const { signOut } = useAuthDispatch();

  // Use userToken, userId, and signOut as needed
}


*/

export function useAuthState() {
  const context = useContext(AuthStateContext);
  if (context === undefined) {
    throw new Error("useAuthState must be used within an AuthProvider");
  }
  return context;
}

export function useAuthDispatch() {
  const context = useContext(AuthDispatchContext);
  if (context === undefined) {
    throw new Error("useAuthDispatch must be used within an AuthProvider");
  }
  return context;
}

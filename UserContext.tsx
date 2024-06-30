import {
  ReactNode,
  createContext,
  useContext,
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

const initialValues = {
  chosenPhoto: false,
  chosenBio: false,
  chosenTags: false,
  isAdmin: false,
  isSignOut: false,
  isLoading: true,
  userToken: null,
};

const UserContext = createContext(contextDefaultValue);

const UserProvider = ({ children }: { children: ReactNode }) => {
  // const [userId, setUserId] = useState(contextDefaultValue.userId);
  const [userAttributes, setUserAttributes] = useState(
    contextDefaultValue.userAttributes
  );
  const [state, dispatch] = useReducer(reducer, initialValues);

  return (
    <UserContext.Provider value={{ userAttributes, setUserAttributes }}>
      {children}
    </UserContext.Provider>
  );
};

function reducer(prevState: AuthState, action: AuthAction) {
  switch (action.type) {
    case ACTIONS.RESTORE_TOKEN:
      return {
        ...prevState,
        userToken: action.token,
        isLoading: false,
      };
    case ACTIONS.SIGN_IN:
      return {
        ...prevState,
        isSignOut: false,
        userToken: action.token,
      };
    case ACTIONS.SIGN_OUT:
      return {
        ...prevState,
        isSignOut: true,
        userToken: null,
      };
  }
}

export { UserContext, UserProvider };

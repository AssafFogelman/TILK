import { ReactNode, createContext, useState } from "react";

/*
explanation:

1. we are providing the father component a state called "userId":

****

 <UserContext>
        <StackNavigator />
  </UserContext>

****

2. the component in of type "ReactNode"

3. { children }: { children: ReactNode }  - setting the type of th inner object of "children"

4. contextDefaultValue - the default value of the context, if nothing else defines it.

5. setUserId: (userId: null) => {} - gives it the correct type as a callback function receiving "userId"

*/

const contextDefaultValue = {
  userId: null as unknown as string,
  setUserId: (userId: string) => {}, // noop default callback
};

const UserType = createContext(contextDefaultValue);

const UserContext = ({ children }: { children: ReactNode }) => {
  const [userId, setUserId] = useState(contextDefaultValue.userId);
  return (
    <UserType.Provider value={{ userId, setUserId }}>
      {children}
    </UserType.Provider>
  );
};

export { UserType, UserContext };

import { createContext, useState } from "react";
import useAuthUser from "../hooks/useAuthUser";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const { user, loading } = useAuthUser();
  const [googleUser, setGoogleUser] = useState(null);

  return <UserContext.Provider value={{
    user,
    loading,
    googleUser,
    setGoogleUser
  }}>
    {children}
  </UserContext.Provider>
}

export default UserContext
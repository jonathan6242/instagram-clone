import { createContext, useState } from "react";

const StoriesContext = createContext();

export const StoriesProvider = ({ children }) => {
  const [usersWithStories, setUsersWithStories] = useState(null)

  return <StoriesContext.Provider value={{
    usersWithStories, 
    setUsersWithStories
  }}>
    {children}
  </StoriesContext.Provider>
}

export default StoriesContext
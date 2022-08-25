import { useContext, useEffect } from "react"
import { Route, Routes, useLocation } from "react-router-dom";
import StoriesUser from "../components/StoriesUser";
import StoriesContext from "../context/StoriesContext";

function StoriesAll() {
  const { usersWithStories } = useContext(StoriesContext)
  const location = useLocation();

  return (
    <Routes>
      <Route 
        path='/:uid' 
        element={
          <StoriesUser 
            usersWithStories={usersWithStories}
            location={location}
          />
        }
      />
    </Routes>
  )
}
export default StoriesAll
import { useContext, useEffect, useState } from "react";
import PostModalMobile from "./components/PostModalMobile";
import ModalContext, { ModalProvider } from "./context/ModalContext";
import { addArrows } from "./services";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Profile from "./pages/Profile";
import ThemeContext from "./context/ThemeContext";
import Home from "./pages/Home";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import PostModal from "./components/PostModal";
import ForgotPassword from "./pages/ForgotPassword";
import EditProfile from "./pages/EditProfile";
import CreatePost from "./pages/CreatePost";
import StoriesAll from "./pages/StoriesAll";
import CreateStory from "./pages/CreateStory"
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import StoriesContext from "./context/StoriesContext";
import SignUpGoogle from "./pages/SignUpGoogle";
import { ToastContainer } from "react-toastify"
import 'react-toastify/dist/ReactToastify.css';
import useAuthUser from "./hooks/useAuthUser";
import UserContext from "./context/UserContext";
import Aos from "aos";
import 'aos/dist/aos.css';


function App() {
  const { setTheme } = useContext(ThemeContext)
  const { setUsersWithStories } = useContext(StoriesContext)
  const { user, loading } = useContext(UserContext)
  const [popupOpen, setPopupOpen] = useState(true);

  useEffect(() => {
    const theme = localStorage.getItem("theme")
    if(theme === 'light') {
      setTheme('light');
      document.documentElement.classList.remove('dark');
    } else {
      setTheme('dark')
      document.documentElement.classList.add('dark');
    }
  }, [])

  const hideEmojiPickers = (e) => {
    if(!e.target.classList.contains('emoji-group') 
    && !e.target.classList.contains('native')
    && !e.target.classList.contains('fa-face-smile'))
    {
      document.querySelectorAll('.emoji-picker-wrapper').forEach((picker) => {
        picker.classList.remove('block')
        picker.classList.add('hidden')
      })
    }
  }

  useEffect(() => {
    addArrows()
  }, [])

  // Get stories on mount and store as state in StoriesContext
  useEffect(() => {
    async function getStories() {
      console.log('Get stories')
      const data = await getDocs(
        collection(db, "stories")
      )
      let users = data.docs.map(doc => ({...doc.data(), id: doc.id}));
      // Filter out users with no stories
      users = users.filter(user => user?.stories?.length > 0)
      setUsersWithStories(users)
    }
    getStories()
  }, [])

  useEffect(() => {
    if(!user && !loading) {
      setPopupOpen(true);
    }
  }, [user, loading])

  useEffect(() => {
    Aos.init()
  }, [])

  return (
    <Router>
      <ModalProvider>
        <div 
          className="App bg-gray-50 dark:bg-dark2 dark:text-white min-h-screen"
          onClick={hideEmojiPickers}
        >
          <Routes>
            <Route path='/' element={
              <Home
                popupOpen={popupOpen}
                setPopupOpen={setPopupOpen}
              />
            } />
            <Route path='/post/:id' element={
              <>
                <Home 
                  popupOpen={popupOpen}
                  setPopupOpen={setPopupOpen}
                />
                <PostModal />
              </>
            } />
            <Route path="/post/:id/comments" element={<PostModalMobile />} />
            <Route path="/profile/:uid/post/:id/comments" element={<PostModalMobile />} />
            <Route path='/profile/:uid/*' element={<Profile />} />
            <Route path='/editprofile' element={<EditProfile />} />
            <Route path='/profile/post/:id' element={
              <>
                <Profile />
                <PostModal />
              </>
            } />
            <Route path='/signup' element={<SignUp />} />
            <Route path='/login' element={<Login />} />
            <Route path='/signupgoogle' element={<SignUpGoogle />} />
            <Route path='/forgotpassword' element={<ForgotPassword />} />
            <Route path='/createpost' element={<CreatePost />} />
            <Route path='/stories/*' element={<StoriesAll />} />
            <Route path='/createstory' element={<CreateStory />} />
            <Route path='/*' element={<>Not Found</>} />
          </Routes>
          <ToastContainer
            autoClose={3000}
          />
        </div>
      </ModalProvider>
    </Router>
  );
}

export default App;

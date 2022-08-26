import { signInWithEmailAndPassword } from "firebase/auth"
import { arrayRemove, doc, updateDoc } from "firebase/firestore"
import { useContext, useEffect } from "react"
import { toast } from "react-toastify"
import Feed from "../components/Feed"
import Navbar from "../components/Navbar"
import ModalContext from "../context/ModalContext"
import UserContext from "../context/UserContext"
import { auth, db } from "../firebase"
import useAuthUser from "../hooks/useAuthUser"

function Home({ popupOpen, setPopupOpen }) {
  const { user, loading } = useAuthUser();

  return (
    <div>
      <Navbar />
      {
        !user && !loading && popupOpen && (
          <div className="container lg:px-6 mx-auto my-6 md:mb-0 w-full max-w-[500px] lg:max-w-5xl hidden md:flex flex-col">      
            <div
              className="relative border-none p-6 bg-blue-400 text-white xs:rounded-lg space-x-2 flex flex-col lg:flex-row items-center justify-center text-center shadow-lg
              space-y-1 lg:space-y-0"
            >
              <span className="font-normal">
                Welcome to Insta.
              </span>
              <span 
                className="font-semibold hover:underline underline-offset-2 decoration-2 cursor-pointer"
                onClick={async () => {
                  setPopupOpen(false)
                  await signInWithEmailAndPassword(auth, "test@test.com", "demoaccount")
                  toast.success('Successfully logged in.')
                }}
              >
                Click here to sign in with a test account.
              </span>
              <i 
                className="absolute top-2 right-4 fa-solid fa-times text-xl cursor-pointer"
                onClick={() => setPopupOpen(false)}
              ></i>
            </div>
          </div>
        )
      }
      <Feed popupOpen={popupOpen} setPopupOpen={setPopupOpen} />
    </div>
  )
}
export default Home
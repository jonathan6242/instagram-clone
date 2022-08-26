import { signInWithEmailAndPassword } from "firebase/auth"
import { collection, doc, onSnapshot } from "firebase/firestore"
import { useContext, useEffect, useState } from "react"
import UserContext from "../context/UserContext"
import { auth, db } from "../firebase"
import Post from "./Post"
import PostSkeleton from "./PostSkeleton"
import Sidebar from "./Sidebar"
import Stories from "./Stories"
import { toast } from "react-toastify"
import { Link, useLocation } from "react-router-dom"
import ModalContext from "../context/ModalContext"
import useAuthUser from "../hooks/useAuthUser"

function Feed() {
  const [posts, setPosts] = useState(null)
  const { user, loading } = useAuthUser();
  const { popupOpen, setPopupOpen } = useContext(ModalContext)

  useEffect(
    () =>
      onSnapshot(
        collection(db, "posts"),
        (snapshot) => {
          setPosts(snapshot.docs
            .map(doc => ({...doc.data(), id: doc.id}))
            .sort((a, b) => b.dateCreated - a.dateCreated)
          );
        }
      ),
    [db]
  );

  return (
    <>
      <div className={`h-14 flex ${!loading && (user ? 'justify-center' : 'justify-between')} 
      items-center mb-4
      font-semibold text-2xl border-b dark:border-gray-500 bg-white dark:bg-dark1
      md:hidden px-6 md:px-0`}>
        Insta.
        {
          !loading && !user && (
            <div className="flex items-center">
              <Link
                to='/login' 
                className="text-sm font-semibold border-none bg-softBlue text-white mr-2 p-2 px-4 rounded-md cursor-pointer"
              >
                Log In
              </Link>
              <Link 
                to='/signup'
                className="text-sm font-semibold border-none text-softBlue p-2 rounded-md cursor-pointer"
              >
                Sign Up
              </Link>
            </div>
          )
        }

      </div>
      {
        !user && !loading && popupOpen && (
          <div className="container lg:px-6 mx-auto my-6 md:mb-0 w-full max-w-[500px] lg:max-w-5xl flex md:hidden flex-col">      
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
      <div className="container mx-auto px-0 md:px-6 max-w-5xl pb-24 
      flex justify-between space-x-8 md:pt-6">
        <div className="flex flex-col w-full max-w-[500px] lg:max-w-[540px] mx-auto lg:mx-0">
          <div className="flex flex-col space-y-6">
            <Stories />
            {
              posts !== null ? posts?.map(post => <Post key={post?.id} post={post} />)
              : new Array(3).fill(0).map((_, index) => <PostSkeleton key={index} />) 
            }
          </div>
        </div>
        {/* Suggested Users */}
        <Sidebar />
      </div>
    </>
  )
}
export default Feed
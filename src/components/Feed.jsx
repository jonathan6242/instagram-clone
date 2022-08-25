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

function Feed() {
  const [posts, setPosts] = useState(null)
  const { user, loading } = useContext(UserContext)
  const [demoLoading, setDemoLoading] = useState(false);
  const location = useLocation();

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
      <div className="container mx-auto px-0 md:px-6 max-w-5xl pb-24 
      flex justify-between space-x-8 md:pt-6">
        <div className="flex flex-col w-full max-w-[500px] lg:max-w-[540px] mx-auto lg:mx-0">
          {
            !user && !loading && (
              <div className="p-6 bg-white dark:bg-dark1 xs:rounded-lg shadow-lg
              flex flex-col lg:hidden mb-6">      
                <button 
                  className={`text-sm font-semibold border-none bg-red-500 text-white rounded-md cursor-pointer space-x-2 h-12 flex items-center justify-center
                  ${demoLoading ? 'bg-opacity-50' : ''}`}
                  onClick={async () => {
                    setDemoLoading(true)
                    await signInWithEmailAndPassword(auth, "test@test.com", "Lawrence2157")
                    setDemoLoading(false)
                    toast.success('Successfully logged in.')
                  }}
                  style={{pointerEvents: demoLoading ? 'none' : 'auto'}}
                >
                  {
                    !demoLoading ? (
                      <>
                        <i className="fa-solid fa-user"></i>
                        <span>Log in as Demo Account</span> 
                      </>
                    )
                    : <i className="animate-spin fa-solid fa-spinner text-xl"></i>
                  }
                </button>
              </div>
            )
          }

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
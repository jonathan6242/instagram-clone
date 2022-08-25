import { collection, doc, getDoc, onSnapshot } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import { Link, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom"
import LogoutModal from "../components/LogoutModal";
import Navbar from "../components/Navbar"
import PostModal from "../components/PostModal";
import PostThumbnail from "../components/PostThumbnail";
import ProfilePicture from "../components/ProfilePicture";
import UserList from "../components/UserList";
import ModalContext from "../context/ModalContext";
import StoriesContext from "../context/StoriesContext";
import UserContext from "../context/UserContext";
import { db } from "../firebase";
import Face from "../images/face.jpg"
import { allSeen, follow, hasStory } from "../services";

function Profile() {
  const navigate = useNavigate();
  const { user } = useContext(UserContext)
  const { uid } = useParams();
  const [profileUser, setProfileUser] = useState()
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState(null)
  const [followersOpen, setFollowersOpen] = useState(false);
  const [followingOpen, setFollowingOpen] = useState(false);
  const { usersWithStories } = useContext(StoriesContext)
  const location = useLocation();
  const { setLogoutOpen } = useContext(ModalContext)

  useEffect(() =>
    {
      setPosts(null)
      return onSnapshot(
        collection(db, "posts"),
        (snapshot) => {
          setPosts(
            snapshot.docs
              .map(doc => ({...doc.data(), id: doc.id}))
              .filter(post => post?.uid === uid)
              .sort((a, b) => b.dateCreated - a.dateCreated)
          );
        }
      )
    }, [uid]
  );
  

  async function getProfileUser() {
    setLoading(true);
    const docSnap = await getDoc(doc(db, "users", uid))
    setProfileUser(docSnap.data())
    if(user?.uid) {
      setIsFollowing(docSnap.data()?.followers.includes(user?.uid))
    }
    setLoading(false);
  }

  useEffect(() => {
    getProfileUser();
  }, [uid])

  const onClick = async () => {
    setIsFollowing(!isFollowing)

    // Change followers / following in local state
    if(!isFollowing) {
      setProfileUser({
        ...profileUser,
        followers: [...profileUser?.followers, user?.uid]
      })
    } else {
      setProfileUser({
        ...profileUser,
        followers: profileUser?.followers.filter(item => item !== user?.uid) 
      })
    }
    follow(user?.uid, profileUser?.uid, isFollowing)
   
  }
  
  function openModal() {
    setLogoutOpen(true)
  }

  return (
    <>
      <Navbar />
      <LogoutModal />
      {/* Mobile Header */}
      <div className="relative px-5 py-4 flex justify-center bg-white dark:bg-dark1
          font-semibold text-lg border-b dark:border-gray-500 md:hidden">
        {!loading ? profileUser?.username : 'Loading...'}
        <Link className="absolute z-30 fa-solid fa-chevron-left top-[18px] leading-none left-6 cursor-pointer text-black dark:text-white text-2xl md:hidden"
        to={ location?.state?.previousPath?.includes('stories') ? '/' : -1 }
        ></Link>
      </div>
      <div className="container mx-auto px-0 md:px-6 max-w-5xl py-6 
      flex flex-col">
        {
          !loading ? (
            <header className="w-full md:pb-10 md:pt-4 border-b dark:border-gray-500
            space-y-6 md:space-y-0">
              <div className="flex">
                <div className="flex-shrink-0 md:flex-1 px-6 md:flex md:justify-center">
                  <ProfilePicture 
                    src={profileUser?.photoURL}
                    uid={profileUser?.uid}
                    hasStory={hasStory(usersWithStories, profileUser?.uid)}
                    seen={allSeen(
                      usersWithStories?.find(user => user?.id === profileUser?.uid)?.stories,
                      user?.uid
                    )}
                    large
                  />
                </div>
                <div className="flex-[2] flex pr-6">
                  <div className="flex flex-col space-y-6">
                    <div className="flex flex-col items-start space-y-4
                    md:space-y-0 md:space-x-10 md:flex-row md:items-center">
                      <div className="text-2xl md:text-3xl font-light space-x-4">
                        <span>{profileUser?.username}</span>
                        {
                          user?.uid && profileUser?.uid === user?.uid && (
                            <button
                              className="fa-solid fa-gear md:hidden"
                              onClick={openModal}
                            ></button>
                          )
                        }
                      </div>
                      {
                        user?.uid && profileUser?.uid !== user?.uid ? (
                          <button className={
                              `follow-button w-32 ${isFollowing ? 'unfollow-button' : ''}`
                            } 
                            onClick={onClick}
                          >
                            {!isFollowing ? 'Follow' : 'Unfollow'}
                          </button>
                        ) : null
                      }
                      {
                        user?.uid && profileUser?.uid === user?.uid ? (
                          <Link to={`/editprofile`} className="text-center follow-button w-32 unfollow-button">
                            Edit Profile
                          </Link>
                        ) : null
                      }
                    </div>
                    <div className="hidden space-x-10 md:flex">
                      <span>
                        <span className="font-semibold">
                          {posts?.length}
                        </span> posts
                      </span>
                      <span 
                        className="cursor-pointer"
                        onClick={() => setFollowersOpen(true)}
                      >
                        <span className="font-semibold">
                          {profileUser?.followers.length}
                        </span> followers
                      </span>
                      <span
                        className="cursor-pointer"
                        onClick={() => setFollowingOpen(true)}
                      >
                        <span className="font-semibold">
                          {profileUser?.following.length}
                        </span> following
                      </span>
                    </div>
                    <div className="hidden font-semibold md:block">
                      {profileUser?.fullName}
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-6 font-semibold md:hidden">
                {profileUser?.fullName}
              </div>
              {/* Mobile Statistics */}
              <div className="flex border-t dark:border-gray-500 py-4 md:hidden">
                <div className="flex-1 justify-center">
                  <div className="flex flex-col items-center">
                    <span className="font-semibold">
                      {posts?.length}
                    </span>
                    <span>posts</span>
                  </div>
                </div>
                <div className="flex-1 justify-center">
                  <div 
                    className="flex flex-col items-center"
                    onClick={() => setFollowersOpen(true)}
                  >
                    <span className="font-semibold">
                      {profileUser?.followers.length}
                    </span>
                    <span>followers</span>
                  </div>
                </div>
                <div 
                  className="flex-1 justify-center"
                  onClick={() => setFollowingOpen(true)}
                >
                  <div className="flex flex-col items-center">
                    <span className="font-semibold">
                      {profileUser?.following.length}
                    </span>
                    <span>following</span>
                  </div>
                </div>
              </div>
            </header>
          ) : (
            <header className="w-full md:pb-10 md:pt-4 border-b dark:border-gray-500
            space-y-6 md:space-y-0">
              <div className="flex">
                <div className="flex-shrink-0 md:flex-1 px-6">
                  <div 
                    className="w-20 h-20 md:mx-auto rounded-full animated-bg 
                    md:w-40 md:h-40" 
                    />
                </div>
                <div className="flex-[2] flex pr-6">
                  <div className="flex flex-col space-y-6">
                    <div className="flex flex-col items-start space-y-4
                    md:space-y-0 md:space-x-10 md:flex-row md:items-center">
                      <div className="animated-bg rounded w-52 text-2xl md:text-3xl font-light">
                        &nbsp;
                      </div>
                      <div className="animated-bg rounded w-32 h-8">
                        &nbsp;
                      </div>
                    </div>
                    <div className="hidden space-x-10 md:flex w-80 animated-bg rounded">
                      &nbsp;
                    </div>
                    <div className="hidden font-semibold md:block animated-bg rounded w-32">
                      &nbsp;
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-6 font-semibold md:hidden">
                <span className="inline-block animated-bg rounded w-32">&nbsp;</span>
              </div>
              {/* Mobile Statistics */}
              <div className="flex border-t dark:border-gray-500 py-4 md:hidden">
                <div className="flex-1 justify-center">
                  <div className="flex flex-col items-center w-16 animated-bg rounded mx-auto">
                    <span className="font-semibold">&nbsp;</span>
                    <span>&nbsp;</span>
                  </div>
                </div>
                <div className="flex-1 justify-center">
                  <div className="flex flex-col items-center w-16 animated-bg rounded mx-auto">
                    <span className="font-semibold">&nbsp;</span>
                    <span>&nbsp;</span>
                  </div>
                </div>
                <div className="flex-1 justify-center">
                  <div className="flex flex-col items-center w-16 animated-bg rounded mx-auto">
                    <span className="font-semibold">&nbsp;</span>
                    <span>&nbsp;</span>
                  </div>
                </div>
              </div>
            </header>
          )
        }
        
        <div className="md:pt-10">
          {/* Images Grid */}
          <div className="grid grid-cols-3 gap-1 md:gap-6">
            {
              posts !== null ? posts.map(
                post => <PostThumbnail post={post} key={post?.id} />
              ) : (
                new Array(9).fill(0).map((_, index) => (
                  <div className="pb-[100%] animated-bg" key={index}></div>
                ))
              )
            }
          </div>
        </div>
      </div>
      {
        followersOpen && (
          <UserList
            setProfileUser={setProfileUser}
            profileUser={profileUser}
            setOpen={setFollowersOpen}
            users={profileUser?.followers}
            type="Followers"
          />
        )
      }
      {
        followingOpen && (
          <UserList
            setProfileUser={setProfileUser}
            profileUser={profileUser}
            setOpen={setFollowingOpen}
            users={profileUser?.following}
            type="Following"
          />
        )
      }
      <Routes>
        <Route path='/post/:id' element={<PostModal />} />
      </Routes>
    </>
  )
}
export default Profile
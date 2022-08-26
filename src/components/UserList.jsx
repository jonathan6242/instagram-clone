import { doc, getDoc } from "firebase/firestore";
import { useEffect, useRef, useState } from "react"
import { useLocation } from "react-router-dom";
import { db } from "../firebase";
import ProfilePicture from "./ProfilePicture";
import UserListItem from "./UserListItem";

function UserList({ setOpen, users, type, setProfileUser, profileUser }) {
  const [userProfiles, setUserProfiles] = useState(null);

  useEffect(() => {
    async function getUserProfiles() {
      let arr = [];
      for(let uid of users) {
        const docSnap = await getDoc(doc(db, "users", uid));
        arr.push(docSnap.data());
      }
      setUserProfiles(arr)
    }
    getUserProfiles();
  }, [])

  // useEffect(() => {
  //   if(userProfiles) {
  //     console.log('User profiles:', userProfiles)
  //   }
  // }, [userProfiles])

  return (
    <>
      {/* Above 768px */}
      <div 
        className="fixed inset-0 z-10 bg-black/50 hidden md:flex"
        onClick={() => setOpen(false)}
      >
      </div>
      <div className="absolute inset-0 hidden md:flex justify-center items-center">
        <div className="bg-white dark:bg-dark1 w-full max-w-sm flex flex-col rounded-lg overflow-hidden z-20 max-h-[90vh]">
          <div className="px-3 py-2 flex items-center border-b">
            <div className="flex-1 text-center font-semibold">
              {type}
            </div>
            <i 
              className="fa-solid fa-times text-2xl cursor-pointer"
              onClick={() => setOpen(false)}
            ></i>
          </div>
          <div className="h-96 flex flex-col space-y-3 p-3 pb-5 overflow-y-scroll">
            {
              userProfiles ? userProfiles.map(profile => (
                <UserListItem
                  key={profile?.uid}
                  profile={profile}
                  setOpen={setOpen}
                  setProfileUser={setProfileUser}
                  profileUser={profileUser}
                  type={type}
                />
              )) : (
                <img 
                  src="https://c.tenor.com/I6kN-6X7nhAAAAAj/loading-buffering.gif"
                  className="w-8 h-8 mx-auto"
                />
              )
            }
          </div>
        </div>
      </div>
      {/* Below 768px */}
      <div className="fixed inset-0 min-h-screen z-30 flex flex-col bg-white dark:bg-dark2 dark:text-white md:hidden">
        <i
          className="fixed z-40 fa-solid fa-chevron-left top-[18px] leading-none left-6 cursor-pointer text-black dark:text-white text-2xl"
          onClick={() => setOpen(false)}
        ></i>
        <div className="px-5 py-4 flex justify-center bg-white dark:bg-dark1
        font-semibold text-lg border-b dark:border-gray-500">
          {type}
        </div>
        <div className="flex-1 flex flex-col space-y-3 p-3 pb-5 overflow-y-scroll">
            {
              userProfiles ? userProfiles.map(profile => (
                <UserListItem
                  key={profile?.uid}
                  profile={profile}
                  setOpen={setOpen}
                  setProfileUser={setProfileUser}
                  profileUser={profileUser}
                  type={type}
                />
              )) : (
                <img 
                  src="https://c.tenor.com/I6kN-6X7nhAAAAAj/loading-buffering.gif"
                  className="w-8 h-8 mx-auto"
                />
              )
            }
          </div>
      </div>
    </>
  )
}
export default UserList
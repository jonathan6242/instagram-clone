import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import UserContext from "../context/UserContext";
import useAuthUser from "../hooks/useAuthUser";
import { follow } from "../services";
import ProfilePicture from "./ProfilePicture"

function UserListItem({ setOpen, profile, setProfileUser, profileUser, type }) {
  const { user } = useContext(UserContext);
  const [isFollowing, setIsFollowing] = useState(profile.followers.includes(user?.uid));

  const onClick = async () => {
    if(!user) {
      return;
    }
    setIsFollowing(!isFollowing)

    if(profileUser?.uid === user?.uid && type === 'Following') {
      // Change followers / following in local state
      if(!isFollowing) {
        setProfileUser({
          ...profileUser,
          following: [...profileUser?.following, profile?.uid]
        })
      } else {
        setProfileUser({
          ...profileUser,
          following: profileUser?.following.filter(item => item !== profile?.uid) 
        })
      }
    }
    follow(user?.uid, profile?.uid, isFollowing)
  }

  return (
    <div className="flex justify-between items-center">
    <div className="flex items-center space-x-2">
      <ProfilePicture 
        src={profile?.photoURL} 
        uid={profile?.uid}
        close={() => setOpen(false)}
      />
      <div>
        <Link 
          className="font-semibold"
          to={`/profile/${profile?.uid}`}
          onClick={() => setOpen(false)}
        >
          {profile?.username}
        </Link>
        <div className="text-gray-400">
          {profile?.fullName}
        </div>
      </div>
    </div>
    {
      user && profile?.uid !== user?.uid && (
        <button 
          className={`follow-button ${isFollowing ? 'unfollow-button' : ''}`}
          onClick={onClick}
        >
          {isFollowing ? 'Following' : 'Follow'}
        </button>
      )
    }

  </div>
  )
}
export default UserListItem
import { useState } from "react"
import ProfilePicture from "./ProfilePicture"
import { follow } from "../services"
import { Link } from "react-router-dom"

function SuggestedUser({ user, firestoreUser }) {
  const [ followed, setFollowed ] = useState(false)

  const onClick = async () => {
    setFollowed(true);
    follow(firestoreUser.uid, user.uid, false)
  }

  return (
    !followed ? (
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ProfilePicture 
            src={user?.photoURL}
            uid={user?.uid}
          />
          <Link 
            className="font-semibold"
            to={`/profile/${user?.uid}`}
          >
            {user?.username}
          </Link>
        </div>
        <button className="follow-button"
        onClick={onClick}>
          Follow
        </button>
      </div>
    ) : null
  )
}
export default SuggestedUser
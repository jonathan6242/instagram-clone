import { useState } from "react"
import ProfilePicture from "./ProfilePicture"
import { follow } from "../services"

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
          <div className="font-semibold">{user?.username}</div>
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
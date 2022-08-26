import { formatDistanceToNowStrict } from "date-fns"
import ar from "date-fns/esm/locale/ar/index.js"
import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore"
import { useContext, useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { toast } from "react-toastify"
import StoriesContext from "../context/StoriesContext"
import UserContext from "../context/UserContext"
import { db } from "../firebase"
import Face from "../images/face.jpg"
import { allSeen, hasStory, shortenFormatDistance } from "../services"
import ProfilePicture from "./ProfilePicture"

function CommentModal({ comment, postId }) {
  const { user } = useContext(UserContext)
  const [likes, setLikes] = useState();
  const { usersWithStories } = useContext(StoriesContext)
  var doubletapDeltaTime = 700;
  var doubletap1Function = null;
  var doubletap2Function = null;
  var doubletapTimer = null;

  function doubletapTimeout() {
      // Wait for second tap timeout
      if(doubletap1Function) {
        doubletap1Function();
      }
      doubletapTimer = null;
  }

  function tap(singleTapFunc, doubleTapFunc) {
      if (doubletapTimer==null) {
          doubletapTimer = setTimeout(doubletapTimeout, doubletapDeltaTime);
          doubletap1Function = singleTapFunc;
          doubletap2Function = doubleTapFunc;
      } else {
          clearTimeout(doubletapTimer);
          doubletapTimer = null;
          doubletap2Function();
      }
  }
    
  useEffect(() => {
    if(comment) {
      setLikes(comment?.likes)
    }
  }, [comment])

  const likeComment = async () => {
    if(!user) {
      toast.info('Sign in to like comments.');
      return;
    }
    if(!likes.includes(user?.uid)) {
      setLikes([...likes, user?.uid])
      await updateDoc(doc(db, "posts", postId, "comments", comment?.id), {
        likes: arrayUnion(user?.uid)
      })
    } else {
      setLikes(likes.filter(item => item !== user?.uid))
      await updateDoc(doc(db, "posts", postId, "comments", comment?.id), {
        likes: arrayRemove(user?.uid)
      })
    }
  }

  const likeCommentDoubleClick = async () => {
    if(!user) {
      toast.info('Sign in to like comments.');
      return;
    }
    if(!likes.includes(user?.uid)) {
      setLikes([...likes, user?.uid])
      await updateDoc(doc(db, "posts", postId, "comments", comment?.id), {
        likes: arrayUnion(user?.uid)
      })
    }
  }

  return (
    <div 
      className="flex justify-between items-center space-x-4 text-sm md:text-base"
      onClick = {() => {tap(null, likeCommentDoubleClick)}}
    >
      <div className="flex items-start space-x-3">
        <ProfilePicture
          src={comment?.photoURL}
          uid={comment?.uid}
          hasStory={!allSeen(
            usersWithStories?.find(user => user?.id === comment?.uid)?.stories,
            user?.uid
          )}
          seen={false}
        />
        <div className="space-y-4">
          <div>
            <Link 
              className="mr-3 font-semibold"
              to={`/profile/${comment?.uid}`}
            >
              {comment?.username}
            </Link>
            <span className="text-gray-600 dark:text-gray-200 break-words">
              {comment?.comment}
            </span>
          </div>
          <div className="flex space-x-3 text-gray-400 text-sm">
            {
              comment?.likes?.length > 0 && (
                <span>{comment?.likes?.length} likes</span>
              )
            }
            <span>
              {comment?.dateCreated && 
                shortenFormatDistance(
                  formatDistanceToNowStrict(comment?.dateCreated)
                ) 
              }
            </span>
          </div>
        </div>
      </div>
      <button 
          className={
            likes?.includes(user?.uid) ? "fa-solid fa-heart text-sm text-red-400 animate-like"
            : "fa-regular fa-heart text-sm"
          }
          onClick={likeComment}
        >
      </button>
    </div>
  )
}
export default CommentModal
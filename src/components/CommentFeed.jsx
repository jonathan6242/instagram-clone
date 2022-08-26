import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";
import { useContext, useEffect, useState } from "react"
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import UserContext from "../context/UserContext";
import { db } from "../firebase";

function CommentFeed({ comment, postId }) {
  const { user } = useContext(UserContext)
  const [likes, setLikes] = useState();
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
      className="flex justify-between"
      onClick = {() => {tap(null, likeCommentDoubleClick)}}
    >
      <p className="line-clamp-4">
        <Link 
          className="mr-2 font-semibold"
          to={`/profile/${comment?.uid}`}
        >
          {comment?.username}
        </Link>
        <span className="text-gray-600 dark:text-gray-200">
          {comment?.comment}
        </span>
      </p>
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
export default CommentFeed
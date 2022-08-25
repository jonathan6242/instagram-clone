import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";
import { useContext, useEffect, useState } from "react"
import UserContext from "../context/UserContext";
import { db } from "../firebase";

function CommentFeed({ comment, postId }) {
  const { user } = useContext(UserContext)
  const [likes, setLikes] = useState();

  useEffect(() => {
    if(comment) {
      setLikes(comment?.likes)
    }
  }, [comment])

  const likeComment = async () => {
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

  return (
    <div className="flex justify-between">
      <p className="line-clamp-4">
        <span className="mr-2 font-semibold">{comment?.username}</span>
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
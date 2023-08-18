import { Navigation, Pagination, A11y } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import { useContext, useEffect, useState } from "react";
import { addArrows, allSeen, hasStory } from "../services";
import ProfilePicture from "./ProfilePicture";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { addDoc, arrayRemove, arrayUnion, collection, doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { formatDistanceToNowStrict } from "date-fns"
import UserContext from '../context/UserContext';
import CommentFeed from './CommentFeed';
import PostSkeleton from './PostSkeleton';
import EmojiPicker from './EmojiPicker';
import StoriesContext from "../context/StoriesContext"
import { toast } from 'react-toastify';

function Post({ post }) {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [likes, setLikes] = useState();
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const { usersWithStories } = useContext(StoriesContext)
  const location = useLocation()

  useEffect(() => {
    if(post) {
      setLikes(post.likes)
    }
  }, [post])

  useEffect(() => {
    addArrows();
  }, [])

  useEffect(
    () => {
      if(post) {
        return onSnapshot(
          collection(db, "posts", post?.id, "comments"),
          (snapshot) => {
            setComments(
              snapshot.docs
                .map(doc => ({...doc.data(), id: doc.id}))
                .sort((a, b) => a.dateCreated - b.dateCreated)
            );
          }
        )
      }
    }
    , [post]
  )

  const likePost = async (e) => {
    if(!user) {
      toast.info('Sign in to like posts.');
      return;
    }
    if(!likes.includes(user?.uid)) {
      setLikes([...likes, user?.uid])
      await updateDoc(doc(db, "posts", post?.id), {
        likes: arrayUnion(user?.uid)
      })
    } else {
      setLikes(likes.filter(item => item !== user?.uid))
      await updateDoc(doc(db, "posts", post?.id), {
        likes: arrayRemove(user?.uid)
      })
    }
  }

  const likePostDoubleClick = async (e) => {
    if(!user) {
      toast.info('Sign in to like posts.');
      return;
    }
    const heart = e.el.children.heart
    if(!heart.classList.contains('animate-heart')) {
      heart.classList.add('animate-heart')
      setTimeout(() => {
        heart.classList.remove('animate-heart')
      }, 1000)
    }
    if(!likes.includes(user?.uid)) {
      setLikes([...likes, user?.uid])
      await updateDoc(doc(db, "posts", post?.id), {
        likes: arrayUnion(user?.uid)
      })
    }
  }

  const addComment = async (e) => {
    e.preventDefault();
    if(!user) {
      toast.info('Sign in to add comments.');
      return;
    }
    if(comment.length < 1) {
      return;
    }
    setComment('')
    await addDoc(
      collection(db, "posts", post?.id, "comments"),
      {
        comment,
        photoURL: user?.photoURL,
        username: user?.displayName,
        uid: user?.uid,
        postId: post?.id,
        likes: [],
        dateCreated: Date.now()
      }
    )
    
  }

  if(post === null) {
    return <PostSkeleton />
  }

  return (
    <div 
      className="w-full bg-white dark:bg-dark1 post relative shadow-lg"
    >
      {/* Header */}
      <div className="p-4 px-5 justify-between">
        <div className="flex items-center space-x-3">
          {
            usersWithStories !== null && (
              <ProfilePicture
                uid={post?.uid}
                src={post?.photoURL}
                hasStory={!allSeen(
                  usersWithStories?.find(user => user?.id === post?.uid)?.stories,
                  user?.uid
                )}
                seen={false}
              />
            )
          }

          <Link to={`/profile/${post?.uid}`} className="font-semibold">
            {post?.username}
          </Link>
        </div>
      </div>
      {/* Swiper */}
      <Swiper
        // install Swiper modules
        modules={[Navigation, Pagination, A11y]}
        navigation
        pagination={{ clickable: true }}
        className="relative z-0 flex justify-center items-center"
        onDoubleClick={likePostDoubleClick}
      >
        <div id="heart" className="absolute fa-solid fa-heart text-white z-10
        top-[170px] text-8xl opacity-90 scale-0"></div>
        {
          post?.photos.map((photo, index) => (
            <SwiperSlide key={index}>
              <div className={`w-full bg-cover bg-center bg-no-repeat relative`}
              style={{backgroundImage: `url(${photo})`}}>
              </div>
              {/* <img src={photo} className="w-full h-full object-cover" /> */}
            </SwiperSlide>
          ))
        }
      </Swiper>
      {/* Bottom Container */}
      <div className="px-5 py-4 md:pb-0 relative z-0">
        <div className="flex justify-between items-center mb-3">
          {/* Actions */}
          <div className="flex space-x-4">
            <button 
              className={
                likes?.includes(user?.uid) ? "fa-solid fa-heart text-2xl text-red-400 animate-like"
                : "fa-regular fa-heart text-2xl"
              }
              onClick={likePost}
            >

            </button>
            {/* Reply (Mobile) */}
            <div className="fa-regular fa-comment text-2xl cursor-pointer md:hidden"
            onClick={() => {
              if(location?.pathname?.includes('profile')) {
                navigate(`/profile/${post?.uid}/post/${post?.id}/comments`)
              } else {
                navigate(`/post/${post?.id}/comments`)
              }
            }}></div>
            {/* Reply (Desktop) */}
            <div className="fa-regular fa-comment text-2xl cursor-pointer hidden md:block"
            onClick={() => navigate(`/post/${post?.id}`)}></div>
          </div>
        </div>
        <div className="my-4 font-semibold">{likes?.length} likes</div>
        <p className="line-clamp-4">
          <Link to={`/profile/${post?.uid}`} className="mr-2 font-semibold">
            {post?.username}
          </Link>
          <span className="text-gray-600 dark:text-gray-200">
            {post?.caption}
          </span>
        </p>
        {
          comments.length > 2 ? (
            <div className='flex flex-col'>
              {/* View comments (Mobile) */}
              <p 
                className="my-3 space-x-1 text-sm text-gray-400 group cursor-pointer md:hidden self-start"
                onClick={() => {
                  if(location?.pathname?.includes('profile')) {
                    navigate(`/profile/${post?.uid}/post/${post?.id}/comments`)
                  } else {
                    navigate(`/post/${post?.id}/comments`)
                  }
                }}
              >
                <span className="duration-200 group-hover:tracking-wide">
                  View all {comments?.length} comments
                </span> 
                <i className="duration-200 fa-solid fa-arrow-right
                group-hover:translate-x-1"></i>
              </p>
              {/* View comments (Desktop) */}
              <p className="my-3 space-x-1 text-sm text-gray-400 group cursor-pointer hidden md:block self-start"
              onClick={() => navigate(`/post/${post?.id}`)}>
                <span className="duration-200 group-hover:tracking-wide">
                  View all {comments?.length} comments
                </span> 
                <i className="duration-200 fa-solid fa-arrow-right
                group-hover:translate-x-1"></i>
              </p>
            </div>
          ) : <div className='my-3'></div>
        }

        {/* Comments */}
        <div className="space-y-1">
          {
            comments.map(comment => (
              <CommentFeed comment={comment} key={comment?.id} postId={post?.id} />
            )).slice(-2)
          }
      
        </div>
        <div className="text-xs uppercase text-gray-400 mt-3 mb-5">
          {post?.dateCreated && formatDistanceToNowStrict(post?.dateCreated)} ago
        </div>
        <div className="-mx-5 md:border-b md:dark:border-gray-500"></div>
        <div className="py-3 hidden md:flex">
          <EmojiPicker comment={comment} setComment={setComment} />
          <form onSubmit={addComment} className="flex-1 flex">
            <input 
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)} 
              className="bg-transparent flex-1 outline-none text-base placeholder:text-base" 
              placeholder="Add a comment..."
            />
            <button
              disabled={comment.length < 1}
              className={`text-softBlue font-semibold my-auto
              ${(comment.length < 1) ? 'opacity-50' : null}`}
            >
              Post
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
export default Post
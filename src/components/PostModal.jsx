import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useContext, useEffect, useRef, useState } from 'react';
import PostModalSwiper from './PostModalSwiper';
import CommentModal from './CommentModal';
import ProfilePicture from './ProfilePicture';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import Post from './Post';
import { addDoc, arrayRemove, arrayUnion, collection, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import UserContext from '../context/UserContext';
import { formatDistanceToNowStrict } from 'date-fns';
import EmojiPicker from './EmojiPicker';
import StoriesContext from '../context/StoriesContext';
import { allSeen, hasStory } from '../services';
import { toast } from 'react-toastify';

function PostModal() {
  const { user } = useContext(UserContext);
  const [post, setPost] = useState(null);
  const [likes, setLikes] = useState();
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const navigate = useNavigate();
  const { id, uid } = useParams();
  const [isOpen, setIsOpen] = useState(false)
  const inputRef = useRef();
  const { usersWithStories } = useContext(StoriesContext)
  const location = useLocation();

  useEffect(() => {
    async function getPost() {
      const docSnap = await getDoc(doc(db, "posts", id));
      setPost({...docSnap.data(), id: docSnap.id})
    }
    getPost();
    return () => {
      document.body.classList.remove('post-modal-open')
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    if(post) {
      setLikes(post.likes)
    }
  }, [post])

  useEffect(() => {
    if(isOpen) {
      document.body.classList.add('post-modal-open')
    } else {
      document.body.classList.remove('post-modal-open')
    }
  }, [isOpen])

  useEffect(
    () => {
      if(post) {
        return onSnapshot(
          collection(db, "posts", post?.id, "comments"),
          (snapshot) => {
            setComments(
              snapshot.docs
                .map(doc => ({...doc.data(), id: doc.id}))
                .sort((a, b) => b.dateCreated - a.dateCreated)
            );
          }
        )
      } 
    }
    , [post]
  )

  useEffect(() => {
    setIsOpen(true);
  }, [])

  const likePost = async () => {
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
  
  const shortenFormatDistance = (formatDistance) => {
    let arr = formatDistance.split(" ")
    return arr[0] + " " + arr[1][0];
  }

  return (

      <div className="fixed inset-0 z-30 flex items-center justify-center post-modal px-6 overflow-y-hidden"
      >
        {
          isOpen && (
            <div className="fixed z-10 inset-0 bg-black/50" 
            onClick={() => {
              setIsOpen(false)
              setTimeout(() => {
                if(location?.pathname?.includes('profile')) {
                  navigate(location?.pathname?.slice(0, location?.pathname?.indexOf('post')))
                } else {
                  navigate('/')
                }
              }, 75)
            }}/>
          )
        }

        {/* Desktop Close Button */}
        <Transition
          show={isOpen}
          as={Fragment}
          enter="duration-200"
          enterFrom="scale-110"
          enterTo="scale-100"
          leave="duration-75"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          {
            post !== null ? (
              <div className="w-full rounded-lg max-w-5xl hidden md:flex z-20
              dark:text-white max-h-[95vh]">
                <PostModalSwiper
                  photos={post?.photos || []}
                  likePostDoubleClick={likePostDoubleClick}
                />
                <div className="w-full md:max-w-[500px] md:min-w-[400px] rounded-r-lg
                bg-white dark:bg-dark1 flex flex-col relative">
                  <div className="px-5 py-4 justify-between border-b dark:border-gray-500">
                    <div className="flex items-center space-x-3">
                      <ProfilePicture
                        src={post?.photoURL}
                        uid={post?.uid}
                        hasStory={!allSeen(
                          usersWithStories?.find(user => user?.id === post?.uid)?.stories,
                          user?.uid
                        )}
                        seen={false}
                      />
                      <Link 
                        className="font-semibold"
                        to={`/profile/${post?.uid}`}
                      >
                        {post?.username}
                      </Link>
                    </div>
                  </div>
                  <div className="p-5 overflow-y-scroll absolute bottom-[167px] top-[81px]
                  post-comments w-full">
                    <div className="items-start space-x-3 hidden md:flex">
                      <ProfilePicture
                        src={post?.photoURL}
                        uid={post?.uid}
                        hasStory={hasStory(usersWithStories, post?.uid)}
                        seen={allSeen(
                          usersWithStories?.find(user => user?.id === post?.uid)?.stories,
                          user?.uid
                        )}
                      />
                      <div className="space-y-2">
                        <div>
                          <Link 
                            className="mr-3 font-semibold"
                            to={`/profile/${post?.uid}`}
                          >
                            {post?.username}
                          </Link>
                          <span className="text-gray-600 dark:text-gray-200">
                            {post?.caption}
                          </span>
                        </div>
                        <div className="flex space-x-3">
                          <span className="text-gray-400 text-sm">
                            {post?.dateCreated && 
                              shortenFormatDistance(
                                formatDistanceToNowStrict(post?.dateCreated)
                              ) 
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-6 my-12">
                      {
                        comments?.map(comment => (
                          <CommentModal 
                            key={comment?.id} 
                            comment={comment}
                            postId={post?.id}
                          />
                        ))
                      }
                    </div>
                  </div>
                  <div className="absolute bottom-0 inset-x-0 px-5 pt-4" style={{
                    height: '167px'
                  }}>
                    <div className="absolute -top-2 inset-x-0 h-2 bg-white dark:bg-dark1
                    border-b dark:border-gray-500"></div>
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex space-x-4">
                        <button
                          className={
                            likes?.includes(user?.uid) ? "fa-solid fa-heart text-2xl text-red-400 animate-like"
                            : "fa-regular fa-heart text-2xl"
                          }
                          onClick={likePost}
                        ></button>
                        <button 
                          className="fa-regular fa-comment text-2xl cursor-pointer"
                          onClick={() => {inputRef.current.focus()}}>
                        </button>
                      </div>
                    </div>
                    <div className="my-4 font-semibold">{likes?.length} likes</div>
                    <div className="-mx-5 border-b dark:border-gray-500"></div>
                    <div className="flex py-3 pt-4 my-auto">
                      <EmojiPicker comment={comment} setComment={setComment} />
                      <form 
                        onSubmit={addComment} 
                        className="flex-1 flex"
                      >
                        <input 
                          type="text"
                          value={comment}
                          onChange={(e) => setComment(e.target.value)} 
                          className="bg-transparent flex-1 outline-none text-base placeholder:text-base" 
                          placeholder="Add a comment..."
                          ref={inputRef}
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
              </div>
            ) : (
              <div className="w-full rounded-lg max-w-5xl hidden md:flex z-20
              dark:text-white max-h-[95vh]">
                <div className="w-full animated-bg rounded-l-lg">
                  <div className="relative pb-[150%] w-full flex items-center justify-center rounded-l-lg bg-contain bg-no-repeat bg-center post-modal-swiper"></div>
                </div>
                <div className="w-full md:max-w-[500px] md:min-w-[400px] rounded-r-lg
                bg-white dark:bg-dark1 flex flex-col relative">
                  <div className="px-5 py-4 justify-between border-b dark:border-gray-500">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full animated-bg"></div>
                      <div className="font-semibold w-36 animated-bg">
                        &nbsp;
                      </div>
                    </div>
                  </div>
                  <div className="p-5 overflow-y-scroll absolute bottom-[167px] top-[81px] flex justify-center items-center
                  post-comments w-full">
                    <i className="fa-solid fa-spinner text-4xl
                    text-gray-300 dark:text-gray-500
                    animate-spin">

                    </i>
                  </div>
                  <div className="absolute bottom-0 inset-x-0 px-5 pt-4" style={{
                    height: '167px'
                  }}>
                    <div className="absolute -top-2 inset-x-0 h-2 bg-white dark:bg-dark1
                    border-b dark:border-gray-500"></div>
                    <div className="animated-bg rounded text-2xl flex justify-between items-center mb-3">
                      &nbsp;
                    </div>
                    <div className="animated-bg rounded my-4 font-semibold">
                      &nbsp;
                    </div>
                    <div className="-mx-5 border-b dark:border-gray-500"></div>
                    <div className="flex py-3 pt-4 my-auto">
                      <div 
                        className="flex-1 flex animated-bg rounded"
                      >
                        &nbsp;
                      </div>
                    </div>
                  </div>
                </div>
                  </div>
            )
          }

        </Transition>
        {/* Mobile */}
        <Link
          className="fixed z-30 fa-solid fa-chevron-left top-[18px] leading-none left-6 cursor-pointer text-black dark:text-white text-2xl md:hidden"
          to={location?.state?.previousPath?.includes('stories') ? '/' : -1}
          state={{ previousPath: location?.state?.previousPath }}
        ></Link>
        <div className="fixed inset-0 min-h-screen z-10 md:hidden
        flex flex-col bg-white dark:bg-dark1 dark:text-white">
            <div className="px-5 py-4 flex justify-center bg-white dark:bg-dark1
            font-semibold text-lg border-b dark:border-gray-500">
              Post
            </div>
            <div className="overflow-y-scroll post-comments pb-20">
              <Post post={post} />
            </div>
        </div>
      </div>
  )

}
export default PostModal

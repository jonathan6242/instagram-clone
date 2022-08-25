import { useContext, useEffect, useState } from 'react';
import CommentModal from './CommentModal';
import ProfilePicture from './ProfilePicture';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { addDoc, collection, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import UserContext from '../context/UserContext';
import { formatDistanceToNowStrict } from 'date-fns';
import Profile from "../images/defaultprofile.jpg"
import Navbar from "./Navbar.jsx"
import StoriesContext from '../context/StoriesContext';
import { allSeen, hasStory } from '../services';


function PostModalMobile() {
  const { user } = useContext(UserContext);
  const [post, setPost] = useState(null);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const navigate = useNavigate();
  const { id, uid } = useParams();
  const [isOpen, setIsOpen] = useState(false)
  const { usersWithStories } = useContext(StoriesContext)
  const location = useLocation()

  useEffect(() => {
    async function getPost() {
      const docSnap = await getDoc(doc(db, "posts", id));
      setPost({...docSnap.data(), id: docSnap.id})
    }
    getPost();
  }, []);

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

  const addComment = async (e) => {
    e.preventDefault();
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
    <>
        <Navbar />
        <Link
          className="fixed z-30 fa-solid fa-chevron-left top-[18px] leading-none left-6 cursor-pointer text-black dark:text-white text-2xl"
          to={location?.state?.previousPath?.includes('stories') ? '/' : -1}
        ></Link>
        {
          post !== null ? (
            <div className="fixed inset-0 min-h-screen z-20
            flex flex-col bg-white dark:bg-dark2 dark:text-white">
                <div className="px-5 py-4 flex justify-center bg-white dark:bg-dark1
                font-semibold text-lg border-b dark:border-gray-500">Comments</div>
                <div className="px-5 py-4 space-x-4 flex items-center text-sm md:text-base
                bg-gray-100 dark:bg-dark2 border-b dark:border-gray-500">
                  <div className="p-1 w-12 h-12">
                    <div 
                      className="rounded-full w-full h-full
                      bg-cover bg-center bg-no-repeat"
                      style={{
                        backgroundImage: `url(${user?.photoURL || Profile})`
                      }}
                    ></div>
                  </div>
                  <form 
                    onSubmit={addComment}
                    className="relative flex items-center flex-1"
                  >
                    <input 
                      type="text"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)} 
                      className='px-5 py-3 rounded-full flex-1 outline-none
                      dark:bg-dark1' 
                      placeholder='Add a comment...'
                    />
                    <button className="absolute right-5 font-semibold text-softBlue">Post</button>
                  </form>
                </div>
                <div id="commentsDisplay" className="px-5 pt-4 pb-20 flex-1 overflow-y-scroll post-comments max-w-[100vw]">
                  <div className="flex items-start space-x-3 text-sm md:text-base">
                    <ProfilePicture
                      src={post?.photoURL}
                      uid={post?.uid}
                      hasStory={hasStory(usersWithStories, post?.uid)}
                      seen={allSeen(
                        usersWithStories?.find(user => user?.id === post?.uid)?.stories,
                        user?.uid
                      )}
                    />
                    <div className="space-y-4">
                      <div>
                        <span className="mr-3 font-semibold">{post?.username}</span>
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
                  <div className="border-t dark:border-gray-500 my-4"></div>
                  <div className='space-y-4' >
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
            </div>
          ) : (
            <div className="fixed inset-0 min-h-screen z-20
            flex flex-col bg-white dark:bg-dark2 dark:text-white">
                <div className="px-5 py-4 flex justify-center bg-white dark:bg-dark1
                font-semibold text-lg border-b dark:border-gray-500">Comments</div>
                <div className="px-5 py-4 space-x-4 flex items-center text-sm md:text-base
                bg-gray-100 dark:bg-dark2 border-b dark:border-gray-500">
                  <div className="animated-bg w-12 h-12 rounded-full p-1" />
                  <form 
                    className="relative flex items-center flex-1"
                  >
                    <input 
                      type="text"
                      value={''}
                      onChange={() => {}}
                      className='px-5 py-3 rounded-full flex-1 outline-none
                      dark:bg-dark1' 
                      placeholder='Add a comment...'
                    />
                    <div className="absolute right-5 font-semibold text-softBlue">Post</div>
                  </form>
                </div>
                <div id="commentsDisplay" className="px-5 pt-4 pb-20 flex-1 overflow-y-scroll post-comments">
                  <div className="flex items-start space-x-3 text-sm md:text-base">
                    <div className='animated-bg w-12 h-12 p-1 rounded-full'></div>
                    <div className="space-y-4">
                      <div className='animated-bg rounded w-32'>
                        &nbsp;
                      </div>
                      <div className="flex space-x-3">
                        <span className="animated-bg rounded w-16 text-gray-400 text-sm">
                          &nbsp;
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="border-t dark:border-gray-500 my-4"></div>
                  <div className='flex items-center justify-center'>
                    <i className="fa-solid fa-spinner text-4xl
                    text-gray-300 dark:text-gray-500
                    animate-spin">
    
                    </i>
                  </div>
                </div>
            </div>
          )
        }

    </>
  )
}
export default PostModalMobile
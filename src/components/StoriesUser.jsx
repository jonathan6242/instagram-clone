import { formatDistanceToNowStrict } from "date-fns";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useContext, useEffect, useRef, useState } from "react"
import { Link, useLocation, useNavigate, useParams } from "react-router-dom"
import UserContext from "../context/UserContext";
import { db } from "../firebase";
import { addUnique, shortenFormatDistance } from "../services";

function StoriesUser({ usersWithStories, location }) {
  const { uid } = useParams()
  const { user: loggedInUser } = useContext(UserContext)
  const [user, setUser] = useState();
  const [current, setCurrent] = useState(0)
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [holdEnd, setHoldEnd] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const navigate = useNavigate();
  const storiesRef = useRef();
  const userIndex = usersWithStories?.indexOf(user)
  const length = user?.stories?.length
 
  let interval = null;

  useEffect(() => {
    storiesRef.current.focus()
  }, [])

  useEffect(() => {
    setUser(usersWithStories?.find(user => user?.id === uid))
  }, [uid, usersWithStories])

  useEffect(() => {
    if(playing && !imageLoading) {
      interval = setInterval(() => {
        setTime(prev => prev + 10)
      }, 10)
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval)
  }, [playing, imageLoading])

  useEffect(() => {
    if(time >= 7000) {
      nextStory();
    }
  }, [time])

  // Image loading states
  useEffect(() => {
    setImageLoading(true);
  }, [current, uid])

  // Add logged in user's UID to 'seen' array when story is seen
  useEffect(() => {
    async function addUserToSeen() {
      if(!loggedInUser) return;
      const currentStory = user?.stories[current];
      if(!currentStory?.seenBy?.includes(loggedInUser?.uid)) {
        // Add user to seen if user is not already in seen
        await updateDoc(doc(db, "stories", user?.id), {
          stories: user?.stories?.map((story, index) => {
            if(index === current) {
              let newStory = story;
              newStory.seenBy = addUnique(story?.seenBy, loggedInUser?.uid)
              return newStory
            } else {
              return story;
            }
          })
        })
      }
    }
    if(user?.stories[current]) {
      addUserToSeen();
    }
  }, [user, current])

  const nextStory = () => {
    console.log('next story')
    if(current === length - 1) {
      nextUser()
      console.log('next user')
    }
    setPlaying(true);
    setTime(0)
    if(current < length - 1) {
      setCurrent((prev) => prev + 1)
    }
  }

  const previousStory = () => {
    if(current === 0) {
      previousUser()
    }
    setPlaying(true);
    setTime(0)
    if(current > 0) {
      setCurrent((prev) => prev - 1)
    }
  }

  const nextUser = () => {
    if(userIndex < usersWithStories.length - 1) {
      setCurrent(0)
      navigate(`/stories/${usersWithStories[userIndex + 1]?.id}`)
    } else {
      navigate('/')
      console.log(123)
    }
  }

  const previousUser = () => {
    if(userIndex > 0) {
      setCurrent(usersWithStories[userIndex - 1]?.stories?.length - 1)
      navigate(`/stories/${usersWithStories[userIndex - 1]?.id}`)
    }
  }

  class ClickAndHold {
    constructor(target, callback, callback2) {
      this.target = target;
      this.callback = callback;
      this.callback2 = callback2;
      this.isHeld = false;
      this.wasHeld = false;
      this.activeHoldTimeoutID = null;

      this.target.addEventListener("touchstart", this._onHoldStart.bind(this))
      this.target.addEventListener("touchend", this._onHoldEnd.bind(this))
      this.target.addEventListener("touchcancel", this._onHoldEnd.bind(this))
    }

    _onHoldStart() {
      setHoldEnd(false);
      this.isHeld = true;
      this.activeHoldTimeoutID = setTimeout(() => {
        if(this.isHeld) {
          this.wasHeld = true;
          this.callback();
        } else {
          this.wasHeld = false;
        }
      }, 250)
    }

    _onHoldEnd() {
      if(this.wasHeld) {
        setHoldEnd(true);
      } else {
        setHoldEnd(false);
      }
      this.isHeld = false;
      this.wasHeld = false;
      this.callback2();
      clearTimeout(this.activeHoldTimeoutID)
      
    }
  }

  useEffect(() => {
    new ClickAndHold(
      document.querySelector('.stories-container'), 
      () => setPlaying(false),
      () => setPlaying(true)
    )
  }, [])

  if(user?.stories?.length < 1) {
    return <></>
  }
  
  return (
    <div 
      className="stories-user relative flex justify-center overflow-hidden h-screen max-w-[100vw] md:py-8 bg-dark2"
      onKeyUp={(e) => {
        if(e.key === 'ArrowRight') {
          nextStory();
        }
        if(e.key === 'ArrowLeft') {
          previousStory();
        }
        if(e.key === ' ') {
          setPlaying(!playing)
        }
      }}
      tabIndex={0}
      ref={storiesRef}
    >
      <div className="group stories-container w-full flex justify-center select-none">
        <div className="relative h-full w-full flex 
        md:w-auto md:aspect-[0.56] md:mx-16
        bg-gradient-to-b from-gray-400 to-gray-600">
          <div className="overflow-hidden h-full w-full flex justify-center items-center">
            <div className="absolute top-0 inset-x-0 px-4 pt-5 pb-8 flex flex-col space-y-3">
              <div className="space-x-1 flex">
                {
                  new Array(length).fill(0).map((_, index) => (
                    <div 
                      className="flex-1 flex h-[2px] bg-white/30"
                      key={index}
                    >
                      <div className={index === current ? 'bg-white' : ''}
                      style={{
                        width: `${100 * (time / 7000)}%`
                      }}></div>
                    </div>
                  ))
                }
              </div>
              <div className="flex justify-between items-center pr-4">
                <div className="flex items-center">
                  <Link
                    to={`/profile/${uid}`}
                    className="block w-8 h-8 rounded-full bg-cover bg-center bg-no-repeat"
                    style={{
                      backgroundImage: `url(${user?.photoURL})`
                    }}>

                  </Link>
                  <div className="text-white ml-2">
                    {user?.username}
                  </div>
                  <div className="text-gray-300 text-sm ml-3">
                    {
                      user?.stories[current]?.dateCreated
                      && shortenFormatDistance(
                        formatDistanceToNowStrict(user?.stories[current]?.dateCreated)
                      )
                    }
                  </div>
                </div>
                <div 
                  className="text-white text-xl hidden md:flex cursor-pointer"
                  onClick={() => setPlaying(!playing)}
                >
                  {
                    playing ? <i className="fa-solid fa-pause"></i>
                    : <i className="fa-solid fa-play"></i>
                  }
                </div>
              </div>
            </div>
            <img 
              src={user?.stories[current]?.photo} 
              alt="" 
              className={`select-none object-contain ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
              onLoad={() => setImageLoading(false)}
            />
            {
              imageLoading &&

              <img 
                src="https://c.tenor.com/I6kN-6X7nhAAAAAj/loading-buffering.gif"
                className="w-12 h-12 absolute top-1/2 left-1/2 -translate-y-6 -translate-x-6"
              />
              
          
            }
          </div>
          {/* Previous Story */}
          {
             (!(userIndex === 0 && current === 0)) && (
              <i 
                className="stories-button w-1/4 left-0
                fa-solid fa-chevron-circle-left md:-left-16"
                onClick={() => {
                  if(!holdEnd) {
                    previousStory();
                  }
                }}
              ></i>
            )
          }
          {/* Next Story - Above 768px */}
          {
            (!(userIndex === usersWithStories?.length - 1 && current === length - 1)) && (
              <i 
                className="stories-button hidden md:block w-3/4 right-0
                fa-solid fa-chevron-circle-right md:-right-16"
                onClick={
                  () => {
                    if(!holdEnd) {
                      nextStory();
                    }
                  }
                }
              ></i>
            )
          }
          {/* Next Story - Below 768px */}
          <i 
            className="stories-button w-3/4 right-0
            fa-solid fa-chevron-circle-right md:hidden"
            onClick={
              () => {
                if(!holdEnd) {
                  nextStory();
                }
              }
            }
          ></i>
        </div>
      </div>
      <Link 
        to={ location?.state?.previousPath || '/' }
        state={{ previousPath: location.pathname }}
        className="fa-solid fa-times text-white text-4xl
        absolute top-8 right-8 z-20 cursor-pointer"> 
      </Link>
    </div>
  ) 
}
export default StoriesUser
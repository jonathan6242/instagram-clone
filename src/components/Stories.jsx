import { Navigation, A11y, FreeMode } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import "swiper/css/free-mode";
import 'swiper/css/navigation';
import Story from './Story';
import { useContext, useEffect, useState } from 'react';
import { arrayRemove, collection, doc, getDocs, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import UserContext from '../context/UserContext';
import { Link } from 'react-router-dom';
import { allSeen } from '../services';
import StoriesContext from '../context/StoriesContext';
import Profile from "../images/defaultprofile.jpg"

function Stories() {
  const { usersWithStories, setUsersWithStories } = useContext(StoriesContext);
  const { user: loggedInUser } = useContext(UserContext)
  // const storyAge = 86400000

  // Filter stories more than a day old (Firestore)
  // async function filterStories(users) {
  //   for(let user of users) {
  //     for(let story of user?.stories) {
  //       if(Date.now() - story.dateCreated > storyAge) {
  //         await updateDoc(doc(db, "stories", user?.id), {
  //           stories: arrayRemove(story)
  //         })
  //       }
  //     }
  //   }
  // }

  // Get stories on mount and store in state
  useEffect(() => {
    async function getStories() {
      const data = await getDocs(
        collection(db, "stories")
      )
      // Filter stories on mount
      let users = data.docs.map(doc => ({...doc.data(), id: doc.id}));
      // Filter stories in Firestore
      // await filterStories(users)
      // Filter stories in state
      // for(let user of users) {
      //   for(let story of user?.stories) {
      //     if(Date.now() - story?.dateCreated > storyAge) {
      //       user.stories = user.stories.filter(item => item !== story)
      //     }
      //   }
      // }
      // Filter out users with no stories
      users = users.filter(user => user?.stories?.length > 0)
      setUsersWithStories(users)
    }
    getStories()
  }, [])

  // if(usersWithStories?.length === 0) {
  //   return <></>
  // }

  return (
    <Swiper
    // install Swiper modules
    modules={[Navigation, A11y, FreeMode]}
    spaceBetween={16}
    slidesPerView={4}
    slidesPerGroup={3}
    freeMode={true}
    className="h-32 bg-white dark:bg-dark1 w-full flex items-center shadow-lg stories"
    navigation
  >
    {
      usersWithStories === null && new Array(4).fill(0).map((_, index) => (
        <SwiperSlide key={index}>
          <div className='w-[60px] h-[60px] rounded-full animated-bg'></div>
        </SwiperSlide>
      ))
    }
    {
      usersWithStories &&
      <>
            <SwiperSlide>
              <Link to='/createstory'>
                <div className='w-32 flex flex-col items-center'>
                  <div className="w-[60px] h-[60px] rounded-full relative cursor-pointer">
                    <div
                      className="w-story h-story rounded-full bg-cover bg-center bg-no-repeat
                      centered ring-2 ring-white dark:ring-dark1"
                      style={{
                        backgroundImage: `url(${loggedInUser?.photoURL || Profile})`
                      }}
                    ></div>
                    <div className="absolute bottom-1 right-1 fa-solid fa-circle-plus text-softBlue bg-white rounded-full"></div>
                  </div>
                  <span className='mt-2 tracking-normal w-full line-clamp-1 text-sm text-center'>
                    Your story
                  </span>
                </div>
              </Link>
            </SwiperSlide>
        {
          usersWithStories && usersWithStories
            .map(user => (
              <SwiperSlide key={user?.id}>
                <Story user={user} seen={allSeen(user?.stories, loggedInUser?.uid)} />
              </SwiperSlide>
            ))
        }
      </>
    }
    </Swiper>
  )
}
export default Stories
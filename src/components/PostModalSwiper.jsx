import { Navigation, Pagination, Scrollbar, A11y } from 'swiper';

import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import { useEffect } from 'react';

function PostModalSwiper({ swiperRef = null , photos, likePostDoubleClick }) {
  useEffect(() => {
    const next = document.querySelectorAll('.swiper-button-next')
    const prev = document.querySelectorAll('.swiper-button-prev')
    for(let button of next) {
      button.innerHTML = `<i class="fa-solid fa-chevron-right"></i>`
    }
    for(let button of prev) {
      button.innerHTML = `<i class="fa-solid fa-chevron-left"></i>`
    }
  }, [])

  return (
    <Swiper
      // install Swiper modules
      modules={[Navigation, Pagination, Scrollbar, A11y]}
      navigation
      pagination={{ clickable: true }}
      className="w-full relative flex items-center justify-center"
      onDoubleClick={likePostDoubleClick}
    >
      <div id="heart" className="absolute fa-solid fa-heart text-white z-10
      top-1/2 -mt-16 text-8xl opacity-90 scale-0"></div>
      {
        photos.length > 0 && photos.map((photo, index) => (
          <SwiperSlide key={index} className='w-full'>
            <div 
              className="relative pb-[150%] w-full flex items-center justify-center bg-black bg-cover bg-no-repeat bg-center post-modal-swiper"
              style={{
                backgroundImage: `url(${photo})`
              }}
              ref={swiperRef}
            >
            </div>
          </SwiperSlide>
        ))
      }
    </Swiper>
  )
}
export default PostModalSwiper

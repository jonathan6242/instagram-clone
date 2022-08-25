import { useEffect, useState } from "react"
import { Link } from "react-router-dom";
import Face from "../images/face.jpg"

function Story({ user, seen }) {
  const [img, setImg] = useState();

  useEffect(() => {
    const image = new Image();
    image.src = user.photoURL
    image.onload = () => {
      setImg(image)
    }
  }, [])

  return (
    <Link to={`/stories/${user?.id}`}>
      {
        img ? (
          <div className={`w-[60px] h-[60px] rounded-full relative cursor-pointer duration-200
          ${!seen ? 'bg-gradient-to-b from-pink-500 to-amber-400' 
          : 'bg-gray-300 dark:bg-gray-400'}`}>
            <div
              className={`w-story h-story rounded-full bg-cover bg-center bg-no-repeat
              centered ${!seen ? 'ring-2' : 'ring-[2.5px]'} ring-white dark:ring-dark1`}
              style={{
                backgroundImage: `url(${img.src})`
              }}
            ></div>
          </div>
        ) : (
          <div className='w-[60px] h-[60px] rounded-full animated-bg'></div>
        )
      }
      <span className='mt-2 tracking-normal w-[60px] break-words text-sm text-center line-clamp-1'>
        {user?.username}
      </span>
    </Link>
  )
}
export default Story
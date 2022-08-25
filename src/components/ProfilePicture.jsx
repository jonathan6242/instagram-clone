import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom"

function ProfilePicture(
    { 
      src,
      hasStory,
      seen,
      ring = 'ring-white dark:ring-dark1',
      to,
      uid,
      large,
      close
    }
  ) 
{
  const location = useLocation();
  const [img, setImg] = useState();

  useEffect(() => {
    const image = new Image();
    image.src = src;
    image.onload = () => {
      setImg(image)
    }
  }, [])


  return (
    <>
      {
        img ? (
          <Link
            to={`${hasStory ? `/stories/${uid}` : `/profile/${uid}`}`}
            state={{ previousPath: location.pathname }}
            className="flex-shrink-0"
            onClick={close}
          >
            <div className={`${large ? 'w-20 h-20 md:w-40 md:h-40' : 'w-12 h-12'} 
            rounded-full relative cursor-pointer duration-200 flex-shrink-0 flex
            ${hasStory ? (!seen ? 'bg-gradient-to-b from-pink-500 to-amber-400' 
            : 'bg-gray-300 dark:bg-gray-400') : 'bg-none'}`}>
              <div
                className={`absolute 
                ${large ? 'inset-[6px] md:inset-2' : 'inset-1'}
                rounded-full bg-cover bg-center bg-no-repeat
                ${!large ? (!seen ? 'ring-2' : 'ring-[2.5px]')
                  : (!seen ? 'ring-[3px] md:ring-4' : 'ring-4 md:ring-[5px]')}
                ${ring ? ring : 'ring-transparent'}`}
                style={{
                  backgroundImage: `url(${src})`
                }}
              ></div>
            </div>
          </Link>
        ) : (
          <div className={`${large ? 'w-20 h-20 md:w-40 md:h-40' : 'w-12 h-12'}
          animated-bg rounded-full flex-shrink-0`}></div>
        )
      }

    </>
  )
}
export default ProfilePicture
import { addDoc, arrayUnion, collection, doc, setDoc, updateDoc } from "firebase/firestore";
import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CreatePostSwiper from "../components/CreatePostSwiper";
import Navbar from "../components/Navbar"
import { db, storage } from "../firebase";
import { v4 as uuidv4 } from 'uuid'
import useAuthUser from "../hooks/useAuthUser";
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import { isUserInStories } from "../services";
import { toast } from "react-toastify"

function CreateStory() {
  const { user } = useAuthUser();
  const [loading, setLoading] = useState(false);
  const [photo, setPhoto] = useState(null);
  const fileInputRef = useRef()
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      if(!photo) {
        document.getElementById('general').innerHTML = 'Must upload a photo.'
        setLoading(false);
        return;
      } else {
        document.getElementById('general').innerHTML = ''
      }

      async function storePhoto(photo) {
        return new Promise((resolve, reject) => {
          const fileName = `${user?.uid}-${uuidv4()}`;
          const photoRef = ref(storage, `photos/${fileName}`)
          
          try {
            uploadString(photoRef, photo, "data_url")
              .then(() => {
                getDownloadURL(photoRef)
                  .then((downloadURL) => {
                    resolve(downloadURL)
                  })
              })
          } catch (error) {
            reject(error)
          }
        })
      }

      // Upload photos to storage
      const photoURL = await storePhoto(photo)

      // Check if user is in stories collection
      const userInStories = await isUserInStories(user?.uid)

      if(!userInStories) {
        // Add user to stories and add data to user's story
        await setDoc(doc(db, "stories", user?.uid), {
          photoURL: user?.photoURL,
          username: user?.displayName,
          stories: [
            {
              dateCreated: Date.now(),
              photo: photoURL,
              seenBy: []
            }
          ]
        })
      } else {
        await updateDoc(doc(db, "stories", user?.uid), {
          stories: arrayUnion({
            dateCreated: Date.now(),
            photo: photoURL,
            seenBy: []
          })
        })
      }

      setLoading(false);
      setPhoto(null);
      navigate('/')
      toast.success('Successfully created story.')
    } catch (error) {
      document.getElementById('general').innerHTML = error.message
      setLoading(false);
      toast.success('Could not create story.')
    }

  }

  const addPhotos = async (e) => {
    const file = await readFile(e.target.files[0])
    setPhoto(file);
  }

  function readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (readerEvent) => {
        resolve(readerEvent.target.result);
      }
    })
  }

  return (
    <div className="flex flex-col min-h-screen">
    <Navbar />
    <i
      className="fixed z-30 fa-solid fa-chevron-left top-[18px] leading-none left-6 cursor-pointer text-black dark:text-white text-2xl md:hidden"
      onClick={() => navigate(-1)}
    />
    <div className="fixed inset-x-0 px-5 py-4 flex justify-center bg-white dark:bg-dark1
        font-semibold text-lg border-b dark:border-gray-500 md:hidden">
      Create Story
    </div>
    <div className="flex-1 flex items-start justify-center my-20">
      <div className="container max-w-md mx-auto px-6">
        <div className="space-y-3">
          <div className="flex flex-col md:bg-white dark:md:bg-dark1 md:p-10 md:border-2 
          rounded dark:border-gray-500">
            <Link to='/'>
              <div className="text-center text-2xl font-semibold mb-8">
                Create Story
              </div>
            </Link>
            <form onSubmit={onSubmit}>
              <div className="flex flex-col text-sm text-black">   
                <button
                  type="button"
                  className="flex items-center justify-center w-full h-9 px-4 bg-softBlue text-white text-sm font-semibold rounded "
                  onClick={() => fileInputRef.current.click()}
                >
                  Upload photo
                </button>
                <input
                  type="file"
                  accept='.jpg,.png,.jpeg'
                  onChange={addPhotos}
                  className="hidden"
                  ref={fileInputRef}
                />
              </div>
              {
                photo && (
                  <CreatePostSwiper photos={[photo]} />
                )
              }
              <button className={`relative flex items-center justify-center w-full h-9 px-4 mt-5 bg-softBlue text-white text-sm font-semibold rounded ${loading ? 'bg-opacity-50' : ''}`} 
              style={{pointerEvents: loading ? 'none' : 'auto'}}>
                {
                  !loading ? 'Share' 
                  : <i className="animate-spin fa-solid fa-spinner text-xl"></i>
                }
              </button>
            </form>
            {/* General Error Message */}
            <div id="general" className="font-semibold text-sm text-center mt-4 text-red-400"></div>
          </div>
        </div>
      </div>

    </div>
  </div>
  )
}
export default CreateStory
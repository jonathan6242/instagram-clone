import { addDoc, collection } from "firebase/firestore";
import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CreatePostSwiper from "../components/CreatePostSwiper";
import Navbar from "../components/Navbar"
import { db, storage } from "../firebase";
import { v4 as uuidv4 } from 'uuid'
import useAuthUser from "../hooks/useAuthUser";
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import { toast } from "react-toastify"

function CreatePost() {
  const { user } = useAuthUser();
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState([]);
  const fileInputRef = useRef()
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      if(photos.length === 0) {
        document.getElementById('general').innerHTML = 'Must upload at least one photo.'
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
      const photoURLs = await Promise.all(
        photos.map(photo => storePhoto(photo))
      )

      await addDoc(collection(db, "posts"), {
        caption,
        dateCreated: Date.now(),
        likes: [],
        photos: photoURLs,
        uid: user?.uid,
        photoURL: user?.photoURL,
        username: user?.displayName
      })
      setLoading(false);
      setCaption('');
      setPhotos([]);
      navigate('/')
      toast.success('Successfully created post.')
    } catch (error) {
      document.getElementById('general').innerHTML = error.message
      setLoading(false);
      toast.error('Could not create post.')
    }

  }

  const addPhotos = async (e) => {
    const files = await Promise.all(Array.from(e.target.files).map(
      file => readFile(file)
    ))
    setPhotos(files);
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
      Create Post
    </div>
    <div className="flex-1 flex items-start justify-center my-20">
      <div className="container max-w-md mx-auto px-6">
        <div className="space-y-3">
          <div className="flex flex-col md:bg-white dark:md:bg-dark1 md:p-10 md:border-2 
         dark:border-gray-500">
            <Link to='/'>
              <div className="text-center text-2xl font-semibold mb-8">
                Create Post
              </div>
            </Link>
            <form onSubmit={onSubmit}>
              <div className="space-y-4 flex flex-col text-sm text-black">
                <textarea
                  className="bg-gray-50 p-2 px-3 outline-none border focus:border-gray-400"
                  type="text" 
                  placeholder="Caption"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  id="caption"
                />      
                <button
                  type="button"
                  className="flex items-center justify-center w-full h-9 px-4 mt-5 bg-softBlue text-white text-sm font-semibold"
                  onClick={() => fileInputRef.current.click()}
                >
                  Upload photos
                </button>
                <input
                  type="file"
                  accept='.jpg,.png,.jpeg'
                  multiple
                  max='10'
                  onChange={addPhotos}
                  className="hidden"
                  ref={fileInputRef}
                />
              </div>
              <CreatePostSwiper photos={photos} />
              <button className={`relative flex items-center justify-center w-full h-9 px-4 mt-5 bg-softBlue text-white text-sm font-semibold ${loading ? 'bg-opacity-50' : ''}`} 
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
export default CreatePost
import { updateEmail, updateProfile } from "firebase/auth";
import { collection, collectionGroup, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import { useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Message from "../components/Message";
import Navbar from "../components/Navbar";
import UserContext from "../context/UserContext";
import { db, storage } from "../firebase";
import useFirestoreUser from "../hooks/useFirestoreUser";
import { handleFirebaseError, validateEmail, validateRequired, validateUsername } from "../services";
import { toast } from "react-toastify"

function EditProfile() {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [profilePicture, setProfilePicture] = useState();
  const [loading, setLoading] = useState(true)
  const fileInputRef = useRef()
  const { firestoreUser } = useFirestoreUser();
  const { user } = useContext(UserContext)
  const navigate = useNavigate();
  

  useEffect(() => {
    if(firestoreUser?.uid) {
      setLoading(false)
      setFullName(firestoreUser?.fullName);
      setUsername(firestoreUser?.username);
      setEmail(firestoreUser?.email);
    }
  }, [firestoreUser?.uid])

  const onSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true);

      if(!validateRequired(['email', 'fullName', 'username'])) {
        validateEmail('email');
        await validateUsername('username', true)
      }
  
      const profileRef = ref(storage, `profiles/${user.uid}`)
  
      let downloadURL;
      // Upload profile picture (Storage)
      if(profilePicture) {
        // Use file as profile picture if file is selected
        await uploadString(profileRef, profilePicture, "data_url")
        downloadURL = await getDownloadURL(profileRef);
      } else {
        // Default profile picture if no file is selected
        downloadURL = firestoreUser?.photoURL
      }
  
      // Update displayName to username
      await updateProfile(user, {displayName: username, photoURL: downloadURL})
      
      // Update email
      await updateEmail(user, email)
      
      // Update firestore user
      await updateDoc(doc(db, "users", user.uid), {
        fullName,
        username,
        email,
        photoURL: downloadURL
      });

      // Update user's posts
      const postsByUserData = await getDocs(
        query(
          collection(db, "posts"),
          where("uid", "==", user?.uid)
        )
      )
      const postsByUser = postsByUserData.docs.map(doc => ({...doc.data(), id: doc.id}))
      await Promise.all(
        postsByUser.map(
          post => updateDoc(doc(db, "posts", post?.id), {
            photoURL: downloadURL,
            username
          })
        )
      )

      // Update user's comments
      const commentsByUserData = await getDocs(
        query(
          collectionGroup(db, 'comments'),
          where('uid', '==', user?.uid)
        )
      )
      const commentsByUser = commentsByUserData.docs.map(doc => ({...doc.data(), id: doc.id}))
      await Promise.all(
        commentsByUser.map(
          comment => updateDoc(doc(db, "posts", comment?.postId, "comments", comment?.id), {
            photoURL: downloadURL,
            username
          })
        )
      )

      // Update user's stories
      try {
        await updateDoc(
          doc(db, "stories", user?.uid), {
            photoURL: downloadURL,
            username
          }
        )
      } catch (error) {
        
      }

  
      navigate('/')
      setLoading(false);
      toast.success('Successfully updated profile.')
    } catch (error) {
      handleFirebaseError(error)
      setLoading(false);
      toast.error('Could not update profile.')
    }

  }

  const addProfilePicture = (e) => {
    const reader = new FileReader();
    if(e.target.files[0]) {
      reader.readAsDataURL(e.target.files[0]);
    }
    reader.onload = (readerEvent) => {
      setProfilePicture(readerEvent.target.result);
    }
  };

  return (
    // Global Container
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <i
        className="fixed z-30 fa-solid fa-chevron-left top-[18px] leading-none left-6 cursor-pointer text-black dark:text-white text-2xl md:hidden"
        onClick={() => navigate(-1)}
      />
      <div className="fixed inset-x-0 px-5 py-4 flex justify-center bg-white dark:bg-dark1
          font-semibold text-lg border-b dark:border-gray-500 md:hidden">
        Update Profile
      </div>
      <div className="flex-1 flex items-start justify-center mt-20">
        <div className="container max-w-md mx-auto px-6">
          <div className="space-y-3">
            <div className="flex flex-col md:bg-white dark:md:bg-dark1 md:p-10 md:border-2 dark:border-gray-500">
              <Link to='/'>
                <div className="text-center text-2xl font-semibold mb-8">
                  Update Profile
                </div>
              </Link>
              <form onSubmit={onSubmit}>
                <div className="space-y-8 flex flex-col text-sm text-black">
                  <div className="relative">
                    <input
                      className="bg-gray-50 p-2 px-3 outline-none border focus:border-gray-400 w-full"
                      type="text" 
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      id="email"
                    />
                    <Message />
                  </div>
                  <div className="relative">
                    <input
                      className="bg-gray-50 p-2 px-3 outline-none border focus:border-gray-400 w-full"
                      type="text" 
                      placeholder="Full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      id="fullName"
                    />
                    <Message />
                  </div>
                  <div className="relative">
                    <input
                      className="bg-gray-50 p-2 px-3 outline-none border focus:border-gray-400 w-full"
                      type="text" 
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      id="username"
                    />
                    <Message />
                  </div>
                  <div 
                    className="font-semibold text-softBlue cursor-pointer pt-2 text-center"
                    onClick={() => fileInputRef.current.click()}
                  >
                    Add profile picture
                  </div>
                  <input
                    type="file"
                    accept='.jpg,.png,.jpeg'
                    onChange={addProfilePicture}
                    className="hidden"
                    ref={fileInputRef}
                  />
                </div>
                {
                  profilePicture && (
                    <div className="relative p-6">
                      <img
                        className="mt-5 w-32 h-32 rounded-full object-cover mx-auto shadow-md"
                        src={profilePicture}
                        alt="" 
                      />
                      <button
                        type="button"
                        className="absolute flex items-center justify-center top-4 right-4
                        w-6 h-6 bg-black rounded-full text-center dark:bg-white
                        hover:opacity-80 duration-200"
                        onClick={() => setProfilePicture('')}
                      >
                        <i className="text-white dark:text-black fa-solid fa-times"></i>
                      </button>
                    </div>
                  )
                }
                <button className={`relative flex items-center justify-center w-full h-9 px-4 mt-5 bg-softBlue text-white text-sm font-semibold ${loading ? 'bg-opacity-50' : ''}`} 
                style={{pointerEvents: loading ? 'none' : 'auto'}}>
                  {
                    !loading ? 'Update profile' 
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
export default EditProfile
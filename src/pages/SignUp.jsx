import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Divider from "../components/Divider";
import Google from "../components/Google";
import Facebook from "../components/Google";
import Message from "../components/Message";
import { auth, db, storage } from "../firebase";
import Profile from "../images/defaultprofile.jpg"
import { handleFirebaseError, validateEmail, validatePassword, validateRequired, validateUsername } from "../services";

function SignUp() {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profilePicture, setProfilePicture] = useState();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate();
  const fileInputRef = useRef()

  const onSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true);

      if(!validateRequired(['email', 'fullName', 'username', 'password'])) {
        validateEmail('email');
        validatePassword('password', 6, 15)
        await validateUsername('username')
      }

      // Create user (Authentication)
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
  
      const profileRef = ref(storage, `profiles/${user.uid}`)
  
      let downloadURL;
      // Upload profile picture (Storage)
      if(profilePicture) {
        // Use file as profile picture if file is selected
        await uploadString(profileRef, profilePicture, "data_url")
        downloadURL = await getDownloadURL(profileRef);
      } else {
        // Default profile picture if no file is selected
        downloadURL = Profile
      }
  
      // Update displayName to username
      await updateProfile(user, {displayName: username, photoURL: downloadURL})
  
      // Create user (Firestore)
      const userObj = {
        fullName,
        username,
        uid: user.uid,
        following: [],
        followers: [],
        email,
        photoURL: downloadURL
      }
  
      await setDoc(doc(db, "users", user.uid), userObj);
  
      navigate('/')
      setLoading(false);
    } catch (error) {
      handleFirebaseError(error)
      setLoading(false);
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
    <div className="flex items-center justify-center min-h-screen">
      <div className="container max-w-md mx-auto px-6">
        <div className="space-y-3">
          <div className="flex flex-col md:bg-white dark:md:bg-dark1 md:p-10 md:border-2 
          dark:border-gray-500">
            <Link to='/'>
              <div className="text-center text-4xl font-semibold mb-8">Insta.</div>
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
                <div className="relative flex items-center">
                  <input
                    className="bg-gray-50 p-2 px-3 outline-none border focus:border-gray-400 w-full"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    id="password"
                  />
                  {
                    password.length > 0 && (
                      <button
                        type="button"
                        className="absolute right-3 font-semibold"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    )
                  }
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
                  !loading ? 'Sign up' 
                  : <i className="animate-spin fa-solid fa-spinner text-xl"></i>
                }
              </button>
            </form>
            <Divider />
            <Google />
            {/* General Error Message */}
            <div id="general" className="font-semibold text-sm text-center mt-4 text-red-400"></div>
          </div>
          <div className="md:bg-white dark:md:bg-dark1 py-6 md:border-2 text-center text-sm dark:border-gray-500">
            Have an account? <Link className="text-softBlue font-semibold" to='/login'>Log in</Link>
          </div>
        </div>
      </div>

    </div>
  )


}




export default SignUp
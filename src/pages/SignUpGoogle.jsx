import { updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import { useContext, useEffect, useState } from "react"
import { Link, Navigate, useNavigate } from "react-router-dom"
import Message from "../components/Message";
import UserContext from "../context/UserContext"
import { auth, db, storage } from "../firebase";
import { validateEmail, validatePassword, validateRequired, validateUsername } from "../services";
import { toast } from "react-toastify"

function SignUpGoogle() {
  const { googleUser } = useContext(UserContext)
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate();
  
  useEffect(() => {
    setFullName(googleUser?.displayName)
    setEmail(googleUser?.email)
    setProfilePicture(googleUser?.photoURL)
  }, [])

  const onSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true);

      if(!validateRequired(['fullName', 'username', 'password'])) {
        validatePassword('password', 6, 15)
        await validateUsername('username')
      }

      // Create user (Authentication)
      const user = auth.currentUser;

      // Update displayName to username
      await updateProfile(user, {displayName: username})
  
      // Create user (Firestore)
      const userObj = {
        fullName,
        username,
        uid: user.uid,
        following: [],
        followers: [],
        email,
        photoURL: profilePicture
      }
  
      await setDoc(doc(db, "users", user.uid), userObj);
  
      navigate('/')
      toast.success('Successfully signed up.')
      setLoading(false);
    } catch (error) {
      toast.error('Could not sign up.')
      setLoading(false);
    }
  }

  if(!googleUser) {
    return <Navigate to='/signup' />
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="container max-w-md mx-auto px-6">
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
            </div>
            <button className={`relative flex items-center justify-center w-full h-9 px-4 mt-5 bg-softBlue text-white text-sm font-semibold ${loading ? 'bg-opacity-50' : ''}`} 
            style={{pointerEvents: loading ? 'none' : 'auto'}}>
              {
                !loading ? 'Sign up' 
                : <i className="animate-spin fa-solid fa-spinner text-xl"></i>
              }
            </button>
          </form>
        </div>
      </div>

    </div>
  )
}
export default SignUpGoogle
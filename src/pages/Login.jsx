import { signInWithEmailAndPassword } from "firebase/auth";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Divider from "../components/Divider";
import Google from "../components/Google";
import Facebook from "../components/Google";
import Message from "../components/Message";
import { auth } from "../firebase";
import { handleFirebaseError, validateEmail, validatePassword, showError, showSuccess, validateRequired } 
from "../services";
import { toast } from "react-toastify"

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);

      if(!validateRequired(['email', 'password'])) {
        validateEmail('email');
        validatePassword('password', 6, 15)
      }

      await signInWithEmailAndPassword(auth, email, password);
     
      navigate('/');
      toast.success('Successfully logged in.')
      setLoading(false);
    } catch (error) {
      toast.error('Could not log in.')
      handleFirebaseError(error)
      setLoading(false);
    }

  }


  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="container max-w-md mx-auto px-6">
        <div className="space-y-3">
          <div className="flex flex-col md:bg-white dark:md:bg-dark1 md:p-10 md:border-2 
          rounded dark:border-gray-500">
            <Link to='/'>
              <div className="text-center text-4xl font-semibold mb-8">Insta.</div>
            </Link>
            <form onSubmit={onSubmit}>
              <div className="space-y-8 flex flex-col text-sm text-black">
                <div className="relative">
                  <input
                    className="bg-gray-50 p-2 px-3 outline-none rounded border focus:border-gray-400 w-full"
                    type="text" 
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    id="email"
                  />
                  <Message />
                </div>
                <div className="relative flex items-center">
                  <input
                    className="bg-gray-50 p-2 px-3 outline-none rounded border focus:border-gray-400 w-full"
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
              <button className={`relative flex items-center justify-center w-full h-9 px-4 mt-10 bg-softBlue text-white text-sm font-semibold rounded ${loading ? 'bg-opacity-50' : ''}`} 
              style={{pointerEvents: loading ? 'none' : 'auto'}}>
                {
                  !loading ? 'Log In' 
                  : <i className="animate-spin fa-solid fa-spinner text-xl"></i>
                }
              </button>
              <Link to='/forgotpassword' className="block text-sm font-semibold text-softBlue cursor-pointer mt-5 text-center">
                Forgot password?
              </Link>
            </form>
            <Divider />
            <Google />
            {/* General Error Message */}
            <div id="general" className="font-semibold text-sm text-center mt-4 text-red-400"></div>
          </div>
          <div className="md:bg-white dark:md:bg-dark1 py-6 md:border-2 rounded text-center text-sm dark:border-gray-500">
            Don't have an account? <Link className="text-softBlue font-semibold" to='/signup'>Sign up</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
export default Login
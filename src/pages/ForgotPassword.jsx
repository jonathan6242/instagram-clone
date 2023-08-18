import { sendPasswordResetEmail } from "firebase/auth";
import { useState } from "react";
import { Link } from "react-router-dom";
import { auth } from "../firebase";

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email)
      setStatus('success')
    } catch (error) {
      setStatus('error')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="container max-w-md mx-auto px-6">
        <div className="flex flex-col md:bg-white dark:md:bg-dark1 md:p-10 md:border-2 
        dark:border-gray-500 text-center">
          <div className="text-xl font-semibold mb-2">Forgot your password?</div>
          <p className="text-sm mb-8 text-gray-400">
            Enter your email address and we'll send you a link to get back into your account.
          </p>
          <form onSubmit={onSubmit}>
            <div className="space-y-4 flex flex-col text-sm text-black">
              <div className="relative">
                <input
                  className={`bg-gray-50 p-2 px-3 outline-none border focus:border-gray-400 w-full
                  ${status === 'success' ? 'border-green-400 focus:border-green-400' 
                  : status === 'error' ? 'border-red-400 focus:border-red-400'
                  : ''}`}
                  type="text" 
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {
                  status && <div className={`absolute -bottom-6
                  ${status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                    {status === 'success' ? 'Email was sent' : 'Could not send email'}
                  </div>
                }
              </div>
         
            </div>
            <button className={`relative flex items-center justify-center w-full h-9 px-4 mt-10 bg-softBlue text-white text-sm font-semibold ${loading ? 'bg-opacity-50' : ''}`} 
            style={{pointerEvents: loading ? 'none' : 'auto'}}>
              {
                !loading ? 'Reset my password' 
                : <i className="animate-spin fa-solid fa-spinner text-xl"></i>
              }
            </button>
            <Link to='/login' className="block text-sm font-semibold text-softBlue cursor-pointer mt-5 text-center">
              Back to Login
            </Link>
          </form>
        </div>
      </div>
  </div>
  )
}
export default ForgotPassword
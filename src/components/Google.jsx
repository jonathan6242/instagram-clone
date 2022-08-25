import { FacebookAuthProvider, GoogleAuthProvider, signInWithPopup, updateProfile } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import UserContext from "../context/UserContext";
import { auth, db } from "../firebase";
import GoogleLogo from "../images/google.png"
import { toast } from "react-toastify"

function Google() {
  const { setGoogleUser } = useContext(UserContext)
  const navigate = useNavigate();

  const onClick = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const { user } = await signInWithPopup(auth, provider)
      
      const docSnap = await getDoc(doc(db, "users", user.uid))
      const firestoreUser = docSnap.data();
  
      setGoogleUser(user)
     
      if(!firestoreUser) {
        navigate('/signupgoogle')
      } else {
        navigate('/')
        toast.success('Successfully logged in.')
      }
    } catch (error) {
      toast.error('Could not log in.')
    }

  }

  return (
    <button 
      className="flex items-center justify-center space-x-2 py-2 dark:text-white text-sm font-semibold border dark:border-gray-500 rounded bg-white dark:bg-dark1 
      hover:-translate-y-[1px] hover:shadow-md duration-200"
      onClick={onClick}
    >
      <img src={GoogleLogo} alt="" className="w-5" />
      <span>Log in with Google</span> 
    </button>
  );
}
export default Google;

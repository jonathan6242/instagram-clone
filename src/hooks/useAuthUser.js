import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "../firebase";


export default function useAuthUser() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setLoading(true);
      if(user) {
        setUser(user)
      } else {
        setUser(null)
      }
      setLoading(false);
    })
    return unsubscribe
  }, [])

  return { user, loading }
}


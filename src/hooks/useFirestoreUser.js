import { doc, getDoc } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import UserContext from "../context/UserContext";
import { db } from "../firebase";


export default function useFirestoreUser() {
  const [firestoreUser, setFirestoreUser] = useState(null)
  const [loading, setLoading] = useState(true);
  const { user } = useContext(UserContext)

  useEffect(() => {
    async function getFirestoreUser() {
      const docSnap = await getDoc(doc(db, "users", user.uid))
      setFirestoreUser(docSnap.data())
    }
    setLoading(true);
    if(user) {
      getFirestoreUser();
    }
    setLoading(false);
  }, [user])

  return { firestoreUser, loading }
}
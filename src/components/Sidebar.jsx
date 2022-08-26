import { Link } from "react-router-dom"
import { useContext, useEffect, useState } from "react"
import UserContext from "../context/UserContext"
import useFirestoreUser from "../hooks/useFirestoreUser"
import { collection, getDocs, limit, query } from "firebase/firestore"
import { auth, db } from "../firebase"
import SuggestedUser from "./SuggestedUser"
import { signInWithEmailAndPassword } from "firebase/auth"
import { toast } from "react-toastify"

function Sidebar() {
  const { user, loading } = useContext(UserContext)
  const { firestoreUser, loading: firestoreLoading } = useFirestoreUser()
  const [usersLoading, setUsersLoading] = useState(true);
  const [suggestedUsers, setSuggestedUsers] = useState([])

  useEffect(() => {
    async function getSuggestedUsers() {
      const docSnap = await getDocs(
        collection(db, "users"),
      );
      const data = docSnap.docs
        .map(doc => doc.data())
        .filter(item => item.uid !== user.uid)
        .filter(item => !item.followers.includes(user.uid))
        .slice(0, 6)
      setSuggestedUsers(data);
      setUsersLoading(false);
    }
    if(user?.uid) {
      getSuggestedUsers();
    }
  }, [user?.uid])

  // await signInWithEmailAndPassword(auth, "test@test.com", "Lawrence2157")

  return (
    <>
      {
        user && !loading && !firestoreLoading && !usersLoading ? ( 
          <div className="flex-col flex-1 hidden lg:flex space-y-6">
            <div className="p-6 bg-white dark:bg-dark1 rounded-lg shadow-lg
            flex flex-col">      
              <div className="flex flex-col">
                <div className="flex items-center space-x-4">
                  <Link to={`/profile/${user?.uid}`}>
                    <div className="w-14 h-14 rounded-full shadow-md bg-cover bg-center bg-no-repeat" style={{
                      backgroundImage: `url(${user?.photoURL})`
                    }}></div>
                  </Link>
                  <div>
                    <Link
                      className="font-semibold"
                      to={`/profile/${firestoreUser?.uid}`}
                    >
                      {firestoreUser?.username}
                    </Link>
                    <div>
                      {firestoreUser?.fullName}
                    </div>
                  </div>
                </div>
                {
                  suggestedUsers?.length > 0 && (
                    <>
                      <div className="text-gray-600 dark:text-gray-300 mt-8 mb-4">
                        <span>Suggestions for you</span>
                        <i className="fa-solid fa-users ml-2"></i>
                      </div>
                      <div className="flex flex-col space-y-3">
                        {
                          suggestedUsers.map(user => (
                            <SuggestedUser 
                              key={user.uid}
                              user={user}
                              firestoreUser={firestoreUser}
                            />
                          ))
                        }
                      </div>
                    </>
                  )
                }
              </div>   
            </div>
          </div>
        ) : (loading || firestoreLoading) ? (
          <div className="flex-col flex-1 hidden lg:flex space-y-6">
            <div className="p-6 bg-white dark:bg-dark1 rounded-lg shadow-lg
            flex flex-col">      
              <div className="flex flex-col">
                {/* Skeleton */}
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-full animated-bg"></div>
                  <div className="space-y-1">
                    <div className="w-40 rounded animated-bg">
                      &nbsp;
                    </div>
                    <div className="w-40 rounded animated-bg">
                      &nbsp;
                    </div>
                  </div>
                </div>
                <div className="rounded animated-bg mt-8 mb-4">
                  &nbsp;
                </div>
                <div className="flex flex-col space-y-3">
                  {/* Person 1 */}
                  <div className="flex space-x-4">
                    <div className="w-12 h-12 rounded-full animated-bg"></div>
                    <div className="flex-1 animated-bg rounded"></div>
                  </div>
                  {/* Person 2 */}
                  <div className="flex space-x-4">
                    <div className="w-12 h-12 rounded-full animated-bg"></div>
                    <div className="flex-1 animated-bg rounded"></div>
                  </div>
                  {/* Person 3 */}
                  <div className="flex space-x-4">
                    <div className="w-12 h-12 rounded-full animated-bg"></div>
                    <div className="flex-1 animated-bg rounded"></div>
                  </div>
                </div>
              </div>   
            </div>
          </div>
        ) : null
      }
    </>
  )
}
export default Sidebar
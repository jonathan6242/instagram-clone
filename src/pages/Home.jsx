import { arrayRemove, doc, updateDoc } from "firebase/firestore"
import { useEffect } from "react"
import Feed from "../components/Feed"
import Navbar from "../components/Navbar"
import { db } from "../firebase"

function Home({ modalOpen }) {
  return (
    <div className={modalOpen ? 'hidden md:block' : ''}>
      <Navbar />
      <Feed />
    </div>
  )
}
export default Home
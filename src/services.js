import { signOut } from "firebase/auth"
import { arrayRemove, arrayUnion, collection, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore"
import { auth, db } from "./firebase"

export const addArrows = () => {
  const next = document.querySelectorAll('.swiper-button-next')
  const prev = document.querySelectorAll('.swiper-button-prev')
  for(let button of next) {
    button.innerHTML = `<i class="fa-solid fa-chevron-right"></i>`
  }
  for(let button of prev) {
    button.innerHTML = `<i class="fa-solid fa-chevron-left"></i>`
  }
}

export const logOut = async () => {
  await signOut(auth)
}

// Validation functions


export const handleFirebaseError = (error) => {
  if(error.message) {
    try {
      if(error.message === 'Firebase: Error (auth/wrong-password).') {
        showError('password', 'Incorrect password.')
      } else if (error.message === 'Firebase: Error (auth/user-not-found).') {
        showError('email', 'User does not exist.')
      } else {
        document.getElementById('general').innerHTML = error.message
      }
    } catch (error) {
      
    }
  }
}

export const showError = (id, message) => {
  const inputGroup = document.getElementById(id).parentElement
  inputGroup.classList.add('error');
  inputGroup.classList.remove('success');
  inputGroup.querySelector('span').innerHTML = message;
  throw new Error();
}

export const showSuccess = (id) => {
  const inputGroup = document.getElementById(id).parentElement
  inputGroup.classList.add('success');
  inputGroup.classList.remove('error');
  inputGroup.querySelector('span').innerHTML = '';
}

export const validateEmail = (id) => {
  const input = document.getElementById(id);
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (re.test(input.value.trim())) {
    showSuccess(id);
  } else {
    showError(id, 'Email is not valid.');
  }
}

export const validatePassword = (id, min, max) => {
  const input = document.getElementById(id);
  if(input.value.length < min) {
    showError(id, `Minimum ${min} characters.`)
  } else if (input.value.length > max) {
    showError(id, `Maximum ${max} characters.`)
  } else {
    showSuccess(id)
  }
}

export const validateUsername = async (id, edit = false) => {
  const input = document.getElementById(id);
  const docSnap = await getDocs(
    query(
      collection(db, "users"),
      where('username', '==', input.value)
    )
  )
  let matches = docSnap.docs.map((item) => item.data())
  if(edit) {
    matches = matches.filter(item => item?.uid !== auth?.currentUser?.uid)
  }
  if(matches.length > 0) {
    showError('username', 'Username is taken.')
  } else {
    showSuccess('username')
  }
}

export const validateRequired = (idArray) => {
  let required = false;
  for(let id of idArray) {
    const input = document.getElementById(id);
    if(input.value === '') {
      required = true;
      showError(id, `This field is required.`)
    } else {
      showSuccess(id)
    }
  }
  return required;
}

export const follow = async (followingUserId, followedUserId, isFollowing) => {
  if(!isFollowing) {
    await updateDoc(doc(db, "users", followingUserId), {
      following: arrayUnion(followedUserId)
    })
    await updateDoc(doc(db, "users", followedUserId), {
      followers: arrayUnion(followingUserId)
    })
  } else {
    await updateDoc(doc(db, "users", followingUserId), {
      following: arrayRemove(followedUserId)
    })
    await updateDoc(doc(db, "users", followedUserId), {
      followers: arrayRemove(followingUserId)
    })
  }

}

export const shortenFormatDistance = (formatDistance) => {
  let arr = formatDistance.split(" ")
  return arr[0] + " " + arr[1][0];
}

export const isUserInStories = async (uid) => {
  const docSnap = await getDoc(doc(db, "stories", uid));
  const user = docSnap.data();
  if(user) {
    return true;
  } else {
    return false;
  } 
}

export const addUnique = (array, element) => {
  let newArray = array;
  if(!array.includes(element)) {
    newArray.push(element)
  }
  return newArray
}

export const allSeen = (stories, uid) => {
  let allSeen = true;
  if(stories) {
    for(let story of stories) {
      if(!story?.seenBy?.includes(uid)) {
        allSeen = false
      }
    }
  }
  return allSeen
}

export const hasStory = (usersWithStories, uid) => {
  // Determine whether user has a story based on their UID
  const user = usersWithStories?.find(user => user?.id === uid);
  if(user?.stories?.length > 0) {
    return true;
  } else {
    return false;
  }
}
import { useContext, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ModalContext from "../context/ModalContext";
import ThemeContext from "../context/ThemeContext";
import UserContext from "../context/UserContext";
import { logOut } from "../services";

function Navbar() {
  const { theme, setTheme } = useContext(ThemeContext)
  const { user, loading } = useContext(UserContext)
  const { menuOpen, setMenuOpen } = useContext(ModalContext)
  const menuRef = useRef();
  const menuToggleRef = useRef();
  const navigate = useNavigate();
  const location = useLocation();

  const toggleTheme = () => {
    if(document.documentElement.classList.contains('dark')) {
      setTheme('light')
      localStorage.setItem("theme", "light")
    } else {
      setTheme('dark')
      localStorage.setItem("theme", "dark")
    }
    document.documentElement.classList.toggle('dark');
  }

  useEffect(() => {
    const closeMenu = (e) => {
      if(
        !e.target.classList.contains('nav-menu-toggle') &&
        !e.target.classList.contains('nav-menu') &&
        !menuToggleRef?.current?.contains(e.target) &&
        !menuRef?.current?.contains(e.target)
      ) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('click', closeMenu);
    return () => {
      document.removeEventListener('click', closeMenu)
    }
  }, [])

  return (
    // Navbar
    <>
      <nav className="bg-white shadow-md dark:bg-dark1 hidden md:flex">
        <div className="container mx-auto px-6 max-w-5xl">
          {/* Navbar Flex Container */}
          <div className="flex items-center justify-between py-4">
            <Link to='/' className="text-2xl font-bold select-none">
              Insta.
            </Link>
            <div className="relative flex items-center space-x-1 md:space-x-3 text-2xl">
              {
                loading && <div className="w-[190px] h-8 my-1 rounded-sm animated-bg"></div>
              }
              {
                !loading && (
                  <>
                    <Link to='/' className="nav-button">
                      <i className="fa-solid fa-house text-xl"></i>
                    </Link>
                    <button id="theme-btn" className="nav-button" onClick={toggleTheme}>
                      { theme === 'dark' ? <i className="fa-regular fa-sun"></i> 
                      : <i className="fa-regular fa-moon"></i>
                      }
                    </button>
                    {
                      user ? (
                        <>
                          <Link to='/createpost' className="nav-button">
                            <i className="fa-solid fa-plus"></i>
                          </Link>
                          <button 
                            className="nav-button nav-menu-toggle" 
                            onClick={() => setMenuOpen(!menuOpen)}
                            ref={menuToggleRef}
                          >
                            <div
                              className="w-7 h-7 rounded-full bg-cover bg-center bg-no-repeat "
                              style={{
                                backgroundImage: `url(${user?.photoURL})`
                              }}
                            ></div>
                          </button>
                        </>
                      ) : (
                        <>
                          <Link 
                            to='/login' 
                            className="text-sm font-semibold border-none bg-softBlue text-white mr-4 p-2 px-4 rounded-md cursor-pointer"
                          >
                            Log In
                          </Link>
                          <Link 
                            to='/signup'
                            className="text-sm font-semibold border-none text-softBlue mr-4 p-2 rounded-md cursor-pointer"
                          >
                            Sign Up
                          </Link>
                        </>
                      )
                    }
                  </>
                )
              }
              {
                menuOpen && (
                  <>
                    <div className="nav-menu absolute z-20 w-4 h-4 top-10 right-3 rotate-45 
                    border bg-white border-r-0 border-b-0
                    dark:bg-dark1 dark:border-gray-500">
                    </div>
                    <div 
                      className="nav-menu absolute flex flex-col -right-4 top-12 border divide-y bg-white text-sm rounded-md w-60 shadow-md overflow-hidden
                      dark:bg-dark1 dark:border-gray-500 dark:divide-gray-500
                      z-10"
                      ref={menuRef}
                    >
                      <Link 
                        to={`/profile/${user?.uid}`}
                        className="px-4 py-3 flex items-center space-x-3 cursor-pointer
                        hover:bg-gray-50 dark:hover:bg-dark2 duration-200"
                        onClick={() => setMenuOpen(false)}
                      >
                        <i className="fa-solid fa-user"></i>
                        <span>Profile</span>
                      </Link>
                      <div 
                        className="px-4 py-3 flex items-center space-x-3 cursor-pointer
                        hover:bg-gray-50 dark:hover:bg-dark2 duration-200"
                        onClick={() => {
                          logOut()
                          setMenuOpen(false)
                        }}
                      >
                        <i className="fa-solid fa-arrow-right-from-bracket"></i>
                        <span>Log out</span>
                      </div>
                    </div>     
                  </>
                )
              }

            </div>
          </div>
        </div>
      </nav>
      {/* Mobile */}
      {
        !loading && (
          <nav className="flex fixed inset-x-0 bottom-0 md:hidden z-40
          h-12 bg-white dark:bg-dark1 border-t dark:border-gray-500 text-xl">
            <div className="flex-1 flex justify-center items-center"
            onClick={() => navigate('/')}>
              <i className="fa-solid fa-house"></i>
            </div>
            <button id="theme-btn" className="flex-1 flex justify-center items-center" onClick={toggleTheme}>
              { theme === 'dark' ? <i className="fa-regular fa-sun"></i> 
              : <i className="fa-regular fa-moon"></i>
              }
            </button>
            {
              user ? (
                <>
                  <Link to='/createpost' className="flex-1 flex justify-center items-center">
                    <i className="fa-solid fa-plus"></i>
                  </Link>
                  <Link 
                    className="flex-1 flex justify-center items-center"
                    to={`/profile/${user?.uid}`}
                  >
                    <div
                      className="w-6 h-6 rounded-full bg-cover bg-center bg-no-repeat "
                      style={{
                        backgroundImage: `url(${user?.photoURL})`
                      }}
                    ></div>
                  </Link>
                </>
              ) : location.pathname === '/' ? (
                <></>
                // <div className="h-14 flex justify-between px-6 items-center mb-4
                // font-semibold text-2xl border-b dark:border-gray-500 bg-white dark:bg-dark1
                // md:hidden fixed top-0 inset-x-0 z-10"
                // style={{
                //   transform: `translate3d(0,0,0)`
                // }}>
                //   Insta.
                // </div>
              ) : null
            }
          </nav>
        )
      }
     
    </>
  )
}
export default Navbar
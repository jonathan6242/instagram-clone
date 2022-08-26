import { useContext } from "react"
import ModalContext from "../context/ModalContext"
import { logOut } from "../services"

function LogoutModal() {
  const { setLogoutOpen } = useContext(ModalContext)

  function closeModal() {
    setLogoutOpen(false)
  }

  return (
    <>
      <div 
        className="fixed inset-0 z-10 bg-black/50 md:hidden"
        onClick={closeModal}
      ></div>
      <div className="absolute inset-0 items-center md:hidden">
        <div className="flex min-h-full items-center justify-center p-4 text-center">
          <div className="w-full max-w-md transform overflow-hidden rounded-xl bg-white text-left align-middle shadow-xl transition-all flex flex-col
          divide-y z-20">
            <div 
              className="p-6 space-x-3 cursor-pointer"
              onClick={() => {
                logOut()
                closeModal()
              }}
            >
              <i className="fa-solid fa-arrow-right-from-bracket"></i>
              <span>Log out</span>
            </div>
            <div 
              className="p-6 space-x-3 cursor-pointer"
              onClick={closeModal}
            >
              Cancel
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
export default LogoutModal
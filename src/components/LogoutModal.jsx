import { useContext, Fragment, useState } from "react"
import ModalContext from "../context/ModalContext"
import { Dialog, Transition } from '@headlessui/react'
import { logOut } from "../services"

function LogoutModal() {
  const { logoutOpen, setLogoutOpen } = useContext(ModalContext)

  function closeModal() {
    setLogoutOpen(false)
  }

  return (
    <Transition appear show={logoutOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-100"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-75" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-100"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-xl bg-white text-left align-middle shadow-xl transition-all flex flex-col
              divide-y">
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
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
export default LogoutModal
import { createContext, useState } from "react";

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenMobile, setIsOpenMobile] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)

  return <ModalContext.Provider value={{
    isOpen,
    setIsOpen,
    isOpenMobile,
    setIsOpenMobile,
    menuOpen,
    setMenuOpen,
    logoutOpen,
    setLogoutOpen
  }}>
    {children}
  </ModalContext.Provider>
}

export default ModalContext
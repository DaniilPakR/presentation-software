import { createContext, useState } from "react";

export const UserContext = createContext({
  currentUsername: "",
  setCurrentUsername: () => {},
  regUsername: () => {},
  message: "",
  showMessage: () => {},
  regPresInput: "",
  setRegPresInput: () => {},
  regPresInputShown: false,
  setRegPresInputShown: () => {},
  usernameInputShown: false,
  setUsernameInputShown: () => {},
  setDontShowUsernameInput: () => {},
  dontShowUsernameInput: 0,
});

export default function UserContextProvider({ children }) {
  const [currentUsername, setCurrentUsername] = useState("");
  const [message, setMessage] = useState("");
  const [regPresInput, setRegPresInput] = useState("");
  const [regPresInputShown, setRegPresInputShown] = useState(false);
  const [usernameInputShown, setUsernameInputShown] = useState(false);
  const [dontShowUsernameInput, setDontShowUsernameInput] = useState(0);

  function showMessage(text) {
    setMessage(text);
    setTimeout(() => {
      setMessage("");
    }, 1500);
  }

  const ctxValue = {
    currentUsername,
    setCurrentUsername,
    message,
    showMessage,
    regPresInput,
    setRegPresInput,
    regPresInputShown,
    setRegPresInputShown,
    usernameInputShown,
    setUsernameInputShown,
    setDontShowUsernameInput,
    dontShowUsernameInput
  };

  return (
    <UserContext.Provider value={ctxValue}>{children}</UserContext.Provider>
  );
}

import { useContext } from "react";

import { UserContext } from "../context/userContext";

export default function Username() {

  const { currentUsername, setCurrentUsername, usernameInputShown, setUsernameInputShown, setDontShowUsernameInput } = useContext(UserContext)

  if (!usernameInputShown) {return null}

  return (
    <div className="flex flex-col absolute top-1/3 left-1/3 items-start bg-white rounded-md p-6 shadow-lg max-w-md w-full">
      <p className="flex flex-col w-full">
        <label htmlFor="username" className="font-medium mb-1">
          Username:
        </label>
        <input
          id="username"
          type="text"
          value={currentUsername}
          onChange={(e) => setCurrentUsername(e.target.value)}
          className="border border-gray-300 rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </p>
      <button
        onClick={() => {
          setUsernameInputShown(false);
          setDontShowUsernameInput(1)
        }}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-all"
      >
        Next
      </button>
    </div>
  );
}

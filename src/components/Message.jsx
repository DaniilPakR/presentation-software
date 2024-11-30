import { useContext } from "react";

import { UserContext } from "../context/userContext"

export default function Message() {

  const { message } = useContext(UserContext)

  if (message === "") {
    return null
  }

  return (
    <div className="flex justify-center fixed top-4 left-1/2 transform -translate-x-1/2 w-96 bg-gray-800 text-white p-4 rounded-md shadow-lg items-center">
      {message}
    </div>
  )
}
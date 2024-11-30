import { useContext } from "react"

import { UserContext } from "../context/userContext"

export default function Header() {

  const { currentUsername } = useContext(UserContext)

  return (
    <div className='header'>
      {currentUsername}
    </div>
  )
}
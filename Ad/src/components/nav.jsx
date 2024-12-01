import React from 'react'
import logo from "../images/logo.png"
import { useNavigate } from 'react-router-dom'
function Nav() {
  const router=useNavigate()
  return (
    <nav className='flex justify-between items-center'>
    <img src={logo} alt="" className='w-48 h-20'/>
    <button className='bg-black p-3 text-center text-white rounded-3xl' onClick={()=>{localStorage.clear();router("/")}}>Logout</button>
    </nav>
  )
}

export default Nav
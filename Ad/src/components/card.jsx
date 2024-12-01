import React from 'react'
import { useNavigate } from 'react-router-dom'
function Card({id,title,img,status}) {
    const navigate= useNavigate()
    const redirect=()=>{
        navigate(`/item/${id}`)
    }
  return (
    <div className='w-[250px] min-h-[250px] p-5 rounded-xl shadow-xl cursor-pointer' onClick={redirect}>
        <img src={img} alt="" className='rounded-md w-full h-[200px] object-cover'/>
        <div className="flex justify-between ">
        <h1>{title}</h1>
        <h1 className='text-teal-900'>{status}</h1>
        </div>
    </div>
  )
}

export default Card
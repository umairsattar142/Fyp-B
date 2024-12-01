import React, { useEffect,useState } from 'react'
import Card from '../components/card'
import Nav from '../components/nav'
import { request } from '../utils/apiService'
import { useNavigate } from 'react-router-dom'
function Home() {
  
    const navigate= useNavigate()
    const [items,setITems]=useState([])
  const getAllItems=async()=>{
    try {
      const response=await request("items/admin","GET")
      console.clear()
      console.log(response.data)
      setITems(response.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }
  useEffect(()=>{
    const token = localStorage.getItem("token")
    console.log(token)
    if(token){
      getAllItems()
    }else{
      navigate("/")
    }
   
  },[])
  return (
    <div className='px-5 pt-5'>
        <Nav/>        
        <h1 className='mt-10 uppercase font-bold text-xl text-center'>All the add request are listed below</h1>
        <h1 className="text-lg font-bold">Approved</h1>
        <div className="flex gap-5 flex-wrap">
            {items.filter(item=> item.isApproved).map(item=> <Card key={item._id} id={item._id} status={item.statusText} img={item.images[0]} title={item.title}/>
            )
            }
        </div>
        <h1 className="text-lg font-bold">Un Approved</h1>
        <div className="flex gap-5 flex-wrap">
            {items.filter(item=> !item.isApproved).map(item=> <Card key={item._id} id={item._id} status={item.statusText} img={item.images[0]} title={item.title}/>
            )
            }
        </div>
    </div>
  )
}

export default Home
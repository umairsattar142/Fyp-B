import React, { useEffect, useState } from "react";
import Nav from "../components/nav";
import img from "../images/images.jpeg";
import { useNavigate, useParams } from "react-router-dom";
import { request } from "../utils/apiService";
import { ToastContainer,toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

function Product() {
  const { id } = useParams();
  const [item, setITem] = useState(null);
  const navigate = useNavigate()
  const fetchProductDetails = async () => {
    try {
      const response = await request(`items/admin/${id}`, "GET");
      console.log(response);
      if (response.status === 200) {
        setITem(response.data);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const updateForm = async (e) => {
    e.preventDefault()
    try {
      let updatedItem=item
      if(item.statusText==="Approved"){
        updatedItem={...item,isApproved:true}
      }else{
        updatedItem={...item,isApproved:false}
      }
      const response = await request(`items/${id}`, "PUT",updatedItem);
      console.log(response);
      if (response.status === 200) {
        toast.success("Item status updated")
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    const token = localStorage.getItem("token")
    if(token){
      fetchProductDetails();
    }else{
      navigate("/")
    }
  }, []);
  return (
    <div className="px-5 pt-5">
      
      <Nav />
      {item && (
        <div className="mt-5 flex max-md:flex-col gap-2">
          <div className="flex gap-1 flex-col">
            <img
              src={item.images[0]}
              className="w-[300px] h-[300px] object-cover rounded-md"
              alt=""
            />
            <div className="flex justify-start flex-wrap gap-1 w-[300px]">
              {item.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  className="w-[70px] h-[70px] object-cover rounded-md"
                  alt=""
                />
              ))}
            </div>
          </div>
          <div>
            <h1 className="text-3xl">{item.title}</h1>
            <div className="flex items-center gap-5 mt-2">
              <h1 className="font-bold text-xl">Starting bid</h1>
              <h1 className="font-bold text-xl text-teal-900">
                Rs. {item.startingBid}/-
              </h1>
            </div>
            <h1 className="mt-5">{item.description}</h1>
            <form onSubmit={updateForm}>
              <label htmlFor="">Approval Status : </label>
              <select
                name=""
                value={item.statusText}
                onChange={(e) => {
                  setITem({ ...item, statusText: e.target.value });
                }}
                id=""
                className="p-2 rounded-lg w-[200px] mt-2"
              >
                <option value="Review">Review</option>
                <option value="Rejected">Rejected</option>
                <option value="Approved">Approved</option>
              </select>
              <br />
              <button
                type="submit"
                className="p-2 rounded-lg w-[150px] text-white bg-teal-900 mt-5"
              >
                Update
              </button>
            </form>
          </div>
        </div>
      )}
      <ToastContainer/>
    </div>
  );
}

export default Product;

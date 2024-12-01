import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { request } from "../utils/apiService";
import axios from "axios";
function Login() {
  const router = useNavigate();
  const [formData, setFormData] = useState({
    cnic: "",
    password: "",
  });
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await request("users/login", "POST",formData);
      console.log(res)
      if (res.status === 200) {
        localStorage.setItem("token", res.data.token);
        router("/rarefinds");
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    const token = localStorage.getItem("token");
    token && router("/rarefinds");
  }, []);
  return (
    <div className="flex justify-center items-center h-screen w-screen">
      <div className="h-fit w-[400px] rounded-lg max-sm:w-full p-5 shadow-2xl">
        <h1 className="text-3xl underline font-bold">Login</h1>
        <form onSubmit={handleSubmit} className="mt-10">
          <div className="flex flex-col gap-2">
            <label htmlFor="">CNIC</label>

            <input
              type="text"
              value={formData.cnic}
              onChange={({target}) => {
                setFormData(pre=>({...pre,cnic:target.value}));
              }}
              className="border p-2 rounded-3xl"
            />
          </div>
          <div className="flex flex-col gap-2 mt-4">
            <label htmlFor="">Password</label>

            <input
              type="password"
              value={formData.password}
              onChange={(e) => {
                e.preventDefault();
                setFormData({ ...formData, password: e.target.value });
              }}
              className="border p-2 rounded-3xl"
            />
          </div>
          <div className="flex justify-end items-center mt-5">
          </div>
          <button
            type="submit"
            className="w-full bg-black text-white p-3 rounded-3xl mt-5"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;

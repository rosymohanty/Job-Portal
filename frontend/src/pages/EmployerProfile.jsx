import React, { useState, useEffect } from "react";
import axios from "../utils/axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
const EmployerProfile = () => {

  const [form,setForm] = useState({
    name:"",
    company:"",
    website:"",
    location:""
  });

  useEffect(()=>{

    const user = JSON.parse(localStorage.getItem("user"));

    if(user){
      setForm({
        name:user.name || "",
        company:user.company || "",
        website:user.website || "",
        location:user.location || ""
      });
    }

  },[]);

  const handleChange = (e)=>{
    setForm({...form,[e.target.name]:e.target.value});
  };

  const navigate = useNavigate();

const handleSubmit = async (e)=>{
  e.preventDefault();

  try{

    const {data} = await axios.put("/auth/update-profile", form);

    toast.success("Profile updated");

    localStorage.setItem("user", JSON.stringify(data.user));

    navigate("/employer");

  }catch(error){

    toast.error("Update failed");

  }
};

  return (

<div className="min-h-screen bg-gradient-to-br from-black via-indigo-950 to-purple-950 pt-32 flex justify-center text-white">

<div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-10 w-full max-w-lg">

<h2 className="text-3xl font-bold mb-8 text-indigo-400">
Employer Profile
</h2>

<form onSubmit={handleSubmit} className="space-y-5">

<input
name="name"
value={form.name}
onChange={handleChange}
placeholder="Your Name"
className="w-full p-3 rounded-lg bg-black/40 border border-white/20"
/>

<input
name="company"
value={form.company}
onChange={handleChange}
placeholder="Company Name"
className="w-full p-3 rounded-lg bg-black/40 border border-white/20"
/>

<input
name="website"
value={form.website}
onChange={handleChange}
placeholder="Company Website"
className="w-full p-3 rounded-lg bg-black/40 border border-white/20"
/>

<input
name="location"
value={form.location}
onChange={handleChange}
placeholder="Location"
className="w-full p-3 rounded-lg bg-black/40 border border-white/20"
/>

<button
className="w-full bg-indigo-600 py-3 rounded-xl hover:bg-indigo-700 transition"
>
Update Profile
</button>

</form>

</div>

</div>

  );
};

export default EmployerProfile;
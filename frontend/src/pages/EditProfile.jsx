import React, { useState, useEffect } from "react";
import axios from "../utils/axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { User, Phone, Edit, Save } from "lucide-react";

const EditProfile = () => {

  const navigate = useNavigate();

  const [form,setForm] = useState({
    name:"",
    phone:"",
    bio:"",
    skills:""
  });

  // Load existing user data
  useEffect(()=>{

    try{

      const storedUser = localStorage.getItem("user");

      if(storedUser && storedUser !== "undefined"){

        const user = JSON.parse(storedUser);

        setForm({
          name: user.name || "",
          phone: user.phone || "",
          bio: user.bio || "",
          skills: user.skills ? user.skills.join(", ") : ""
        });

      }

    }catch(error){
      console.log("User parse error");
    }

  },[]);


  const handleChange = (e)=>{
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };


  const handleSubmit = async (e)=>{
    e.preventDefault();

    try{

      const {data} = await axios.put("/auth/update-profile",form);

      toast.success("Profile updated successfully");

      // Update localStorage user
      localStorage.setItem("user",JSON.stringify(data.user));

      navigate("/profile");

    }catch(error){

      toast.error("Update failed");

    }
  };


  return (

<div className="min-h-screen bg-gradient-to-br from-black via-indigo-950 to-purple-950 pt-24 px-6 text-white">

<div className="max-w-3xl mx-auto bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-10 shadow-xl">

<h2 className="text-3xl font-bold mb-8 flex items-center gap-3 text-indigo-400">

<Edit size={26}/>
Edit Profile

</h2>

<form onSubmit={handleSubmit} className="space-y-6">

{/* NAME */}

<div>

<label className="block mb-2 text-sm text-gray-300">
Name
</label>

<div className="flex items-center gap-3">

<User size={18} className="text-indigo-400"/>

<input
type="text"
name="name"
value={form.name}
onChange={handleChange}
className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500"
/>

</div>

</div>


{/* PHONE */}

<div>

<label className="block mb-2 text-sm text-gray-300">
Phone
</label>

<div className="flex items-center gap-3">

<Phone size={18} className="text-indigo-400"/>

<input
type="text"
name="phone"
value={form.phone}
onChange={handleChange}
className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500"
/>

</div>

</div>


{/* BIO */}

<div>

<label className="block mb-2 text-sm text-gray-300">
Bio
</label>

<textarea
name="bio"
rows="4"
value={form.bio}
onChange={handleChange}
className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500"
placeholder="Write something about yourself..."
></textarea>

</div>


{/* SKILLS */}

<div>

<label className="block mb-2 text-sm text-gray-300">
Skills (comma separated)
</label>

<input
type="text"
name="skills"
value={form.skills}
onChange={handleChange}
placeholder="React, Node, MongoDB"
className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500"
/>

</div>


{/* BUTTON */}

<button
type="submit"
className="flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-700 py-3 rounded-xl font-semibold transition"
>

<Save size={18}/>
Save Changes

</button>

</form>

</div>

</div>

  );

};

export default EditProfile;
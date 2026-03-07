import React, { useState, useEffect } from "react";
import axios from "../utils/axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Mail, Phone, Edit, FileText, Globe } from "lucide-react";

const UserProfile = () => {

  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [resume, setResume] = useState(null);
  const [portfolio, setPortfolio] = useState("");

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");

      if (storedUser && storedUser !== "undefined") {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setPortfolio(parsedUser.portfolio || "");
      }

    } catch (error) {
      localStorage.removeItem("user");
    }
  }, []);

  if (!user) return null;

  // Resume Upload
  const uploadResume = async () => {

    if (!resume) {
      toast.error("Please select a resume file");
      return;
    }

    const formData = new FormData();
    formData.append("resume", resume);

    try {

      const { data } = await axios.post("/auth/upload-resume", formData);

      toast.success("Resume uploaded");

      const updatedUser = { ...user, resume: data.resume };

      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

    } catch (error) {
      toast.error("Upload failed");
    }
  };

  // Portfolio Save
  const savePortfolio = async () => {

    try {

      const { data } = await axios.put("/auth/update-profile", {
        portfolio
      });

      toast.success("Portfolio saved");

      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));

    } catch (error) {
      toast.error("Failed to save portfolio");
    }
  };

  return (

<div className="min-h-screen bg-gradient-to-br from-black via-indigo-950 to-purple-950 pt-24 px-6 text-white">

<div className="max-w-5xl mx-auto">

{/* PROFILE HEADER */}

<div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden shadow-xl">

<div className="h-40 bg-gradient-to-r from-indigo-600 to-purple-600"></div>

<div className="p-8 relative">

{/* AVATAR */}

<div className="absolute -top-16 left-8">

<div className="w-32 h-32 rounded-full bg-indigo-600 flex items-center justify-center text-4xl font-bold border-4 border-black">
{user.name?.charAt(0).toUpperCase()}
</div>

</div>

{/* EDIT BUTTON */}

<div className="flex justify-end">

<button
onClick={() => navigate("/profile/edit")}
className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm"
>
<Edit size={16}/>
Edit Profile
</button>

</div>

<h2 className="text-3xl font-bold mt-6">{user.name}</h2>

<p className="text-gray-400 mt-1">{user.bio || "No bio added yet"}</p>

{/* CONTACT */}

<div className="flex flex-wrap gap-6 mt-6 text-sm">

<div className="flex items-center gap-2 text-gray-300">
<Mail size={16}/>
{user.email}
</div>

<div className="flex items-center gap-2 text-gray-300">
<Phone size={16}/>
{user.phone || "No phone"}
</div>

</div>

</div>

</div>

{/* SKILLS */}

<div className="mt-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8">

<h3 className="text-xl font-semibold mb-6 text-indigo-400">
Skills
</h3>

<div className="flex flex-wrap gap-3">

{user.skills?.length > 0 ? (

user.skills.map((skill, index) => (
<span
key={index}
className="px-4 py-1 bg-indigo-600/20 text-indigo-400 rounded-full text-sm"
>
{skill}
</span>
))

) : (

<p className="text-gray-400">No skills added</p>

)}

</div>

</div>

{/* RESUME */}

<div className="mt-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8">

<h3 className="text-xl font-semibold mb-6 text-indigo-400">
Resume
</h3>

{user.resume && (
<a
href={`http://localhost:4000/${user.resume}`}
target="_blank"
className="text-indigo-400 underline block mb-4"
>
View Uploaded Resume
</a>
)}

<input
type="file"
onChange={(e) => setResume(e.target.files[0])}
className="mb-4"
/>

<button
onClick={uploadResume}
className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg"
>
<FileText size={16}/>
Upload Resume
</button>

</div>

{/* PORTFOLIO */}

<div className="mt-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8">

<h3 className="text-xl font-semibold mb-6 text-indigo-400">
Portfolio
</h3>

<input
type="text"
value={portfolio}
onChange={(e) => setPortfolio(e.target.value)}
placeholder="https://yourportfolio.com"
className="w-full mb-4 bg-black/40 border border-white/20 rounded-lg px-4 py-2"
/>

<button
onClick={savePortfolio}
className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg"
>
<Globe size={16}/>
Save Portfolio
</button>

</div>

</div>

</div>

  );
};

export default UserProfile;
import React, { useEffect, useState } from "react";
import axios from "../utils/axios";
import { motion, AnimatePresence } from "framer-motion";

const AdminDashboard = () => {

const [stats,setStats] = useState({});
const [users,setUsers] = useState([]);
const [jobs,setJobs] = useState([]);
const [loading,setLoading] = useState(true);
const [tab,setTab] = useState("overview");


useEffect(()=>{
fetchData();
},[]);


const fetchData = async()=>{

try{

const statsRes = await axios.get("/admin/dashboard/stats");
const usersRes = await axios.get("/admin/users");
const jobsRes = await axios.get("/admin/jobs");

if(statsRes.data.success){
setStats(statsRes.data.data);
}

setUsers(usersRes.data.users || []);
setJobs(jobsRes.data.jobs || []);

setLoading(false);

}catch(error){
console.log(error);
setLoading(false);
}

};


const deleteUser = async(id)=>{
await axios.delete(`/admin/users/${id}`);
fetchData();
};

const deleteJob = async(id)=>{
await axios.delete(`/admin/jobs/${id}`);
fetchData();
};

const toggleApproval = async(id)=>{
await axios.patch(`/admin/users/${id}/toggle-approval`);
fetchData();
};


if(loading){

return(
<div className="min-h-screen flex items-center justify-center bg-black">

<motion.div
animate={{rotate:360}}
transition={{repeat:Infinity,duration:1}}
className="w-14 h-14 border-4 border-indigo-500 border-t-transparent rounded-full"
/>

</div>
)

}



const employers = users.filter(user=>user.role==="employer");


const statsCards = [

{
title:"Users",
value:stats.totalUsers,
icon:"👥",
color:"from-indigo-500 to-purple-600"
},

{
title:"Jobs",
value:stats.totalJobs,
icon:"💼",
color:"from-pink-500 to-red-500"
},

{
title:"Applications",
value:stats.totalApplications,
icon:"📄",
color:"from-green-500 to-emerald-500"
}

];


return(

<div className="min-h-screen bg-gradient-to-br from-black via-indigo-950 to-purple-950 text-white pt-24 px-6">

<div className="max-w-7xl mx-auto">


{/* HEADER */}

<motion.div
initial={{opacity:0,y:-30}}
animate={{opacity:1,y:0}}
className="flex justify-between items-center mb-10"
>

<h1 className="text-4xl font-bold">

Admin <span className="text-indigo-400">Dashboard</span>

</h1>

</motion.div>


{/* NAVIGATION */}

<div className="flex gap-4 mb-10">

{["overview","users","employers","jobs"].map((item)=>(
<button
key={item}
onClick={()=>setTab(item)}
className={`px-5 py-2 rounded-full transition 
${tab===item
? "bg-indigo-600 shadow-lg shadow-indigo-500/40"
: "bg-white/10 hover:bg-white/20"
}`}
>
{item.charAt(0).toUpperCase()+item.slice(1)}
</button>
))}

</div>



{/* CONTENT */}

<AnimatePresence mode="wait">



{/* OVERVIEW */}

{tab==="overview" && (

<motion.div
key="overview"
initial={{opacity:0,y:30}}
animate={{opacity:1,y:0}}
exit={{opacity:0,y:-30}}
className="grid md:grid-cols-3 gap-6"
>

{statsCards.map((card,i)=>(

<motion.div
key={i}
whileHover={{scale:1.05}}
className={`bg-gradient-to-r ${card.color} p-[1px] rounded-2xl`}
>

<div className="bg-black/60 backdrop-blur-xl p-6 rounded-2xl">

<div className="text-4xl mb-3">{card.icon}</div>

<h3 className="text-gray-400 text-sm">
{card.title}
</h3>

<p className="text-3xl font-bold">
{card.value}
</p>

</div>

</motion.div>

))}

</motion.div>

)}



{/* USERS */}

{tab==="users" && (

<motion.div
key="users"
initial={{opacity:0,y:20}}
animate={{opacity:1,y:0}}
exit={{opacity:0}}
transition={{duration:0.4}}
className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-xl"
>

{/* Header */}

<div className="flex items-center justify-between mb-8">

<h2 className="text-3xl font-bold text-indigo-400">
User Management
</h2>

<span className="text-sm text-gray-400">
Total Users: {users.length}
</span>

</div>


{/* Table */}

<div className="overflow-x-auto">

<table className="w-full text-sm">

<thead>

<tr className="text-gray-400 border-b border-white/10">

<th className="py-4 text-left">User</th>
<th>Email</th>
<th>Role</th>
<th className="text-right">Action</th>

</tr>

</thead>

<tbody>

{users.map((user,index)=>(

<motion.tr
key={user._id}
initial={{opacity:0,y:15}}
animate={{opacity:1,y:0}}
transition={{delay:index*0.05}}
whileHover={{scale:1.01}}
className="border-b border-white/5 hover:bg-white/5 transition"
>

{/* USER NAME */}

<td className="py-4 flex items-center gap-3">

<div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-semibold">

{user.name?.charAt(0).toUpperCase()}

</div>

<div>

<p className="font-medium">{user.name}</p>

<p className="text-xs text-gray-400">
ID: {user._id.slice(-6)}
</p>

</div>

</td>


{/* EMAIL */}

<td className="text-gray-300">
{user.email}
</td>


{/* ROLE BADGE */}

<td>

<span className={`px-3 py-1 rounded-full text-xs font-medium

${user.role==="admin"
? "bg-purple-500/20 text-purple-400"
: user.role==="employer"
? "bg-indigo-500/20 text-indigo-400"
: "bg-green-500/20 text-green-400"}

`}>

{user.role}

</span>

</td>


{/* ACTION */}

<td className="text-right">

<motion.button
whileHover={{scale:1.1}}
whileTap={{scale:0.9}}
onClick={()=>deleteUser(user._id)}
className="bg-red-500/20 text-red-400 px-4 py-1 rounded-full text-xs hover:bg-red-500 hover:text-white transition"
>

Delete

</motion.button>

</td>

</motion.tr>

))}

</tbody>

</table>

</div>

</motion.div>

)}

{/* EMPLOYERS */}

{tab==="employers" && (

<motion.div
key="employers"
initial={{opacity:0, y:20}}
animate={{opacity:1, y:0}}
exit={{opacity:0}}
transition={{duration:0.4}}
className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-xl"
>

{/* Header */}

<div className="flex items-center justify-between mb-8">

<h2 className="text-3xl font-bold text-indigo-400">
Employer Management
</h2>

<span className="text-sm text-gray-400">
Total Employers: {employers.length}
</span>

</div>


{/* Table */}

<div className="overflow-x-auto">

<table className="w-full text-sm">

<thead>

<tr className="text-gray-400 border-b border-white/10">

<th className="py-4 text-left">Employer</th>
<th>Email</th>
<th>Status</th>
<th className="text-right">Action</th>

</tr>

</thead>

<tbody>

{employers.map((emp,index)=>(

<motion.tr
key={emp._id}
initial={{opacity:0,y:15}}
animate={{opacity:1,y:0}}
transition={{delay:index*0.05}}
whileHover={{scale:1.01}}
className="border-b border-white/5 hover:bg-white/5 transition"
>

{/* Employer Name + Avatar */}

<td className="py-4 flex items-center gap-3">

<div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-semibold">

{emp.name?.charAt(0).toUpperCase()}

</div>

<div>

<p className="font-medium">{emp.name}</p>

<p className="text-xs text-gray-400">
ID: {emp._id.slice(-6)}
</p>

</div>

</td>


{/* Email */}

<td className="text-gray-300">
{emp.email}
</td>


{/* Status Badge */}

<td>

<motion.span
animate={{scale: emp.isApproved ? [1,1.05,1] : 1}}
transition={{duration:1}}
className={`px-3 py-1 rounded-full text-xs font-medium

${emp.isApproved
? "bg-green-500/20 text-green-400"
: "bg-yellow-500/20 text-yellow-400"}

`}
>

{emp.isApproved ? "Approved" : "Pending"}

</motion.span>

</td>


{/* Action Button */}

<td className="text-right">

<motion.button
whileHover={{scale:1.1}}
whileTap={{scale:0.9}}
onClick={()=>toggleApproval(emp._id)}
className={`px-4 py-1 rounded-full text-xs transition

${emp.isApproved
? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500 hover:text-black"
: "bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white"}

`}
>

{emp.isApproved ? "Revoke" : "Approve"}

</motion.button>

</td>

</motion.tr>

))}

</tbody>

</table>

</div>

</motion.div>

)}
{/* JOBS */}

{tab === "jobs" && (

<motion.div
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
exit={{ opacity: 0 }}
transition={{ duration: 0.4 }}
className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-xl"
>

{/* Header */}

<h2 className="text-3xl font-bold text-indigo-400 mb-8">
Job Moderation
</h2>


{/* Table */}

<div className="overflow-x-auto">

<table className="w-full text-sm">

<thead>

<tr className="text-gray-400 border-b border-white/10">

<th className="py-4 text-left">Job</th>
<th>Employer</th>
<th className="text-right">Action</th>

</tr>

</thead>

<tbody>

{jobs.map((job, index) => (

<motion.tr
key={job._id}
initial={{ opacity: 0, y: 10 }}
animate={{ opacity: 1, y: 0 }}
transition={{ delay: index * 0.05 }}
whileHover={{ scale: 1.01 }}
className="border-b border-white/5 hover:bg-white/5 transition"
>

{/* Job Title */}

<td className="py-4">

<p className="font-medium">{job.title}</p>

<p className="text-xs text-gray-400">
ID: {job._id.slice(-6)}
</p>

</td>


{/* Employer */}

<td className="flex items-center gap-3">

<div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-semibold">

{job.employer?.name?.charAt(0).toUpperCase()}

</div>

<span className="text-gray-300">
{job.employer?.name}
</span>

</td>


{/* Delete Button */}

<td className="text-right">

<motion.button
whileHover={{ scale: 1.1 }}
whileTap={{ scale: 0.9 }}
onClick={() => deleteJob(job._id)}
className="bg-red-500/20 text-red-400 px-4 py-1 rounded-full text-xs hover:bg-red-500 hover:text-white transition"
>

Delete

</motion.button>

</td>

</motion.tr>

))}

</tbody>

</table>

</div>

</motion.div>

)}
</AnimatePresence>


</div>

</div>

)

};
export default AdminDashboard;
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import axios from "../utils/axios";

import {
  Briefcase,
  Users,
  Rocket,
  Search,
  MapPin,
  Star,
  Mail
} from "lucide-react";

const Landing = () => {

  const [stats,setStats] = useState({
    totalJobs:0,
    activeJobs:0,
    totalCompanies:0
  });

  const [featuredJobs,setFeaturedJobs] = useState([]);

  const [search,setSearch] = useState("");
  const [location,setLocation] = useState("");

  const [loading,setLoading] = useState(true);

  useEffect(()=>{

    const fetchStats = async ()=>{
      try{

        const {data} = await axios.get("/jobs/stats/overview");

        if(data.success){
          setStats({
            totalJobs:data.stats.total || 0,
            activeJobs:data.stats.active || 0,
            totalCompanies:data.stats.byType?.length || 0
          });
        }

      }catch(error){
        console.error(error);
      }
    };

    const fetchFeaturedJobs = async ()=>{
      try{

        const {data} = await axios.get("/jobs/featured/limit/3");

        if(data.success){
          setFeaturedJobs(data.jobs || []);
        }

      }catch(error){
        console.error(error);
      }finally{
        setLoading(false);
      }
    };

    fetchStats();
    fetchFeaturedJobs();

  },[]);

  return (

<div className="min-h-screen bg-gradient-to-br from-black via-indigo-950 to-purple-950 text-white">

{/* NAVBAR */}
{/* HERO */}

<div className="text-center mt-16 px-4">

<h2 className="text-6xl font-extrabold">

Find Your
<span className="text-indigo-400"> Dream Job</span>

</h2>

<p className="text-gray-300 mt-6 max-w-xl mx-auto">
Discover amazing opportunities and connect with top companies.
</p>

{/* ICON HIGHLIGHTS */}

<div className="flex justify-center gap-8 mt-8">

<div className="flex items-center gap-2 text-indigo-400">
<Briefcase size={20}/> Jobs
</div>

<div className="flex items-center gap-2 text-purple-400">
<Users size={20}/> Companies
</div>

<div className="flex items-center gap-2 text-pink-400">
<Rocket size={20}/> Fast Hiring
</div>

</div>


{/* SEARCH BAR */}

<div className="flex flex-wrap justify-center gap-4 mt-10">

<div className="flex items-center bg-white/10 px-4 py-2 rounded-lg">

<Search size={18}/>

<input
value={search}
onChange={(e)=>setSearch(e.target.value)}
placeholder="Job title"
className="bg-transparent outline-none ml-2"
/>

</div>


<div className="flex items-center bg-white/10 px-4 py-2 rounded-lg">

<MapPin size={18}/>

<input
value={location}
onChange={(e)=>setLocation(e.target.value)}
placeholder="Location"
className="bg-transparent outline-none ml-2"
/>

</div>

<Link
to="/jobs"
className="bg-indigo-600 px-6 py-2 rounded-lg hover:bg-indigo-700"
>
Search Jobs
</Link>

</div>

</div>


{/* STATS */}

{!loading && (

<div className="flex justify-center gap-16 mt-16">

<div className="text-center">
<div className="text-3xl font-bold text-indigo-400">
1250+
</div>
<p className="text-gray-400">Active Jobs</p>
</div>

<div className="text-center">
<div className="text-3xl font-bold text-purple-400">
320+
</div>
<p className="text-gray-400">Companies</p>
</div>

<div className="text-center">
<div className="text-3xl font-bold text-pink-400">
500+
</div>
<p className="text-gray-400">Placements</p>
</div>

</div>

)}


{/* ABOUT */}

<div className="max-w-5xl mx-auto text-center mt-24 px-4">

<h3 className="text-3xl font-bold mb-6">
About <span className="text-indigo-400">CareerHive</span>
</h3>

<p className="text-gray-300">
CareerHive connects talented professionals with leading companies.
Our platform simplifies recruitment for both job seekers and employers.
</p>

</div>


{/* FEATURES */}

<div className="max-w-6xl mx-auto mt-20 grid md:grid-cols-3 gap-6 px-4">

{[
{icon:<Briefcase size={40}/>,title:"Smart Job Search",desc:"Find jobs matching your skills."},
{icon:<Users size={40}/>,title:"Top Companies",desc:"Connect with global recruiters."},
{icon:<Rocket size={40}/>,title:"Fast Hiring",desc:"Apply and get hired faster."}
].map((item,i)=>(

<motion.div
key={i}
whileHover={{scale:1.05}}
className="bg-white/10 border border-white/20 p-6 rounded-2xl text-center"
>

<div className="text-indigo-400 flex justify-center mb-4">
{item.icon}
</div>

<h4 className="font-semibold">{item.title}</h4>

<p className="text-gray-400 text-sm mt-2">
{item.desc}
</p>

</motion.div>

))}

</div>


{/* FEATURED JOBS */}

{featuredJobs.length>0 && (

<div className="max-w-6xl mx-auto mt-24 px-4">

<h3 className="text-3xl text-center font-bold mb-10">
Featured <span className="text-indigo-400">Jobs</span>
</h3>

<div className="grid md:grid-cols-3 gap-6">

{featuredJobs.map(job=>(

<motion.div
key={job._id}
whileHover={{scale:1.05}}
className="bg-white/10 border border-white/20 p-6 rounded-2xl"
>

<h4 className="text-indigo-300 font-semibold">
{job.title}
</h4>

<p className="text-gray-400 text-sm mt-2">
📍 {job.location}
</p>

<p className="text-gray-500 text-xs mt-2 line-clamp-2">
{job.description}
</p>

</motion.div>

))}

</div>

</div>

)}


{/* TESTIMONIALS */}

<div className="max-w-6xl mx-auto mt-24 px-4">

<h3 className="text-3xl text-center font-bold mb-10">
User <span className="text-indigo-400">Feedback</span>
</h3>

<div className="grid md:grid-cols-3 gap-6">

{[
{name:"Rahul",text:"Found my dream job here."},
{name:"Priya",text:"Best platform for job search."},
{name:"Amit",text:"Amazing experience using TransHire."}
].map((review,i)=>(

<div
key={i}
className="bg-white/10 border border-white/20 p-6 rounded-2xl"
>

<div className="flex text-yellow-400 mb-2">

<Star size={16}/>
<Star size={16}/>
<Star size={16}/>
<Star size={16}/>
<Star size={16}/>

</div>

<p className="text-gray-300 text-sm">
{review.text}
</p>

<h4 className="text-indigo-400 mt-4">
{review.name}
</h4>

</div>

))}

</div>

</div>


{/* NEWSLETTER */}

<div className="text-center mt-24 px-4">

<h3 className="text-3xl font-bold">
Stay Updated
</h3>

<p className="text-gray-400 mt-2">
Subscribe for latest job alerts.
</p>

<div className="flex justify-center gap-3 mt-6">

<input
type="email"
placeholder="Enter email"
className="px-4 py-2 rounded-lg bg-white/10 border border-white/20"
/>

<button className="flex items-center gap-2 px-6 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700">

<Mail size={16}/>
Subscribe

</button>

</div>

</div>


{/* FOOTER */}

<footer className="mt-24 border-t border-white/10 py-10">

<div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6 px-4 text-gray-400">

<div>
<h4 className="text-indigo-400 font-semibold mb-2">CareerHive</h4>
<p>Your gateway to career opportunities.</p>
</div>

<div>
<h4 className="text-indigo-400 font-semibold mb-2">Links</h4>
<ul className="space-y-1">
<li><Link to="/jobs">Jobs</Link></li>
<li><Link to="/login">Login</Link></li>
<li><Link to="/register">Register</Link></li>
</ul>
</div>

<div>
<h4 className="text-indigo-400 font-semibold mb-2">Contact</h4>
<p>Email: support@transhire.com</p>
<p>Phone: +91 9876543210</p>
</div>

</div>

<p className="text-center text-gray-500 text-sm mt-6">
© 2024 CareerHive
</p>

</footer>


</div>

  );
};

export default Landing;
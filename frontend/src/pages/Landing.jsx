import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import axios from "../utils/axios";

import {
  Briefcase,
  Users,
  Rocket
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

<div className="min-h-screen bg-gradient-to-br from-black via-indigo-950 to-purple-950 text-white overflow-x-hidden">

{/* HERO */}

<motion.div
initial={{opacity:0,y:40}}
animate={{opacity:1,y:0}}
transition={{duration:0.8}}
className="text-center mt-20 px-4"
>

<h2 className="text-6xl font-extrabold leading-tight">

Find Your
<span className="text-indigo-400"> Dream Job</span>

</h2>

<p className="text-gray-300 mt-6 max-w-xl mx-auto text-lg">
Discover amazing opportunities and connect with top companies.
</p>

{/* ICON HIGHLIGHTS */}

<div className="flex justify-center gap-10 mt-10">

<motion.div whileHover={{scale:1.2}} className="flex items-center gap-2 text-indigo-400">
<Briefcase size={22}/> Jobs
</motion.div>

<motion.div whileHover={{scale:1.2}} className="flex items-center gap-2 text-purple-400">
<Users size={22}/> Companies
</motion.div>

<motion.div whileHover={{scale:1.2}} className="flex items-center gap-2 text-pink-400">
<Rocket size={22}/> Fast Hiring
</motion.div>

</div>

</motion.div>

{/* STATS */}

{!loading && (

<motion.div
initial={{opacity:0}}
animate={{opacity:1}}
transition={{delay:0.5}}
className="flex justify-center gap-20 mt-20"
>

{[
{value:"1250+",label:"Active Jobs",color:"text-indigo-400"},
{value:"320+",label:"Companies",color:"text-purple-400"},
{value:"500+",label:"Placements",color:"text-pink-400"},
].map((item,i)=>(

<motion.div
key={i}
whileHover={{scale:1.1}}
className="text-center"
>

<div className={`text-4xl font-bold ${item.color}`}>
{item.value}
</div>

<p className="text-gray-400 mt-2">{item.label}</p>

</motion.div>

))}

</motion.div>

)}


{/* ABOUT */}

<motion.div
initial={{opacity:0,y:40}}
whileInView={{opacity:1,y:0}}
transition={{duration:0.6}}
className="max-w-5xl mx-auto text-center mt-28 px-4"
>

<h3 className="text-3xl font-bold mb-6">
About <span className="text-indigo-400">CareerHive</span>
</h3>

<p className="text-gray-300 text-lg">
CareerHive connects talented professionals with leading companies.
Our platform simplifies recruitment for both job seekers and employers.
</p>

</motion.div>


{/* FEATURES */}

<div className="max-w-6xl mx-auto mt-20 grid md:grid-cols-3 gap-8 px-4">

{[
{icon:<Briefcase size={40}/>,title:"Smart Job Search",desc:"Find jobs matching your skills."},
{icon:<Users size={40}/>,title:"Top Companies",desc:"Connect with global recruiters."},
{icon:<Rocket size={40}/>,title:"Fast Hiring",desc:"Apply and get hired faster."}
].map((item,i)=>(

<motion.div
key={i}
whileHover={{scale:1.08}}
whileInView={{opacity:1,y:0}}
initial={{opacity:0,y:40}}
transition={{duration:0.5}}
className="bg-white/10 border border-white/20 p-8 rounded-2xl text-center backdrop-blur-xl"
>

<div className="text-indigo-400 flex justify-center mb-4">
{item.icon}
</div>

<h4 className="font-semibold text-lg">{item.title}</h4>

<p className="text-gray-400 text-sm mt-3">
{item.desc}
</p>

</motion.div>

))}

</div>


{/* FEATURED JOBS */}

{featuredJobs.length>0 && (

<div className="max-w-6xl mx-auto mt-24 px-4">

<h3 className="text-3xl text-center font-bold mb-12">
Featured <span className="text-indigo-400">Jobs</span>
</h3>

<div className="grid md:grid-cols-3 gap-8">

{featuredJobs.map(job=>(

<motion.div
key={job._id}
whileHover={{scale:1.05}}
initial={{opacity:0,y:40}}
whileInView={{opacity:1,y:0}}
transition={{duration:0.5}}
className="bg-white/10 border border-white/20 p-6 rounded-2xl backdrop-blur-lg"
>

<h4 className="text-indigo-300 font-semibold text-lg">
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

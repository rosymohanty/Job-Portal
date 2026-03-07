import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LogIn,
  UserPlus,
  LayoutDashboard,
  Briefcase,
  FileText,
  LogOut,
  Bell,
  Menu,
  X,
  User
} from "lucide-react";

const Navbar = () => {

  const navigate = useNavigate();

  // SAFE USER PARSE
  let user = null;

  try {
    const storedUser = localStorage.getItem("user");
    if (storedUser && storedUser !== "undefined") {
      user = JSON.parse(storedUser);
    }
  } catch (error) {
    console.error("Invalid user in localStorage");
    localStorage.removeItem("user");
  }

  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  useEffect(() => {

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);

  }, []);

  return (

<motion.nav
initial={{ y: -80 }}
animate={{ y: 0 }}
transition={{ duration: 0.5 }}
className={`fixed top-0 w-full z-50 transition-all duration-300
${scrolled
? "bg-black/70 backdrop-blur-lg shadow-lg"
: "bg-black/30 backdrop-blur-md"
}`}
>

<div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center text-white">

{/* LOGO */}

<Link
to="/"
className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent"
>
CareerHive
</Link>

{/* DESKTOP MENU */}

<div className="hidden md:flex items-center gap-6 text-sm font-medium">

{/* PUBLIC */}

{!user && (
<>
<Link
to="/login"
className="flex items-center gap-2 px-4 py-2 bg-indigo-600 rounded-xl hover:bg-indigo-700 transition"
>
<LogIn size={16}/>
Login
</Link>

<Link
to="/register"
className="flex items-center gap-2 px-4 py-2 bg-purple-600 rounded-xl hover:bg-purple-700 transition"
>
<UserPlus size={16}/>
Register
</Link>
</>
)}

{/* USER MENU */}

{user?.role === "user" && (
<>
<NavItem to="/home" label="Jobs" icon={<Briefcase size={16}/>}/>
<NavItem to="/my-applications" label="Applications" icon={<FileText size={16}/>}/>
<NavItem to="/profile" label="Profile" icon={<User size={16}/>}/>
<Bell size={18} className="cursor-pointer hover:text-indigo-400"/>
<ProfileMenu logout={logout}/>
</>
)}

{/* EMPLOYER MENU */}

{user?.role === "employer" && (
<>
<NavItem to="/employer" label="Dashboard" icon={<LayoutDashboard size={16}/>}/>
<NavItem to="/post-job" label="Post Job" icon={<Briefcase size={16}/>}/>
<NavItem to="/my-jobs" label="My Jobs" icon={<FileText size={16}/>}/>
<NavItem to="/employer/profile" label="Profile" icon={<User size={16}/>}/>
<Bell size={18} className="cursor-pointer hover:text-indigo-400"/>
<ProfileMenu logout={logout}/>
</>
)}

</div>

{/* MOBILE MENU BUTTON */}

<div className="md:hidden">
<button onClick={() => setMenuOpen(!menuOpen)}>
{menuOpen ? <X/> : <Menu/>}
</button>
</div>

</div>

{/* MOBILE MENU */}

{menuOpen && (

<div className="md:hidden px-6 pb-6 flex flex-col gap-4 text-white">

{!user && (
<>
<Link to="/login">Login</Link>
<Link to="/register">Register</Link>
</>
)}

{user?.role === "user" && (
<>
<Link to="/home">Jobs</Link>
<Link to="/my-applications">Applications</Link>
<Link to="/profile">Profile</Link>
<button onClick={logout}>Logout</button>
</>
)}

{user?.role === "employer" && (
<>
<Link to="/employer">Dashboard</Link>
<Link to="/post-job">Post Job</Link>
<Link to="/my-jobs">My Jobs</Link>
<Link to="/employer/profile">Profile</Link>
<button onClick={logout}>Logout</button>
</>
)}

</div>

)}

</motion.nav>

  );
};


/* NAV ITEM */

const NavItem = ({ to, label, icon }) => (

<Link
to={to}
className="flex items-center gap-2 relative group hover:text-indigo-400 transition"
>

{icon}
{label}

<span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-indigo-400 group-hover:w-full transition-all"></span>

</Link>

);


/* PROFILE DROPDOWN */

const ProfileMenu = ({ logout }) => {

const [open, setOpen] = useState(false);

return (

<div className="relative">

<div
onClick={() => setOpen(!open)}
className="w-9 h-9 bg-indigo-600 rounded-full flex items-center justify-center cursor-pointer"
>
<User size={18}/>
</div>

{open && (

<div className="absolute right-0 mt-3 w-40 bg-black border border-white/10 rounded-lg shadow-lg">

<button
onClick={logout}
className="flex items-center gap-2 w-full px-4 py-2 hover:bg-white/10"
>
<LogOut size={16}/>
Logout
</button>

</div>

)}

</div>

);

};

export default Navbar;
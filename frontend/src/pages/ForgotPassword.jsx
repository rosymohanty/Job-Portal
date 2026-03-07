import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";

function ForgotPassword() {

  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [timer, setTimer] = useState(0);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const formatTime = (seconds)=>{
    const mins=Math.floor(seconds/60);
    const secs=seconds%60;
    return `${mins}:${secs<10?"0":""}${secs}`;
  };

  useEffect(()=>{
    if(timer<=0) return;

    const interval=setInterval(()=>{
      setTimer(prev=>prev-1);
    },1000);

    return ()=>clearInterval(interval);

  },[timer]);

  const handleSendOTP = async () => {
    try{

      setError("");
      setMessage("");

      const res = await axios.post("/auth/forgot-password",{ email });

      setMessage(res.data.message);
      setStep(2);
      setTimer(600);

    }catch(err){
      setError(err.response?.data?.message || "Error sending OTP");
    }
  };

  const handleResetPassword = async () => {

    if(newPassword!==confirmPassword){
      setError("Passwords do not match");
      return;
    }

    try{

      setError("");
      setMessage("");

      const res = await axios.post("/auth/reset-password",{
  email,
  otp: otp.trim(),
  newPassword,
  confirmPassword
});
      setMessage(res.data.message);

      setTimeout(()=>{
        navigate("/login");
      },2000);

    }catch(err){
      setError(err.response?.data?.message || "Reset failed");
    }
  };

  return (

<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-indigo-950 to-purple-950 px-4">

<motion.div
initial={{opacity:0,y:40}}
animate={{opacity:1,y:0}}
transition={{duration:0.5}}
className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-10 shadow-2xl"
>

{/* Title */}

<h2 className="text-3xl font-bold text-center text-white mb-2">
Forgot Password
</h2>

<p className="text-gray-400 text-center mb-8">
Reset your TransHire account password
</p>

{/* Message */}

{message && (
<div className="mb-4 text-green-200 bg-green-500/20 border border-green-500/30 p-3 rounded-xl text-sm">
{message}
</div>
)}

{error && (
<div className="mb-4 text-red-200 bg-red-500/20 border border-red-500/30 p-3 rounded-xl text-sm">
{error}
</div>
)}

{/* STEP 1 */}

{step===1 && (

<div className="space-y-5">

<input
type="email"
value={email}
onChange={(e)=>setEmail(e.target.value)}
placeholder="Enter your email"
className="w-full p-3 rounded-xl bg-black/40 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
/>

<button
onClick={handleSendOTP}
className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:shadow-lg hover:shadow-indigo-500/30 transition"
>
Send Reset Link
</button>

</div>

)}

{/* STEP 2 */}

{step===2 && (

<div className="space-y-5">

<div className="flex justify-between gap-2">

{[...Array(6)].map((_, index) => (

<input
key={index}
type="text"
maxLength="1"
value={otp[index] || ""}
onChange={(e) => {
  const value = e.target.value.replace(/[^0-9]/g, "");
  const newOtp = otp.split("");
  newOtp[index] = value;
  setOtp(newOtp.join(""));

  // auto focus next
  if (value && e.target.nextSibling) {
    e.target.nextSibling.focus();
  }
}}
onKeyDown={(e) => {
  if (e.key === "Backspace" && !otp[index] && e.target.previousSibling) {
    e.target.previousSibling.focus();
  }
}}
className="w-12 h-12 text-center text-lg rounded-xl bg-black/40 border border-white/20 text-white focus:outline-none focus:border-indigo-500"
/>

))}

</div>

{timer>0 ? (

<p className="text-sm text-gray-400">
OTP expires in {formatTime(timer)}
</p>

):(

<button
onClick={handleSendOTP}
className="text-sm text-indigo-400 underline"
>
Resend OTP
</button>

)}

{/* New Password */}

<div className="relative">

<input
type={showNewPass?"text":"password"}
value={newPassword}
onChange={(e)=>setNewPassword(e.target.value)}
placeholder="New Password"
className="w-full p-3 rounded-xl bg-black/40 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
/>

<button
type="button"
onClick={()=>setShowNewPass(!showNewPass)}
className="absolute right-3 top-3 text-gray-400"
>
{showNewPass ? <EyeOff size={18}/> : <Eye size={18}/>}
</button>

</div>

{/* Confirm Password */}

<div className="relative">

<input
type={showConfirmPass?"text":"password"}
value={confirmPassword}
onChange={(e)=>setConfirmPassword(e.target.value)}
placeholder="Confirm Password"
className="w-full p-3 rounded-xl bg-black/40 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
/>

<button
type="button"
onClick={()=>setShowConfirmPass(!showConfirmPass)}
className="absolute right-3 top-3 text-gray-400"
>
{showConfirmPass ? <EyeOff size={18}/> : <Eye size={18}/>}
</button>

</div>

<button
onClick={handleResetPassword}
className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold hover:shadow-lg hover:shadow-green-500/30 transition"
>
Reset Password
</button>

</div>

)}

</motion.div>
</div>


  );

}

export default ForgotPassword;
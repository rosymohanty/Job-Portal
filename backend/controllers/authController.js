const User=require("../models/User");
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");
const Application=require("../models/Application");
// REGISTER USER
const register=async(req,res)=>{
  try{
    const {name,email,password,role}=req.body;
    if(!name || !email || !password){
      return res.status(400).json({message:"All fields required"});
    }
    const userExists=await User.findOne({email});
    if(userExists){
      return res.status(400).json({message:"User already exists"});
    }
    const salt=await bcrypt.genSalt(10);
    const hashedPassword=await bcrypt.hash(password,salt);
    const user=await User.create({
      name,
      email,
      password:hashedPassword,
      role,
    });
    res.status(201).json({
      message:"User Registered Succeddfully",
      user
    });
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// LOGIN USER
const login=async(req,res)=>{
  try{
    const {email,password}=req.body;
    if(!email||!password){
      return res.status(400).json({message:"All fields required"});
    }
    const user=await User.findOne({email});
    if(!user){
      return res.status(400).json({message:"Invalid Credentials"});
    }
    const isMatch=await bcrypt.compare(password,user.password);
    if(!isMatch){
      return res.status(400).json({message:"Invalid Credentials"});
    }
    const token=jwt.sign(
      {id:user._id,role:user.role},
      process.env.JWT_SECRET,
      {expiresIn:process.env.JWT_EXPIRE}
    );
    res.status(200).json({
      message:"Login Successful",
      token,
      user:{
        _id:user._id,
        name:user.name,
        email:user.email,
        role:user.role,
      },
    });
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// REGISTER EMPLOYER
const registerEmployer=async(req,res)=>{
  try{
    const {
      name,
      email,
      password,
      companyName,
      companyWebsite,
      companyLocation
    }=req.body;
    if(!name || !email || !password || !companyName){
      return res.status(400).json({message:"All fields required"});
    }
    const employerExists=await User.findOne({email});
    if(employerExists){
      return res.status(400).json({message:"Employer already exists"});
    }
    const salt=await bcrypt.genSalt(10);
    const hashedPassword=await bcrypt.hash(password,salt);
    const employer=await User.create({
      name,
      email,
      password:hashedPassword,
      role:"employer",
      companyName,
      companyWebsite,
      companyLocation
    });
    res.status(201).json({
      message:"Employer Registerd Successfully. Waiting for Admin Approval",
      employer,
    });
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// LOGIN EMPLOYER
const loginEmployer=async(req,res)=>{
  try{
    const {email,password}=req.body;
    if(!email||!password){
      return res.status(400).json({message:"All fields required"});
    }
    const user=await User.findOne({email});
    if(!user){
      return res.status(400).json({message:"Invalide Credentials"});
    }
    const isMatch=await bcrypt.compare(password,user.password);
    if(!isMatch){
      return res.status(400).json({message:"Invalid Credentials"});
    }
    if(user.role==="employer" && !user.isApproved){
      return res.status(403).json({
        message:"Employer not approved by Admin yet",
      });
    }
    const token=jwt.sign(
      {id:user._id,role:user.role},
      process.env.JWT_SECRET,
      {expiresIn:process.env.JWT_EXPIRE}
    );
    res.status(200).json({
      message:"Login Succeddful",
      token,
      user:{
        _id:user._id,
        name:user.name,
        email:user.email,
        role:user.role,
      },
    });
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// GET PROFILE
const getProfile=async(req,res)=>{
  try{
    const user=req.user;
    res.status(200).json({
      message:"Profile fetched successfully",
      user,
    });
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
//UPDATE PROFILE
const updateProfile=async(req,res)=>{
  try{
    const userId=req.user._id;
    const{
      name,
      companyName,
      companyWebsite,
      companyLocation,
    }=req.body;
    const user=await User.findById(userId);
    if(!user){
      return res.status(404).json({message:"User not foumd"});
    }
    if(name)user.name=name;
    if(user.role==="employer"){
      if(companyName)user.companyName=companyName;
      if(companyWebsite)user.companyWebsite=companyWebsite;
      if(companyLocation)user.companyLocation=companyLocation;
    }
    const updatedUser=await user.save();
    res.status(200).json({
      message:"Profile Updated Successfully",
      user:{
        _id:updatedUser._id,
        name:updatedUser.name,
        email:updatedUser.email,
        role:updatedUser.role,
        companyName:updatedUser.companyName,
        companyWebsite:updatedUser.companyWebsite,
        companyLocation:updatedUser.companyLocation,
      },
    });
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// CHANGE PASSWORD
const changePassword=async(req,res)=>{
  try{
    const userId=req.user._id;
    const {oldPassword,newPassword}=req.body;
    if(!oldPassword||!newPassword){
      return res.status(400).json({message:"All fields required"});
    }
    if(newPassword.length<6){
      return res.status(400).json({
        message:"Password must be at least 6 characters",
      });
    }
    const user=await User.findById(userId);
    if(!user){
      return res.status(400).json({message:"User not found"});
    }
    const isMatch=await bcrypt.compare(oldPassword,user.password);
    if(!isMatch){
      return res.status(400).json({message:"Old password is incorrect"});
    }
    const salt=await bcrypt.genSalt(10);
    user.password=await bcrypt.hash(newPassword,salt);
    await user.save();
    res.status(200).json({
      message:"Password changed successfully",
    });
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// UPLOAD RESUME 
const uploadResume=async(req,res)=>{
  try{
    const userId=req.user._id;
    if(!req.file){
      return res.status(400).json({message:"No file uploaded"});
    }
    const user=await User.findById(userId);
    if(!user){
      return res.status(404).json({message:"User not found"});
    }
    user.resume=req.file.path;
    await user.save();
    res.status(200).json({
      message:"Resume uploaded succesfully",
      resumePath:user.resume,
    });
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// UPDATE PROFILE
const updateUserProfile=async(req,res)=>{
  try{
    const userId=req.user._id;
    if(req.user.role!=="user"){
      return res.status(403).json({
        message:"Access denied. Only job seekers can update this profile.",
      });
    }
    const {name,phone,bio,skills}=req.body;
    const user=await User.findById(userId);
    if(!user){
      return res.status(404).json({message:"User not found"});
    }
    if(name)user.name=name;
    if(phone)user.phone=phone;
    if(bio)user.bio=bio;
    if(skills)user.skills=skills;
    const updatedUser=await user.save();
    res.status(200).json({
      message:"User profile updated successfully",
      user:{
        _id:updatedUser._id,
        name:updatedUser.name,
        email:updatedUser.email,
        phone:updatedUser.phone,
        bio:updatedUser.bio,
        skills:updatedUser.skills,
        resume:updatedUser.resume,
      },
    });
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// DELETE ACCOUNT
const deleteUserAccount=async(req,res)=>{
  try{
    const userId=req.user._id;
    if(req.user.role!=="user"){
      return res.status(403).json({
        message:"Access denied. Only job seekers can delete this account.",
      });
    }
      const user=await User.findById(userId);
      if(!user){
        return res.status(404).json({message:"User not found"});
      }
      await Application.deleteMany({applicant:userId});
      await User.findByIdAndDelete(userId);
      res.status(200).json({
        message:"User account and related applications deleted successfully"
      });
    }catch(error){
      res.status(500).json({message:error.message});
    }
  }
module.exports={register,login,registerEmployer,getProfile,updateProfile,updateUserProfile,changePassword,uploadResume,deleteUserAccount};
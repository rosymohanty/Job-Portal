const mongoose=require("mongoose");
const userSchema=new mongoose.Schema({
  name:{
    type:String,
    required:true,
  },
  email:{
    type:String,
    required:true,
    unique:true,
  },
  password:{
    type:String,
    required:true,
  },
  role:{
    type:String,
    enum:["user","employer","admin"],
    default:"user",
  },
  companyName:{
    type:String,
  },
  companyWebsite:{
    type:String,
  },
  companyLocation:{
    type:String,
  },
  isApproved:{
    type:Boolean,
    default:true,
  },
  resume:{
    type:String
  },
  phone:{
    type:String
  },
  bio:{
    type:String
  },
  skills:{
    type:String
  },
  savedJobs: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
  },
],
},
{timestamps:true}
);
module.exports=mongoose.model("User",userSchema);
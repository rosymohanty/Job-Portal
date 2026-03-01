const mongoose=require("mongoose");
const statusHistorySchema=new mongoose.Schema(
  {
    status:{
      type:String,
      enum:[
        "Applied",
        "Under Review",
        "Shortlisted",
        "Interview Scheduled",
        "Selected",
        "Rejected",
      ],
    },
    changedAt:{
      type:Date,
      default:Date.now,
    },
    changedBy:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"User",
    },
  },
  {_id:false}
);
const applicationSchema=new mongoose.Schema(
  {
    job:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"Job",
      required:true,
    },
    applicant:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"User",
      required:true,
    },
    resume:{
      type:String,
    },
    status: {
  type: String,
  enum: ["Applied","Under Review","Shortlisted", "Interview Scheduled","Selected", "Rejected"],
  default: "Applied"
  },
  statusHistory:[statusHistorySchema],
  employerNote:String,
  },
  {timestamps:true}
);
module.exports=mongoose.model("Application",applicationSchema);
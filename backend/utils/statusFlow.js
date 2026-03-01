const allowedTransitions={
  Applied:["Under Review","Rejected"],
  "Under Review":["Shortlisted","Rejected"],
  Shortlisted:["Interview Scheduled","Rejected"],
  "Interview Scheduled":["Selected","Rejected"],
  Selected:[],
  Rejected:[],
};
module.exports={allowedTransitions};
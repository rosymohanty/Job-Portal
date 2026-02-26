const multer=require("multer");
const path=require("path");
const storage=multer.diskStorage({
  destination:(req,file,cb)=>{
    cb(null,"uploads/resume");
  },
  filename:(req,file,cb)=>{
    cb(null,Date.now()+"-"+file.originalname);
  },
});
const fileFilter=(req,file,cb)=>{
  const allowedTypes=/pdf|doc|docx/;
  const extname=allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype=allowedTypes.test(file.mimetype);
  if(extname&&mimetype){
    cb(null,true);
  }else{
    cb("Only PDF,DOC,DOCX files allowed");
  }
  };
  const upload=multer({
    storage,
    fileFilter
  });
module.exports=upload;
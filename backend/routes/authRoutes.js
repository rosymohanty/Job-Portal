const express=require("express");
const router=express.Router();
const {register,login,registerEmployer,updateProfile,changePassword, uploadResume, updateUserProfile, deleteUserAccount}=require("../controllers/authController");
const {protect, authorizeRoles}=require("../middleware/authMiddleware");
const {getProfile}=require("../controllers/authController");
const upload = require("../middleware/uploadMiddleware");
router.post("/register",register);
router.post("/login",login);
router.post("/register-employer",registerEmployer);
router.get("/profile",protect,getProfile);
router.put("/profile",protect,updateProfile);
router.put("/update-user-profile",protect,authorizeRoles("user"),updateUserProfile);
router.put("/change-password",protect,changePassword);
router.post("/upload-resume",protect,authorizeRoles("user"),upload.single("resume"),uploadResume);
router.delete("/delete-account",protect,authorizeRoles("user"),deleteUserAccount);

module.exports=router;
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
{
  name: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  password: {
    type: String,
    required: true
  },

  resetOTP: {
    type: String
  },

  otpExpire: {
    type: Date
  },

  role: {
    type: String,
    enum: ["user", "employer", "admin"],
    default: "user"
  },

  companyName: {
    type: String,
    trim: true
  },

  companyWebsite: {
    type: String,
    trim: true
  },

  companyLocation: {
    type: String,
    trim: true
  },

  isApproved: {
    type: Boolean,
    default: true
  },

  resume: {
    type: String,
    trim: true
  },

  phone: {
    type: String,
    trim: true
  },

  bio: {
    type: String,
    trim: true
  },

  skills: [
    {
      type: String,
      trim: true
    }
  ],

  savedJobs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job"
    }
  ]

},
{
  timestamps: true
}
);

// Only keep this index
userSchema.index({ role: 1 });

module.exports = mongoose.model("User", userSchema);
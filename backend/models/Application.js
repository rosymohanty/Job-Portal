const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    resume: {
      type: String,
      required: true, // Added required since resume is essential
      trim: true,
    },
    coverLetter: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Reviewed", "Shortlisted", "Accepted", "Rejected"],
      default: "Pending",
      index: true,
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Prevent duplicate applications (your original was correct)
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

// Additional useful index
applicationSchema.index({ employer: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model("Application", applicationSchema);
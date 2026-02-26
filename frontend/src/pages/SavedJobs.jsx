import React, { useEffect, useState } from "react";
import axios from "../utils/axios";
import { motion } from "framer-motion";

const SavedJobs = () => {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const fetchSaved = async () => {
      try {
        const { data } = await axios.get("/jobs/saved");
        setJobs(data.savedJobs || []);
      } catch (error) {
        console.error(error);
      }
    };

    fetchSaved();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white pt-28 px-8">
      <h1 className="text-3xl font-bold mb-10 text-center">
        ❤️ Saved Jobs
      </h1>

      {jobs.length === 0 ? (
        <p className="text-center text-gray-400">
          No saved jobs yet.
        </p>
      ) : (
        <div className="grid md:grid-cols-3 gap-8">
          {jobs.map((job) => (
            <motion.div
              key={job._id}
              className="bg-white/10 p-6 rounded-2xl"
            >
              <h2 className="text-xl font-bold">
                {job.title}
              </h2>
              <p>{job.location}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedJobs;
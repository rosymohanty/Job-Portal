import React, { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../utils/axios";
import toast from "react-hot-toast";

const ResetPassword = () => {

  const { token } = useParams();
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      const { data } = await axios.post(`/auth/reset-password/${token}`, {
        password
      });

      toast.success(data.message);

    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-indigo-950 to-purple-950 px-4">

      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8">

        <h2 className="text-3xl text-white font-bold mb-6 text-center">
          Reset Password
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            type="password"
            placeholder="New Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-xl bg-black/40 border border-white/20 text-white"
          />

          <button className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white">
            Reset Password
          </button>

        </form>

      </div>

    </div>
  );
};

export default ResetPassword;
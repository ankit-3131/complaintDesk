import React, { useState } from "react";
import toast from "react-hot-toast";
import signup_API from "../api/userApi";

const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*]{6,}$/;

function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    locality: "",
    phone: "",
    profilePicture: "",
    role: "Citizen",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (!form.name || !form.email || !form.password || !form.locality) {
      toast.error("All mandatory fields must be filled");
      return false;
    }
    if (!emailRegex.test(form.email)) {
      toast.error("Invalid email format");
      return false;
    }
    if (!passwordRegex.test(form.password)) {
      toast.error(
        "Password must be at least 6 characters, include a letter and a number"
      );
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
        console.log(form);
        
      const res = await signup_API(form);
      toast.success(res.message || "Signup successful!");

      setForm({
        name: "",
        email: "",
        password: "",
        locality: "",
        phone: "",
        profilePicture: "",
        role: "Citizen",
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
      Navigate("/user/login");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 p-4">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-6 w-full max-w-md p-8 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl"
      >
        <h2 className="text-white text-2xl font-bold text-center">
          Sign Up
        </h2>

        <input
          type="text"
          name="name"
          placeholder="Name *"
          value={form.name}
          onChange={handleChange}
          className="px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <input
          type="email"
          name="email"
          placeholder="Email *"
          value={form.email}
          onChange={handleChange}
          className="px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <input
          type="password"
          name="password"
          placeholder="Password *"
          value={form.password}
          onChange={handleChange}
          className="px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <input
          type="text"
          name="locality"
          placeholder="Locality *"
          value={form.locality}
          onChange={handleChange}
          className="px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <input
          type="tel"
          name="phone"
          placeholder="Phone (optional)"
          value={form.phone}
          onChange={handleChange}
          className="px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <input
          type="text"
          name="profilePicture"
          placeholder="Profile Picture URL (optional)"
          value={form.profilePicture}
          onChange={handleChange}
          className="px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className="px-4 py-2 rounded-lg bg-white/20 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="Citizen">Citizen</option>
          <option value="Staff">Staff</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          className="py-3 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Signing Up..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
}

export default Signup;

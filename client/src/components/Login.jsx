import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {login_API} from "../api/userApi";

const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*]{6,}$/;

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (!form.email || !form.password) {
      toast.error("All fields are mandatory");
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
      const res = await login_API(form);
      toast.success(res.message || "Login successful!");
      navigate("/"); // redirect to homepage
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800">
      
      {/* Navbar */}
      <div className="flex justify-between items-center p-6 backdrop-blur-md bg-white/10 border border-white/20 rounded-xl m-4 shadow-lg">
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold hover:scale-105 transition-transform"
        >
          Home
        </button>

        <button
          onClick={() => navigate("/signup")}
          className="px-4 py-2 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold hover:scale-105 transition-transform"
        >
          Sign Up
        </button>
      </div>

      {/* Login Form */}
      <div className="flex items-center justify-center flex-1 p-4">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-6 w-full max-w-md p-8 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl"
        >
          <h2 className="text-white text-2xl font-bold text-center">Login</h2>

          <input
            type="email"
            name="email"
            placeholder="Email *"
            value={form.email}
            onChange={handleChange}
            className="px-4 py-2 rounded-lg bg-white/10 backdrop-blur-md text-white placeholder-white/60 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <input
            type="password"
            name="password"
            placeholder="Password *"
            value={form.password}
            onChange={handleChange}
            className="px-4 py-2 rounded-lg bg-white/10 backdrop-blur-md text-white placeholder-white/60 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <button
            type="submit"
            disabled={loading}
            className="py-3 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold hover:scale-105 transition-transform disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Logging In..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;

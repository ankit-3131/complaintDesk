import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { login_API } from "../api/userApi";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";

const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*]{6,}$/;

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (!form.email || !form.password) {
      toast.error("Please enter both email and password");
      return false;
    }
    if (!emailRegex.test(form.email)) {
      toast.error("Please enter a valid email address");
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
      if (!res) return;
      toast.success(res.message || "Login successful!");
      if (res?.token) localStorage.setItem("token", res.token);
      navigate("/");
      window.location.reload();
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role) => {
    const demoCredentials =
      role === "Staff"
        ? { email: "ankit@gmail.com", password: "kanak@1234" }
        : { email: "kanak@gmail.com", password: "kanak@1234" };

    setForm(demoCredentials);
    setLoading(true);
    try {
      const res = await login_API(demoCredentials);
      if (!res) return;
      toast.success(res.message || `Signed in as Demo ${role}!`);
      if (res?.token) localStorage.setItem("token", res.token);
      navigate("/");
      window.location.reload();
    } catch (err) {
      toast.error(err.response?.data?.message || "Demo login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
      {/* Background Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-b from-indigo-600/15 via-cyan-500/10 to-transparent blur-3xl opacity-70" />
        <div className="absolute top-1/3 -right-40 w-[450px] h-[450px] bg-blue-600/10 blur-3xl rounded-full" />
      </div>

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-900/60 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium text-slate-300 hover:text-white bg-slate-800/40 hover:bg-slate-800 border border-slate-700/60 transition-all hover:scale-105 active:scale-95"
          >
            <ArrowBackIcon className="!text-sm text-slate-400" />
            <span>Back to Dashboard</span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 hidden sm:inline">Don't have an account?</span>
            <Link
              to="/signup"
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 shadow-md shadow-indigo-600/25 transition-all hover:scale-105 active:scale-95"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* Main Login Card Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10">
        <div className="w-full max-w-md p-8 sm:p-10 rounded-3xl bg-slate-900/85 backdrop-blur-2xl border border-slate-800/90 shadow-2xl shadow-black/80 flex flex-col gap-6 relative overflow-hidden">
          
          {/* Top Decorative Border Accent */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-500" />

          {/* Card Header */}
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-500 p-[1px] shadow-lg shadow-indigo-500/30 flex items-center justify-center mb-4">
              <div className="w-full h-full bg-slate-950 rounded-[15px] flex items-center justify-center">
                <AssignmentOutlinedIcon className="text-cyan-400 !text-2xl" />
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome Back
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1.5 leading-relaxed">
              Enter your credentials to access ComplaintDesk operations
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Email Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Email Address <span className="text-cyan-400">*</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                  <MailOutlineIcon className="!text-lg" />
                </div>
                <input
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/70 border border-slate-700/80 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/70 hover:border-slate-600/80 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">
                  Password <span className="text-cyan-400">*</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-cyan-400/90 hover:text-cyan-300 hover:underline transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                  <LockOutlinedIcon className="!text-lg" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-slate-800/70 border border-slate-700/80 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/70 hover:border-slate-600/80 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <VisibilityOff className="!text-lg" />
                  ) : (
                    <Visibility className="!text-lg" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 shadow-lg shadow-indigo-600/25 hover:shadow-cyan-500/35 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowForwardIcon className="!text-sm" />
                </>
              )}
            </button>

            {/* Quick Demo Access Divider */}
            <div className="relative flex items-center justify-center my-0.5">
              <div className="border-t border-slate-800 w-full" />
              <span className="bg-slate-900/95 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap">
                or Quick Demo Access
              </span>
              <div className="border-t border-slate-800 w-full" />
            </div>

            {/* Demo Login Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={loading}
                onClick={() => handleDemoLogin("Citizen")}
                className="p-3 rounded-2xl text-left bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/60 hover:shadow-lg hover:shadow-cyan-500/10 transition-all flex items-center gap-2.5 group disabled:opacity-50 hover:-translate-y-0.5 active:translate-y-0"
              >
                <div className="w-8 h-8 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center group-hover:bg-cyan-500/25 shrink-0">
                  <PersonOutlineIcon className="!text-base" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="block text-xs font-bold text-white leading-tight">Demo Citizen</span>
                  <span className="block text-[10px] text-slate-400 truncate mt-0.5 font-mono">kanak@gmail.com</span>
                </div>
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => handleDemoLogin("Staff")}
                className="p-3 rounded-2xl text-left bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 hover:border-indigo-500/60 hover:shadow-lg hover:shadow-indigo-500/10 transition-all flex items-center gap-2.5 group disabled:opacity-50 hover:-translate-y-0.5 active:translate-y-0"
              >
                <div className="w-8 h-8 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center group-hover:bg-indigo-500/25 shrink-0">
                  <BadgeOutlinedIcon className="!text-base" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="block text-xs font-bold text-white leading-tight">Demo Staff</span>
                  <span className="block text-[10px] text-slate-400 truncate mt-0.5 font-mono">ankit@gmail.com</span>
                </div>
              </button>
            </div>
          </form>

          {/* Card Footer */}
          <div className="pt-4 border-t border-slate-800/80 text-center">
            <p className="text-xs text-slate-400">
              New to ComplaintDesk?{" "}
              <Link to="/signup" className="font-semibold text-cyan-400 hover:text-cyan-300 hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Login;

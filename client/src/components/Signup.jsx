import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { signup_API } from "../api/userApi";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+=-]{6,}$/;
const validStaffIds = ["STAFF123", "STAFF456", "STAFF789"];

function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    locality: "",
    phone: "",
    profilePicture: "",
    role: "Citizen",
  });

  const [staffId, setStaffId] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRoleSelect = (role) => {
    setForm((prev) => ({ ...prev, role }));
  };

  const validate = () => {
    if (!form.name.trim() || !form.email.trim() || !form.password || !form.locality.trim()) {
      toast.error("All required fields must be filled");
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

    if (form.role === "Staff") {
      if (!staffId.trim()) {
        toast.error("Staff ID is required for staff signup");
        return false;
      }
      if (!validStaffIds.includes(staffId.trim())) {
        toast.error("Invalid Staff ID. (Valid Demo IDs: STAFF123, STAFF456, STAFF789)");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const { name, email, password, locality, phone, profilePicture, role } = form;
      const res = await signup_API({
        name: name.trim(),
        email: email.trim(),
        password,
        locality: locality.trim(),
        phone: phone.trim(),
        profilePicture: profilePicture.trim(),
        role,
      });

      if (!res) return;

      toast.success(res.message || "Signup successful! Please sign in.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
      {/* Background Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-b from-indigo-600/15 via-cyan-500/10 to-transparent blur-3xl opacity-70" />
        <div className="absolute top-1/2 -right-40 w-[500px] h-[500px] bg-blue-600/10 blur-3xl rounded-full" />
        <div className="absolute bottom-10 -left-40 w-[450px] h-[450px] bg-indigo-600/10 blur-3xl rounded-full" />
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
            <span className="text-xs text-slate-400 hidden sm:inline">Already have an account?</span>
            <Link
              to="/login"
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 hover:text-cyan-400 shadow-sm transition-all hover:scale-105 active:scale-95"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Main Signup Card Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10">
        <div className="w-full max-w-2xl p-6 sm:p-8 rounded-3xl bg-slate-900/85 backdrop-blur-2xl border border-slate-800/90 shadow-2xl shadow-black/80 flex flex-col gap-5 relative overflow-hidden my-2 sm:my-4">
          
          {/* Top Decorative Border Accent */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-500" />

          {/* Card Header */}
          <div className="flex flex-col items-center text-center">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-500 p-[1px] shadow-lg shadow-indigo-500/30 flex items-center justify-center mb-2.5">
              <div className="w-full h-full bg-slate-950 rounded-[15px] flex items-center justify-center">
                <PersonAddOutlinedIcon className="text-cyan-400 !text-xl" />
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Create an Account
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed max-w-md">
              Join ComplaintDesk to report, track, and resolve local civic issues in your area
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Account Role Selector */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-300">
                Select Account Role <span className="text-cyan-400">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Citizen Option */}
                <button
                  type="button"
                  onClick={() => handleRoleSelect("Citizen")}
                  className={`p-3.5 rounded-2xl border text-left transition-all duration-200 relative flex items-start gap-3 ${
                    form.role === "Citizen"
                      ? "bg-gradient-to-br from-indigo-950/60 to-slate-900 border-cyan-500/60 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/30"
                      : "bg-slate-800/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800/70"
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      form.role === "Citizen"
                        ? "bg-cyan-500/20 text-cyan-400"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    <PersonOutlineIcon className="!text-lg" />
                  </div>
                  <div className="flex-1 min-w-0 pr-5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-white">Citizen</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        Default
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      Report issues, upload photos, and track resolution
                    </p>
                  </div>
                  {form.role === "Citizen" && (
                    <CheckCircleIcon className="!text-sm text-cyan-400 absolute top-3.5 right-3.5" />
                  )}
                </button>

                {/* Staff Option */}
                <button
                  type="button"
                  onClick={() => handleRoleSelect("Staff")}
                  className={`p-3.5 rounded-2xl border text-left transition-all duration-200 relative flex items-start gap-3 ${
                    form.role === "Staff"
                      ? "bg-gradient-to-br from-indigo-950/60 to-slate-900 border-cyan-500/60 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/30"
                      : "bg-slate-800/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800/70"
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      form.role === "Staff"
                        ? "bg-indigo-500/20 text-indigo-400"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    <BadgeOutlinedIcon className="!text-lg" />
                  </div>
                  <div className="flex-1 min-w-0 pr-5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-white">Department Staff</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      Assigned to resolve, update, and manage grievances
                    </p>
                  </div>
                  {form.role === "Staff" && (
                    <CheckCircleIcon className="!text-sm text-cyan-400 absolute top-3.5 right-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* If Staff: Staff ID Verification Input */}
            {form.role === "Staff" && (
              <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 flex flex-col gap-2.5 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                    <BadgeOutlinedIcon className="!text-sm text-indigo-400" />
                    <span>Staff Verification ID</span> <span className="text-cyan-400">*</span>
                  </label>
                  <span className="text-[11px] text-slate-400">Required for official staff role</span>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-indigo-400">
                    <BadgeOutlinedIcon className="!text-base" />
                  </div>
                  <input
                    type="text"
                    placeholder="Enter Staff ID (e.g. STAFF123)"
                    value={staffId}
                    onChange={(e) => setStaffId(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-indigo-500/40 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all font-mono"
                  />
                </div>
                <div className="flex items-center gap-2 pt-0.5 flex-wrap">
                  <span className="text-[11px] text-slate-400">Available demo IDs:</span>
                  {validStaffIds.map((id) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setStaffId(id)}
                      className="px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-indigo-500/20 hover:bg-indigo-500/35 text-indigo-300 border border-indigo-500/30 transition-colors"
                    >
                      {id}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Full Name <span className="text-cyan-400">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                    <PersonOutlineIcon className="!text-lg" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    placeholder="e.g. Sarah Connor"
                    value={form.name}
                    onChange={handleChange}
                    autoComplete="name"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/70 border border-slate-700/80 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/70 hover:border-slate-600/80 transition-all"
                  />
                </div>
              </div>

              {/* Email */}
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

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Password <span className="text-cyan-400">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                    <LockOutlinedIcon className="!text-lg" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Min 6 chars (letter & number)"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="new-password"
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

              {/* Locality */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Locality / Neighborhood <span className="text-cyan-400">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                    <LocationOnOutlinedIcon className="!text-lg" />
                  </div>
                  <input
                    type="text"
                    name="locality"
                    placeholder="e.g. Sector 14, Downtown"
                    value={form.locality}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/70 border border-slate-700/80 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/70 hover:border-slate-600/80 transition-all"
                  />
                </div>
              </div>

              {/* Phone (Optional) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Phone Number <span className="text-slate-500 font-normal">(optional)</span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                    <PhoneOutlinedIcon className="!text-lg" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="e.g. +1 555-0199"
                    value={form.phone}
                    onChange={handleChange}
                    autoComplete="tel"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/70 border border-slate-700/80 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/70 hover:border-slate-600/80 transition-all"
                  />
                </div>
              </div>

              {/* Profile Picture URL (Optional) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Avatar Image URL <span className="text-slate-500 font-normal">(optional)</span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                    <AddPhotoAlternateOutlinedIcon className="!text-lg" />
                  </div>
                  <input
                    type="url"
                    name="profilePicture"
                    placeholder="https://images.unsplash.com/..."
                    value={form.profilePicture}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/70 border border-slate-700/80 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/70 hover:border-slate-600/80 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 shadow-lg shadow-indigo-600/25 hover:shadow-cyan-500/35 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowForwardIcon className="!text-sm" />
                </>
              )}
            </button>
          </form>

          {/* Card Footer */}
          <div className="pt-4 border-t border-slate-800/80 text-center">
            <p className="text-xs text-slate-400">
              Already registered on ComplaintDesk?{" "}
              <Link to="/login" className="font-semibold text-cyan-400 hover:text-cyan-300 hover:underline">
                Sign in to your account
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Signup;

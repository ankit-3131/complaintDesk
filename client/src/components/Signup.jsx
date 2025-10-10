import React, { useState } from "react";
import toast from "react-hot-toast";
import { signup_API } from "../api/userApi";
import { useNavigate } from "react-router";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+=-]{6,}$/;
const validStaffIds = ["STAFF123", "STAFF456", "STAFF789"];

function Signup() {
  const Navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    locality: "",
    phone: "",
    profilePicture: "",
    role: "Citizen",
  });

  const [staffId, setStaffId] = useState(""); // separate from form
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

    if (form.role === "Staff") {
      if (!staffId.trim()) {
        toast.error("Staff ID is required for staff signup");
        return false;
      }
      if (!validStaffIds.includes(staffId.trim())) {
        toast.error("Invalid Staff ID");
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
        name,
        email,
        password,
        locality,
        phone,
        profilePicture,
        role,
      });

      toast.success(res.message || "Signup successful!");
      Navigate("/login");

      setForm({
        name: "",
        email: "",
        password: "",
        locality: "",
        phone: "",
        profilePicture: "",
        role: "Citizen",
      });
      setStaffId("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 p-4">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-6 w-full max-w-md p-8 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl"
      >
        <h2 className="text-white text-2xl font-bold text-center">Sign Up</h2>

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

        {form.role === "Staff" && (
          <input
            type="text"
            placeholder="Enter Staff ID *"
            value={staffId}
            onChange={(e) => setStaffId(e.target.value)}
            className="px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        )}

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

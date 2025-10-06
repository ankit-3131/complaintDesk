import React, { useState } from "react";
import { TextField, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import createTicket from "../api/ticketApi";
import toast from "react-hot-toast";
import axios from "axios";
import { useEffect } from "react";


function CreateTicket() {
    const [citizenId, setCitizenId] = useState(null);
    useEffect(() => {
    axios.get("http://localhost:3000/user/me", { withCredentials: true })
      .then(res => setCitizenId(res.data.id))
      .catch(err => console.error(err));
  }, []);

  const [form, setForm] = useState({
    title: "",
    description: "",
    citizenId: "", 
    category: "",
    priority: "Low",
    evidence: ""
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        setForm({ ...form, citizenId: citizenId });
        console.log(citizenId);
        
      const ticketData = { ...form };
      if (ticketData.evidence) {
        ticketData.evidence = [{ url: ticketData.evidence }];
      } else {
        delete ticketData.evidence;
      }
      const res = await createTicket(ticketData);
      if (res && res.success) {
        toast.success("Ticket created successfully!");
        navigate("/");
      } else {
        toast.error(res?.message || "Failed to create ticket");
      }
    } catch (err) {
      toast.error("Error creating ticket due to server issue");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black/90 p-6">
      <form
  onSubmit={handleSubmit}
  className="flex flex-col gap-6 bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-md mx-auto border border-white/20"
>
  <h2 className="text-white text-2xl font-extrabold text-center mb-2">
    Create Ticket
  </h2>

  <input
    type="text"
    name="title"
    placeholder="Title"
    value={form.title}
    onChange={handleChange}
    required
    className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40"
  />

  <textarea
    name="description"
    placeholder="Description"
    value={form.description}
    onChange={handleChange}
    required
    rows={3}
    className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 resize-none"
  />

  <input
    type="text"
    name="category"
    placeholder="Category"
    value={form.category}
    onChange={handleChange}
    required
    className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40"
  />

  <select
    name="priority"
    value={form.priority}
    onChange={handleChange}
    required
    className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-white/40"
  >
    <option className="bg-[#1a1a1a]" value="Low">Low</option>
    <option className="bg-[#1a1a1a]" value="Medium">Medium</option>
    <option className="bg-[#1a1a1a]" value="High">High</option>
  </select>

  <input
    type="text"
    name="evidence"
    placeholder="Evidence Image URL"
    value={form.evidence}
    onChange={handleChange}
    className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40"
  />

  <button
    type="submit"
    className="w-full py-3 rounded-lg bg-white/10 border border-white/20 text-white font-semibold hover:scale-105 hover:bg-white/20 transition-all duration-300"
  >
    Submit Ticket
  </button>
</form>

    </div>
  );
}

export default CreateTicket;

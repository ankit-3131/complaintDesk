import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import createTicket from "../api/ticketApi";
import toast from "react-hot-toast";
import axios from "axios";
import "./CreateTicket.css";

function CreateTicket() {
  const [citizenId, setCitizenId] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:3000/user/me", { withCredentials: true })
      .then((res) => setCitizenId(res.data.id))
      .catch((err) => console.error(err));
  }, []);

  const [form, setForm] = useState({
    title: "",
    description: "",
    citizenId: "",
    category: "",
    priority: "Low",
    evidence: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
       const resp = await axios.post("http://localhost:3000/ticket/getCategory",  { title: form.title },
  { withCredentials: true }
  );
  console.log(resp);
  console.log(resp.data);
  
      const predictedCategory = resp.data.predicted_category;
        setForm({ ...form, citizenId: citizenId, category: predictedCategory });
        console.log(citizenId);
        
      const ticketData = {
        ...form,
        citizenId: citizenId,
        category: predictedCategory,
       };
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
    <div className="page-bg flex flex-col items-center justify-center min-h-screen p-6">
      <form onSubmit={handleSubmit} className="glass-form">
        <h2 className="form-title">Create Ticket</h2>

        <div className="form-field">
          <input
            type="text"
            name="title"
            placeholder="Title"
            value={form.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-field">
          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            required
            rows={3}
          />
        </div>

        {/* <div className="form-field">
          <input
            type="text"
            name="category"
            placeholder="Category"
            value={form.category}
            onChange={handleChange}
            required
          />
        </div> */}

        <div className="form-field glass-select-wrap">
          <select
            name="priority"
            value={form.priority}
            onChange={handleChange}
            required
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>

        <div className="form-field">
          <input
            type="text"
            name="evidence"
            placeholder="Evidence Image URL"
            value={form.evidence}
            onChange={handleChange}
          />
        </div>

        <div className="submit-wrap">
          <button type="submit" className="submit-btn">
            Submit Ticket
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateTicket;

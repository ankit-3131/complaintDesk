import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import createTicket from "../api/ticketApi";
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import toast from "react-hot-toast";
import axios from "axios";
import "./CreateTicket.css";
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';


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
    location: null, // { type: 'Point', coordinates: [lng, lat] }
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

  delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

  function LocationMarker() {
    const map = useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setForm(f => ({ ...f, location: { type: 'Point', coordinates: [lng, lat] } }));
      }
    });
    return null;
  }

  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]);
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setMapCenter([pos.coords.latitude, pos.coords.longitude]);
        setForm(f => ({ ...f, location: { type: 'Point', coordinates: [pos.coords.longitude, pos.coords.latitude] } }));
      }, () => {});
    }
  }, []);

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

        <div className="form-field">
          <label className="text-sm mb-1">Select Location (click on map)</label>
          <div className="h-48 w-full rounded overflow-hidden">
            <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <LocationMarker />
              {form.location && (
                <Marker position={[form.location.coordinates[1], form.location.coordinates[0]]} />
              )}
            </MapContainer>
          </div>
          <div className="text-xs text-white/60 mt-1">{form.location ? `Lat: ${form.location.coordinates[1].toFixed(6)}, Lng: ${form.location.coordinates[0].toFixed(6)}` : 'No location selected'}</div>
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

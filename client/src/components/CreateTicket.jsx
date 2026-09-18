import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import createTicket from "../api/ticketApi";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import toast from "react-hot-toast";
import axios from "axios";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import CloseIcon from "@mui/icons-material/Close";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import AutoFixHighOutlinedIcon from "@mui/icons-material/AutoFixHighOutlined";
import MyLocationIcon from "@mui/icons-material/MyLocation";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function LocationMarker({ onSelectLocation }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onSelectLocation(lng, lat);
    },
  });
  return null;
}

function CreateTicket() {
  const navigate = useNavigate();
  const [citizenId, setCitizenId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "Low",
    evidence: [],
    location: null, // { type: 'Point', coordinates: [lng, lat] }
  });

  const [localPreviews, setLocalPreviews] = useState([]);
  const [mapCenter, setMapCenter] = useState([28.6139, 77.2090]); // Default coordinates

  useEffect(() => {
    axios
      .get(`${BACKEND_URL}/user/me`, { withCredentials: true })
      .then((res) => setCitizenId(res.data?.id || res.data?._id))
      .catch((err) => console.error("Failed to fetch current user profile", err));
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setMapCenter([lat, lng]);
          setForm((f) => ({
            ...f,
            location: { type: "Point", coordinates: [lng, lat] },
          }));
        },
        () => { }
      );
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePrioritySelect = (priority) => {
    setForm((f) => ({ ...f, priority }));
  };

  const handleLocationSelect = (lng, lat) => {
    setForm((f) => ({
      ...f,
      location: { type: "Point", coordinates: [lng, lat] },
    }));
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Show previews immediately
    const previews = files.map((f) => ({
      name: f.name,
      preview: URL.createObjectURL(f),
    }));
    setLocalPreviews((prev) => [...prev, ...previews]);

    setUploadingFiles(true);
    try {
      const sigResp = await axios.get(`${BACKEND_URL}/api/cloudinary-upload`);
      const { timestamp, signature, folder, apiKey, cloudName } = sigResp.data;
      const uploaded = [];

      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", apiKey);
        formData.append("timestamp", timestamp);
        formData.append("signature", signature);
        formData.append("folder", folder);

        const url = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;
        const upResp = await axios.post(url, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (upResp?.data?.secure_url) {
          uploaded.push({ url: upResp.data.secure_url });
        }
      }

      setForm((f) => ({ ...f, evidence: [...f.evidence, ...uploaded] }));
      toast.success(`${uploaded.length} attachment(s) uploaded successfully!`);
    } catch (err) {
      console.error("Upload error", err?.response?.data || err.message || err);
      toast.error("Error uploading evidence attachments");
    } finally {
      setUploadingFiles(false);
    }
  };

  const removeEvidence = (index) => {
    setLocalPreviews((prev) => prev.filter((_, i) => i !== index));
    setForm((f) => ({
      ...f,
      evidence: f.evidence.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Please fill in both the title and description");
      return;
    }

    setLoading(true);
    try {
      let predictedCategory = "General";
      try {
        const resp = await axios.post(
          `${BACKEND_URL}/ticket/getCategory`,
          { title: form.title },
          { withCredentials: true }
        );
        predictedCategory = resp.data?.predicted_category || "General";
      } catch (catErr) {
        console.warn("AI category classification fallback:", catErr);
      }

      const ticketData = {
        title: form.title.trim(),
        description: form.description.trim(),
        priority: form.priority,
        citizenId: citizenId,
        category: predictedCategory,
        location: form.location,
        evidence: form.evidence,
      };

      if (!ticketData.evidence || ticketData.evidence.length === 0) {
        delete ticketData.evidence;
      }

      const res = await createTicket(ticketData);
      if (res && res.success) {
        toast.success(`Complaint registered! Categorized as ${predictedCategory}`);
        navigate("/");
      } else {
        toast.error(res?.message || "Failed to create complaint");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error submitting complaint");
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
      </div>

      {/* Top Sticky Header */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-900/60 border-b border-slate-800/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium text-slate-300 hover:text-white bg-slate-800/40 hover:bg-slate-800 border border-slate-700/60 transition-all hover:scale-105 active:scale-95"
          >
            <ArrowBackIcon className="!text-sm text-slate-400" />
            <span>Back to Dashboard</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-semibold text-slate-300">New Grievance Report</span>
          </div>
        </div>
      </header>

      {/* Form Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 z-10">
        <div className="p-6 sm:p-10 rounded-3xl bg-slate-900/85 backdrop-blur-2xl border border-slate-800/90 shadow-2xl shadow-black/80 relative overflow-hidden flex flex-col gap-6">

          {/* Top Decorative Border Accent */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-500" />

          {/* Header */}
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-500 p-[1px] shadow-lg shadow-indigo-500/30 flex items-center justify-center mb-3">
              <div className="w-full h-full bg-slate-950 rounded-[15px] flex items-center justify-center">
                <AssignmentOutlinedIcon className="text-cyan-400 !text-2xl" />
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Report a Civic Issue
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-lg leading-relaxed">
              Describe the community issue, pin the exact GPS coordinates on the interactive radar, and attach photos for municipal response.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">

            {/* Title */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Issue Title <span className="text-cyan-400">*</span></span>
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <AutoFixHighOutlinedIcon className="!text-xs text-cyan-400" />
                  Auto-categorized by AI
                </span>
              </label>
              <input
                type="text"
                name="title"
                placeholder="e.g. Broken water pipeline leaking on 4th Main Road"
                value={form.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-800/70 border border-slate-700/80 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/70 hover:border-slate-600/80 transition-all"
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Detailed Description <span className="text-cyan-400">*</span>
              </label>
              <textarea
                name="description"
                rows={4}
                placeholder="Provide specific details about the issue, severity, duration, and landmarks to help responders locate it..."
                value={form.description}
                onChange={handleChange}
                required
                className="w-full p-4 rounded-xl bg-slate-800/70 border border-slate-700/80 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/70 hover:border-slate-600/80 transition-all leading-relaxed"
              />
            </div>

            {/* Priority Selector */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-300">
                Severity Level / Priority <span className="text-cyan-400">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    value: "Low",
                    label: "Low",
                    desc: "Minor inconvenience, no immediate risk",
                    color: "emerald",
                  },
                  {
                    value: "Medium",
                    label: "Medium",
                    desc: "Notable disruption or recurrent issue",
                    color: "amber",
                  },
                  {
                    value: "High",
                    label: "High",
                    desc: "Urgent, hazard to safety or infrastructure",
                    color: "rose",
                  },
                ].map((p) => {
                  const isSelected = form.priority === p.value;
                  return (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => handlePrioritySelect(p.value)}
                      className={`p-3.5 rounded-2xl border text-left transition-all duration-200 relative flex flex-col justify-between ${isSelected
                          ? p.color === "rose"
                            ? "bg-rose-500/15 border-rose-500/60 shadow-lg shadow-rose-500/10 ring-1 ring-rose-500/40"
                            : p.color === "amber"
                              ? "bg-amber-500/15 border-amber-500/60 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/40"
                              : "bg-emerald-500/15 border-emerald-500/60 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/40"
                          : "bg-slate-800/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800/70"
                        }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className={`text-xs sm:text-sm font-bold ${isSelected ? "text-white" : "text-slate-300"}`}>
                          {p.label}
                        </span>
                        <span
                          className={`w-2 h-2 rounded-full ${p.color === "rose"
                              ? "bg-rose-400"
                              : p.color === "amber"
                                ? "bg-amber-400"
                                : "bg-emerald-400"
                            }`}
                        />
                      </div>
                      <span className="text-[11px] text-slate-400 leading-snug hidden sm:inline">
                        {p.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Evidence File Upload Dropzone */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Upload Photos / Evidence <span className="text-slate-500 font-normal">(optional)</span></span>
                {uploadingFiles && (
                  <span className="text-xs text-cyan-400 animate-pulse font-medium">Uploading to cloud...</span>
                )}
              </label>

              <label className="border-2 border-dashed border-slate-700 hover:border-cyan-500/60 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-slate-800/30 hover:bg-slate-800/50 transition-all group">
                <input
                  type="file"
                  name="evidenceFiles"
                  multiple
                  accept="image/*,video/*,application/pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 group-hover:text-cyan-400 group-hover:border-cyan-500/40 transition-colors">
                  <CloudUploadOutlinedIcon className="!text-2xl" />
                </div>
                <div className="text-center">
                  <span className="text-xs sm:text-sm font-semibold text-white">Click to upload photos</span>
                  <span className="text-xs text-slate-400 block mt-0.5">Supports PNG, JPG, JPEG, and PDF files</span>
                </div>
              </label>

              {/* Previews Grid */}
              {localPreviews.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-2">
                  {localPreviews.map((p, idx) => (
                    <div key={idx} className="relative group w-20 h-20 rounded-xl overflow-hidden bg-slate-800 border border-slate-700">
                      <img src={p.preview} alt={p.name} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeEvidence(idx)}
                        className="absolute top-1 right-1 p-0.5 rounded-full bg-black/70 text-white hover:bg-rose-600 transition-colors"
                      >
                        <CloseIcon className="!text-xs" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Interactive Location Picker Map */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <LocationOnOutlinedIcon className="!text-base text-cyan-400" />
                  <span>Pin Issue Location <span className="text-cyan-400">*</span></span>
                </label>
                <span className="text-[11px] text-slate-400">Click anywhere on the map to drop a pin</span>
              </div>

              <div className="h-64 sm:h-72 w-full rounded-2xl overflow-hidden border border-slate-700/80 shadow-inner relative dark-leaflet-map">
                <MapContainer center={mapCenter} zoom={13} style={{ height: "100%", width: "100%" }}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  />
                  <LocationMarker onSelectLocation={handleLocationSelect} />
                  {form.location && (
                    <Marker position={[form.location.coordinates[1], form.location.coordinates[0]]} />
                  )}
                </MapContainer>
              </div>

              {/* Coordinates Pill */}
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <MyLocationIcon className="!text-sm text-cyan-400" />
                  <span className="text-slate-400">Pinned Location:</span>
                  <span className="font-mono text-slate-200">
                    {form.location
                      ? `${form.location.coordinates[1].toFixed(5)}° N, ${form.location.coordinates[0].toFixed(5)}° E`
                      : "No pin dropped yet (defaults to current GPS)"}
                  </span>
                </div>
                {form.location && (
                  <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Locked
                  </span>
                )}
              </div>
            </div>

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={loading || uploadingFiles}
              className="mt-2 w-full py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 shadow-lg shadow-indigo-600/25 hover:shadow-cyan-500/35 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Classifying & Submitting Complaint...</span>
                </>
              ) : (
                <>
                  <span>Submit Grievance</span>
                  <AssignmentOutlinedIcon className="!text-sm" />
                </>
              )}
            </button>
          </form>

        </div>
      </main>
    </div>
  );
}

export default CreateTicket;

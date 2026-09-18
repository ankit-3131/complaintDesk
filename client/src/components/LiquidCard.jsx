import React, { useState } from 'react';
import { addNote, updateTicket as apiUpdateTicket, resolveTicket, confirmResolution } from '../api/ticketApi';
import toast from 'react-hot-toast';
import { useUser } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import CloseIcon from '@mui/icons-material/Close';
import ImageNotSupportedOutlinedIcon from '@mui/icons-material/ImageNotSupportedOutlined';

function LiquidCard({ title, description, description2, imageUrl, onClick, role, ticket }) {
  const navigate = useNavigate();
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [loadingNote, setLoadingNote] = useState(false);
  const [loadingResolve, setLoadingResolve] = useState(false);
  const { user } = useUser();
  const currentUserId = user?.id;

  const handleEdit = async (e) => {
    e.stopPropagation();
    setLoadingEdit(true);
    try {
      const res = await apiUpdateTicket(ticket._id, { status: 'In Progress' });
      toast.success(res?.message || 'Ticket marked in progress');
      if (typeof ticket.onRefresh === 'function') ticket.onRefresh();
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Failed to update ticket');
    } finally {
      setLoadingEdit(false);
    }
  };

  const handleAddNote = async (e) => {
    e.stopPropagation();
    const note = prompt('Enter note to add to this ticket:');
    if (!note || !note.trim()) return;
    setLoadingNote(true);
    try {
      const res = await addNote(ticket._id, { notes: note.trim() });
      toast.success(res?.message || 'Note added successfully');
      if (typeof ticket.onRefresh === 'function') ticket.onRefresh();
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Failed to add note');
    } finally {
      setLoadingNote(false);
    }
  };

  const handleMarkDone = async (e) => {
    e.stopPropagation();
    if (!confirm('Mark this ticket as resolved?')) return;
    setLoadingResolve(true);
    try {
      const res = await resolveTicket(ticket._id);
      toast.success(res?.message || 'Ticket marked resolved');
      if (typeof ticket.onRefresh === 'function') ticket.onRefresh();
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Failed to resolve ticket');
    } finally {
      setLoadingResolve(false);
    }
  };

  const handleConfirm = async (e) => {
    e.stopPropagation();
    const note = prompt('Optional confirmation note:') || '';
    try {
      await confirmResolution(ticket._id, { confirm: true, note });
      toast.success('Resolution confirmed!');
      if (typeof ticket.onRefresh === 'function') ticket.onRefresh();
    } catch (err) {
      toast.error('Failed to confirm resolution');
    }
  };

  const handleDenial = async (e) => {
    e.stopPropagation();
    const note = prompt('Please provide reason for reopening ticket:') || '';
    try {
      await confirmResolution(ticket._id, { confirm: false, note });
      toast.success('Denied - Ticket reopened');
      if (typeof ticket.onRefresh === 'function') ticket.onRefresh();
    } catch (err) {
      toast.error('Failed to update resolution status');
    }
  };

  // Format creation date
  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const status = ticket.status || 'Open';
  const priority = ticket.priority || 'Low';
  const category = ticket.category || 'General';

  return (
    <div
      onClick={() => navigate(`/ticket/${ticket._id}`)}
      className="group relative flex flex-col sm:flex-row items-stretch justify-between p-5 sm:p-6 rounded-2xl bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800/80 hover:border-slate-700/90 shadow-md shadow-black/20 hover:shadow-xl hover:shadow-cyan-950/20 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer overflow-hidden"
    >
      {/* Accent glow line based on priority */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] transition-opacity duration-300 ${
        priority === 'High' 
          ? 'bg-rose-500 opacity-60 group-hover:opacity-100' 
          : priority === 'Medium' 
            ? 'bg-amber-500 opacity-40 group-hover:opacity-80' 
            : 'bg-cyan-500 opacity-30 group-hover:opacity-70'
      }`} />

      {/* Main Content Area */}
      <div className="flex flex-col justify-between flex-1 sm:pr-6 overflow-hidden">
        <div>
          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {/* Status Pill */}
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold tracking-wide border ${
              status === 'Resolved'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : status === 'In Progress'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                status === 'Resolved'
                  ? 'bg-emerald-400'
                  : status === 'In Progress'
                    ? 'bg-amber-400 animate-pulse'
                    : 'bg-cyan-400'
              }`} />
              {status}
            </span>

            {/* Priority Pill */}
            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold tracking-wide border ${
              priority === 'High'
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                : priority === 'Medium'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700/60'
            }`}>
              {priority} Priority
            </span>

            {/* Category Pill */}
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              #{category}
            </span>

            {/* Date */}
            {ticket.createdAt && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-400 ml-auto">
                <AccessTimeIcon className="!text-xs opacity-70" />
                {formatDate(ticket.createdAt)}
              </span>
            )}
          </div>

          {/* Title */}
          <h2 className="text-lg sm:text-xl font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-1">
            {title}
          </h2>

          {/* Description */}
          <p className="text-slate-300/90 text-sm leading-relaxed line-clamp-2 mt-2">
            {description}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 mt-5 pt-3 border-t border-slate-800/60">
          {/* View Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/ticket/${ticket._id}`);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-200 bg-slate-800/80 hover:bg-slate-700/90 border border-slate-700/70 hover:border-slate-600 transition-all hover:scale-105 active:scale-95 shadow-sm"
          >
            <span>View Details</span>
            <ArrowForwardIcon className="!text-xs text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Staff Actions */}
          {role === 'Staff' && (
            <div className="flex flex-wrap items-center gap-2">
              {status === 'Open' && (
                <button
                  onClick={handleEdit}
                  disabled={loadingEdit}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-60 shadow-sm"
                >
                  <AutorenewIcon className={`!text-sm ${loadingEdit ? 'animate-spin' : ''}`} />
                  <span>{loadingEdit ? 'Updating...' : 'Start Progress'}</span>
                </button>
              )}

              <button
                onClick={handleAddNote}
                disabled={loadingNote}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium text-indigo-300 bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-60 shadow-sm"
              >
                <NoteAddIcon className="!text-sm" />
                <span>{loadingNote ? 'Adding...' : 'Add Note'}</span>
              </button>

              {status !== 'Resolved' && (
                <button
                  onClick={handleMarkDone}
                  disabled={loadingResolve}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-emerald-300 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-60 shadow-sm"
                >
                  <CheckCircleOutlineIcon className="!text-sm" />
                  <span>{loadingResolve ? 'Resolving...' : 'Mark Done'}</span>
                </button>
              )}
            </div>
          )}

          {/* Citizen Confirmation Actions */}
          {role !== 'Staff' && ticket.pendingConfirmation?.pending && ticket.citizenId === currentUserId && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleConfirm}
                className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-emerald-300 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 transition-all hover:scale-105 active:scale-95 shadow-sm"
              >
                <DoneAllIcon className="!text-sm" />
                <span>Confirm Resolution</span>
              </button>

              <button
                onClick={handleDenial}
                className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-rose-300 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 transition-all hover:scale-105 active:scale-95 shadow-sm"
              >
                <CloseIcon className="!text-sm" />
                <span>Deny / Reopen</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right / Evidence Image Thumbnail */}
      <div className="w-full sm:w-44 h-36 sm:h-auto rounded-xl overflow-hidden border border-slate-800/80 bg-slate-800/30 relative flex-shrink-0 mt-4 sm:mt-0 sm:ml-4 flex items-center justify-center">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const fallback = e.currentTarget.nextElementSibling;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
        ) : null}
        
        {/* Fallback if no image or image error */}
        <div className={`w-full h-full flex flex-col items-center justify-center p-3 text-center bg-gradient-to-br from-slate-900 to-slate-800/80 ${imageUrl ? 'hidden' : 'flex'}`}>
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700/60 flex items-center justify-center text-slate-400 mb-1.5 shadow-sm">
            <ImageNotSupportedOutlinedIcon className="!text-xl text-slate-500" />
          </div>
          <span className="text-[11px] font-medium text-slate-400">No Image</span>
          <span className="text-[10px] text-slate-400">Evidence</span>
        </div>
      </div>
    </div>
  );
}

export default LiquidCard;

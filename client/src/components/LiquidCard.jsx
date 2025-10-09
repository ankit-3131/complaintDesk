import React, { useState } from 'react';
import { addNote, updateTicket as apiUpdateTicket, resolveTicket } from '../api/ticketApi';
import toast from 'react-hot-toast';


import { useNavigate } from 'react-router-dom';

function LiquidCard({ title, description, description2, imageUrl, onClick, role, ticket }) {
  const navigate = useNavigate();
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [loadingNote, setLoadingNote] = useState(false);
  const [loadingResolve, setLoadingResolve] = useState(false);

  const handleEdit = async () => {
    setLoadingEdit(true);
    try {
      const res = await apiUpdateTicket(ticket._id, { status: 'In Progress' });
      toast.success(res?.message || 'Ticket updated');
      if (typeof ticket.onRefresh === 'function') ticket.onRefresh();
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Failed to update ticket');
    } finally {
      setLoadingEdit(false);
    }
  };

  const handleAddNote = async () => {
    const note = prompt('Enter note to add');
    if (!note) return;
    setLoadingNote(true);
    try {
      const res = await addNote(ticket._id, { notes: note });
      toast.success(res?.message || 'Note added');
      if (typeof ticket.onRefresh === 'function') ticket.onRefresh();
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Failed to add note');
    } finally {
      setLoadingNote(false);
    }
  };

  const handleMarkDone = async () => {
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

  return (
    <div onClick={() => navigate(`/ticket/${ticket._id}`)} 
      className="flex w-full h-52 ml-3 mr-3 p-6 rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg hover:scale-[1.02] transition-all duration-300 overflow-hidden"
    >
      <div className="flex flex-col justify-between w-3/4 pr-6 overflow-hidden">
        <div>
          <h1 className="text-white text-xl font-bold mb-2 truncate">{title}</h1>
          <p className="text-white/80 text-sm line-clamp-3">{description2}</p>
          <hr />
          <p className="text-white/80 text-sm line-clamp-3">{description}</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/ticket/${ticket._id}`)}
            className="w-40 py-2 rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg hover:border-[#FF4040]/50 transition-all duration-300"
          >
            <p className="text-white/80 text-sm">View</p>
          </button>

          {role === 'Staff' && (
            <div className="flex gap-2">
              {ticket.status == 'Open' && (<button onClick={handleEdit} disabled={loadingEdit} className="px-3 py-2 rounded-lg bg-yellow-300/50 text-white disabled:opacity-60">{loadingEdit ? 'Please wait...' : 'Mark in progress'}</button>
              )}
              <button onClick={handleAddNote} disabled={loadingNote} className="px-3 py-2 rounded-lg bg-indigo-600/50 text-white disabled:opacity-60">{loadingNote ? 'Adding...' : 'Add Note'}</button>
              
              {ticket.status != 'Resolved' && (<button onClick={handleMarkDone} disabled={loadingResolve} className="px-3 py-2 rounded-lg bg-green-600/50 text-white disabled:opacity-60">{loadingResolve ? 'Please wait...' : 'Mark Done'}</button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="w-1/4 h-full rounded-lg overflow-hidden">
        <img
          src={imageUrl || "https://via.placeholder.com/150"}
          alt="Card illustration"
          className="w-full h-full object-cover rounded-lg"
        />
      </div>
    </div>
  );
}

export default LiquidCard;

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTicket, addNote, updateTicket, resolveTicket } from '../api/ticketApi';
import { useUser } from '../contexts/UserContext';
import toast from 'react-hot-toast';

function TicketView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const [loadingAction, setLoadingAction] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getTicket(id);
        setTicket(res.ticket);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load ticket');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) return <div className="p-8 text-white">Loading...</div>;
  if (!ticket) return <div className="p-8 text-white">Ticket not found</div>;

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white">
      <div className="max-w-4xl mx-auto bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-lg">
        <div className="flex justify-between items-start gap-4">
          <div>
            <h1 className="text-2xl font-bold">{ticket.title}</h1>
            <p className="text-white/70 mt-1">{ticket.category} • {ticket.priority} • {ticket.status}</p>
            <p className="mt-4 text-white/80">{ticket.description}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-white/70">Submitted by</div>
            <div className="font-semibold">{ticket.citizenId?.name || 'Anonymous'}</div>
            <div className="text-xs text-white/60">{ticket.citizenId?.email}</div>
          </div>
        </div>

        {/* Evidence gallery */}
        <div className="mt-6">
          <h3 className="font-bold mb-2">Evidence</h3>
          <div className="grid grid-cols-3 gap-3">
            {ticket.evidence && ticket.evidence.length > 0 ? (
              ticket.evidence.map((ev, idx) => (
                <div key={idx} className="rounded overflow-hidden h-36 w-full">
                  <img src={ev.url} alt={`evidence-${idx}`} className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300" />
                </div>
              ))
            ) : (
              <div className="text-white/60">No evidence provided.</div>
            )}
          </div>
        </div>

        {/* Timeline */}
        <div className="mt-6">
          <h3 className="font-bold mb-2">Timeline</h3>
          <div className="flex flex-col gap-3">
            {ticket.timeLine && ticket.timeLine.length > 0 ? (
              ticket.timeLine.slice().reverse().map((tl, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-white/3 border border-white/10">
                  <div className="flex justify-between">
                    <div className="font-semibold">{tl.status}</div>
                    <div className="text-xs text-white/60">{new Date(tl.timeStamp || tl.timeStamp).toLocaleString()}</div>
                  </div>
                  <div className="text-sm text-white/80 mt-1">{tl.notes}</div>
                </div>
              ))
            ) : (
              <div className="text-white/60">No timeline entries yet.</div>
            )}
          </div>
        </div>

        {user?.role === 'Staff' && (
          <div className="mt-6 flex gap-2 justify-end">
            <button disabled={loadingAction} onClick={async()=>{
              setLoadingAction(true);
              try{
                await updateTicket(id, { status: 'In Progress' });
                toast.success('Marked In Progress');
                const res = await getTicket(id); setTicket(res.ticket);
              }catch(e){ toast.error(e.response?.data?.message || 'Failed'); }
              setLoadingAction(false);
            }} className="px-4 py-2 rounded bg-yellow-500 text-black">Mark In Progress</button>

            <button disabled={loadingAction} onClick={async()=>{
              const note = prompt('Enter note'); if(!note) return;
              setLoadingAction(true);
              try{ await addNote(id, { notes: note }); toast.success('Note added'); const res = await getTicket(id); setTicket(res.ticket);}catch(e){ toast.error('Failed to add note'); }
              setLoadingAction(false);
            }} className="px-4 py-2 rounded bg-indigo-600">Add Note</button>

            <button disabled={loadingAction} onClick={async()=>{
              if(!confirm('Mark resolved?')) return;
              setLoadingAction(true);
              try{ await resolveTicket(id); toast.success('Marked resolved'); const res = await getTicket(id); setTicket(res.ticket);}catch(e){ toast.error('Failed to resolve'); }
              setLoadingAction(false);
            }} className="px-4 py-2 rounded bg-green-600">Mark Resolved</button>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button onClick={() => navigate(-1)} className="px-4 py-2 rounded bg-white/10">Back</button>
        </div>
      </div>
    </div>
  );
}

export default TicketView;

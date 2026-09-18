import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getTicket, addNote, updateTicket, resolveTicket, confirmResolution } from '../api/ticketApi';
import { useUser } from '../contexts/UserContext';
import toast from 'react-hot-toast';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CloseIcon from '@mui/icons-material/Close';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import AddCommentOutlinedIcon from '@mui/icons-material/AddCommentOutlined';
import CheckIcon from '@mui/icons-material/Check';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';

function TicketView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const [loadingAction, setLoadingAction] = useState(false);

  // Modals state
  const [previewImage, setPreviewImage] = useState(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [citizenConfirmNote, setCitizenConfirmNote] = useState('');

  const fetchTicketData = async () => {
    try {
      const res = await getTicket(id);
      setTicket(res?.ticket || null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load ticket details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketData();
  }, [id]);

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) {
      toast.error('Note cannot be empty');
      return;
    }
    setLoadingAction(true);
    try {
      await addNote(id, { notes: noteText.trim() });
      toast.success('Note added to timeline');
      setNoteText('');
      setShowNoteModal(false);
      await fetchTicketData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add note');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleResolveTicket = async () => {
    setLoadingAction(true);
    try {
      await resolveTicket(id);
      toast.success('Ticket marked as resolved');
      setShowResolveModal(false);
      await fetchTicketData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to mark as resolved');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    setLoadingAction(true);
    try {
      await updateTicket(id, { status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
      await fetchTicketData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleCitizenConfirm = async (confirmed) => {
    setLoadingAction(true);
    try {
      await confirmResolution(id, { confirm: confirmed, note: citizenConfirmNote });
      if (confirmed) {
        toast.success('Resolution confirmed! Thank you.');
      } else {
        toast.success('Marked as unresolved. Ticket has been reopened.');
      }
      setCitizenConfirmNote('');
      await fetchTicketData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit confirmation');
    } finally {
      setLoadingAction(false);
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      case 'Medium':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      default:
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Resolved':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'In Progress':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      default:
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" />
          <p className="text-sm text-slate-400 font-medium">Loading ticket details...</p>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900/80 border border-slate-800 text-center flex flex-col items-center gap-4">
          <ErrorOutlineIcon className="!text-5xl text-rose-400" />
          <h2 className="text-xl font-bold text-white">Ticket Not Found</h2>
          <p className="text-sm text-slate-400">The requested ticket does not exist or may have been deleted.</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isCitizenCreator =
    user?.id &&
    ticket?.citizenId &&
    (ticket.citizenId._id?.toString() === user.id.toString() ||
      ticket.citizenId === user.id ||
      ticket.citizenId.id === user.id);

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
      {/* Background Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/3 w-[800px] h-[400px] bg-indigo-600/10 blur-3xl opacity-60" />
        <div className="absolute top-1/2 -right-40 w-[500px] h-[500px] bg-cyan-600/10 blur-3xl rounded-full" />
      </div>

      {/* Top Sticky Header */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-900/70 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-all hover:scale-105 active:scale-95"
            >
              <ArrowBackIcon className="!text-sm text-slate-400" />
              <span>Back</span>
            </button>
            <div className="h-5 w-[1px] bg-slate-800 hidden sm:block" />
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs text-slate-400">Ticket</span>
              <span className="text-xs font-mono text-cyan-400 font-semibold">#{id.slice(-6).toUpperCase()}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(ticket.status)} flex items-center gap-1.5`}>
              <span className={`w-2 h-2 rounded-full ${ticket.status === 'Resolved' ? 'bg-emerald-400' : ticket.status === 'In Progress' ? 'bg-amber-400 animate-pulse' : 'bg-blue-400'}`} />
              {ticket.status}
            </span>

            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityBadge(ticket.priority)}`}>
              {ticket.priority} Priority
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
          
          {/* Left 2 Columns: Main Details, Evidence, Confirmations & Staff Actions */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Primary Details Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/85 backdrop-blur-2xl border border-slate-800/90 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-500" />

              <div className="flex flex-wrap items-center gap-2.5 mb-3">
                <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  {ticket.category || 'General Civic Issue'}
                </span>
                <span className="text-xs text-slate-500">•</span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <AccessTimeIcon className="!text-xs text-slate-500" />
                  {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
                {ticket.title}
              </h1>

              <div className="mt-5 p-5 rounded-2xl bg-slate-800/50 border border-slate-700/60">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Complaint Description
                </h3>
                <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {ticket.description || 'No additional details provided.'}
                </p>
              </div>

              {/* Location Coordinates if available */}
              {ticket.location?.coordinates && (
                <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                  <LocationOnOutlinedIcon className="!text-base text-cyan-400" />
                  <span>GPS Coordinates:</span>
                  <span className="font-mono text-slate-300">
                    {ticket.location.coordinates[1].toFixed(5)}° N, {ticket.location.coordinates[0].toFixed(5)}° E
                  </span>
                </div>
              )}
            </div>

            {/* Citizen Confirmation Alert Banner (if pending confirmation) */}
            {ticket.pendingConfirmation?.pending && isCitizenCreator && (
              <div className="p-6 rounded-3xl bg-amber-500/10 border border-amber-500/30 backdrop-blur-xl shadow-xl flex flex-col gap-4 relative overflow-hidden">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                    <PendingActionsIcon className="!text-xl" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-amber-300">
                      Action Required: Confirm Issue Resolution
                    </h3>
                    <p className="text-xs sm:text-sm text-amber-200/80 mt-1 leading-relaxed">
                      A municipal staff member has marked this ticket as resolved. As the reporter, please verify whether the work was completed satisfactorily on site.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-1">
                  <input
                    type="text"
                    placeholder="Optional feedback or note..."
                    value={citizenConfirmNote}
                    onChange={(e) => setCitizenConfirmNote(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900/80 border border-amber-500/30 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleCitizenConfirm(true)}
                      disabled={loadingAction}
                      className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
                    >
                      <CheckIcon className="!text-base" />
                      <span>Yes, Confirm</span>
                    </button>
                    <button
                      onClick={() => handleCitizenConfirm(false)}
                      disabled={loadingAction}
                      className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-md shadow-rose-600/20 transition-all flex items-center gap-1.5"
                    >
                      <CloseIcon className="!text-base" />
                      <span>Not Resolved</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Evidence Gallery Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/85 backdrop-blur-2xl border border-slate-800/90 shadow-xl flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ImageOutlinedIcon className="text-cyan-400 !text-xl" />
                  <h2 className="text-base sm:text-lg font-bold text-white">Submitted Evidence</h2>
                </div>
                <span className="text-xs text-slate-400">
                  {ticket.evidence?.length || 0} {ticket.evidence?.length === 1 ? 'attachment' : 'attachments'}
                </span>
              </div>

              {ticket.evidence && ticket.evidence.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 mt-2">
                  {ticket.evidence.map((ev, idx) => (
                    <div
                      key={idx}
                      onClick={() => setPreviewImage(ev.url)}
                      className="group relative h-40 rounded-2xl overflow-hidden bg-slate-800 border border-slate-700/70 cursor-pointer shadow-md hover:border-cyan-500/60 transition-all"
                    >
                      <img
                        src={ev.url}
                        alt={`Evidence ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="px-3 py-1 rounded-lg text-xs font-semibold text-white bg-slate-900/80 backdrop-blur-md border border-white/20">
                          Click to View
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 px-4 rounded-2xl bg-slate-800/30 border border-dashed border-slate-800 text-center flex flex-col items-center justify-center gap-2">
                  <ImageOutlinedIcon className="!text-3xl text-slate-600" />
                  <p className="text-xs text-slate-400">No photographic evidence was attached to this ticket.</p>
                </div>
              )}
            </div>

            {/* Staff Management Action Controls */}
            {user?.role === 'Staff' && (
              <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-950/40 via-slate-900/90 to-slate-900/90 border border-indigo-500/30 shadow-xl flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">Staff Management Controls</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Authorized operations for municipal resolvers</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    STAFF ROLE
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  {ticket.status === 'Open' && (
                    <button
                      disabled={loadingAction}
                      onClick={() => handleUpdateStatus('In Progress')}
                      className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-amber-950 bg-amber-400 hover:bg-amber-300 shadow-md shadow-amber-400/20 transition-all flex items-center gap-1.5"
                    >
                      <PendingActionsIcon className="!text-base" />
                      <span>Start Working (In Progress)</span>
                    </button>
                  )}

                  <button
                    disabled={loadingAction}
                    onClick={() => setShowNoteModal(true)}
                    className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all flex items-center gap-1.5"
                  >
                    <AddCommentOutlinedIcon className="!text-base text-cyan-400" />
                    <span>Add Progress Note</span>
                  </button>

                  {ticket.status !== 'Resolved' && (
                    <button
                      disabled={loadingAction}
                      onClick={() => setShowResolveModal(true)}
                      className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
                    >
                      <CheckCircleOutlineIcon className="!text-base" />
                      <span>Mark as Resolved</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Reporter Card & Timeline */}
          <div className="flex flex-col gap-6">
            
            {/* Reporter Profile Card */}
            <div className="p-6 rounded-3xl bg-slate-900/85 backdrop-blur-2xl border border-slate-800/90 shadow-xl flex flex-col gap-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Reporter Details
              </h3>

              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 p-[1px] shrink-0">
                  <div className="w-full h-full bg-slate-950 rounded-[15px] flex items-center justify-center font-bold text-cyan-400 text-sm">
                    {ticket.citizenId?.name ? ticket.citizenId.name.charAt(0).toUpperCase() : 'A'}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-white truncate">
                    {ticket.citizenId?.name || 'Anonymous Citizen'}
                  </h4>
                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    {ticket.citizenId?.email || 'No email registered'}
                  </p>
                </div>
              </div>

              {ticket.citizenId?.phone && (
                <div className="pt-3 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                  <span>Contact:</span>
                  <span className="font-mono text-slate-200">{ticket.citizenId.phone}</span>
                </div>
              )}
            </div>

            {/* Audit Timeline Card */}
            <div className="p-6 rounded-3xl bg-slate-900/85 backdrop-blur-2xl border border-slate-800/90 shadow-xl flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Audit Timeline
                </h3>
                <span className="text-xs text-slate-500">
                  {ticket.timeLine?.length || 0} {ticket.timeLine?.length === 1 ? 'event' : 'events'}
                </span>
              </div>

              {ticket.timeLine && ticket.timeLine.length > 0 ? (
                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-800">
                  {ticket.timeLine.slice().reverse().map((tl, idx) => (
                    <div key={idx} className="relative group">
                      {/* Timeline Node Icon */}
                      <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-slate-900 border-2 border-cyan-400 group-hover:scale-125 transition-transform" />
                      
                      <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col gap-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-white">
                            {tl.status}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {tl.timeStamp ? new Date(tl.timeStamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        </div>
                        {tl.notes && (
                          <p className="text-xs text-slate-300 mt-1 leading-relaxed whitespace-pre-wrap">
                            {tl.notes}
                          </p>
                        )}
                        <span className="text-[10px] text-slate-500 mt-1">
                          {tl.timeStamp ? new Date(tl.timeStamp).toLocaleDateString() : ''}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-500 py-4 text-center">
                  No status updates recorded yet.
                </div>
              )}
            </div>

          </div>

        </div>
      </main>

      {/* Lightbox Image Preview Modal */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[85vh] w-full rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl bg-slate-950 flex flex-col"
          >
            <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Evidence Preview</span>
              <button
                onClick={() => setPreviewImage(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <CloseIcon className="!text-lg" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-2 flex items-center justify-center">
              <img src={previewImage} alt="Expanded evidence" className="max-h-[75vh] w-auto object-contain rounded-lg" />
            </div>
          </div>
        </div>
      )}

      {/* Add Progress Note Modal */}
      {showNoteModal && (
        <div
          onClick={() => setShowNoteModal(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-md w-full p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col gap-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AddCommentOutlinedIcon className="text-cyan-400 !text-xl" />
                <h3 className="text-base font-bold text-white">Add Progress Note</h3>
              </div>
              <button
                onClick={() => setShowNoteModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <CloseIcon className="!text-lg" />
              </button>
            </div>

            <form onSubmit={handleAddNote} className="flex flex-col gap-4">
              <textarea
                rows={4}
                placeholder="Describe current status, dispatch notes, or field investigation details..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                required
                className="w-full p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/70"
              />
              <div className="flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowNoteModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loadingAction}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 shadow-md shadow-cyan-600/25 transition-all disabled:opacity-50"
                >
                  {loadingAction ? 'Saving...' : 'Save Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Resolution Modal */}
      {showResolveModal && (
        <div
          onClick={() => setShowResolveModal(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-md w-full p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircleOutlineIcon className="!text-2xl" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Mark Ticket as Resolved?</h3>
                <p className="text-xs text-slate-400 mt-0.5">This will trigger citizen confirmation request</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/50 p-3.5 rounded-xl border border-slate-700/60">
              The ticket status will be updated to <strong className="text-emerald-400">Resolved</strong>. The reporting citizen will receive a notification to verify and close out the ticket.
            </p>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowResolveModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loadingAction}
                onClick={handleResolveTicket}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/25 transition-all disabled:opacity-50"
              >
                {loadingAction ? 'Resolving...' : 'Confirm Resolution'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TicketView;

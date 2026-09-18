import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { logout_API, changePassword } from '../api/userApi';
import toast from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import KeyOutlinedIcon from '@mui/icons-material/KeyOutlined';

function Profile() {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout_API();
      localStorage.removeItem('token');
      setUser(null);
      toast.success('Logged out successfully');
      navigate('/');
      window.location.reload();
    } catch (err) {
      toast.error('Logout failed');
      console.error(err);
    } finally {
      setLoggingOut(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900/85 border border-slate-800 text-center flex flex-col items-center gap-4">
          <ShieldOutlinedIcon className="!text-5xl text-cyan-400" />
          <h2 className="text-xl font-bold text-white">Authentication Required</h2>
          <p className="text-sm text-slate-400">Please sign in to view and manage your profile settings.</p>
          <button
            onClick={() => navigate('/login')}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 shadow-md shadow-indigo-600/25 transition-all"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'U';

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
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs font-semibold text-slate-300">Account Active</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 z-10 flex flex-col gap-6">
        
        {/* User Identity Banner Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/85 backdrop-blur-2xl border border-slate-800/90 shadow-2xl shadow-black/80 relative overflow-hidden flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-500" />

          {/* Avatar / Profile Picture */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-500 p-[2px] shrink-0 shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[22px] overflow-hidden flex items-center justify-center">
              {user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <span className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  {initials}
                </span>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 text-center sm:text-left flex flex-col items-center sm:items-start">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {user.name}
              </h1>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  user.role === 'Staff'
                    ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30'
                    : 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
                }`}
              >
                {user.role || 'Citizen'}
              </span>
            </div>

            <p className="text-sm text-slate-400 mt-1">{user.email}</p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-4 text-xs text-slate-400">
              {user.locality && (
                <span className="flex items-center gap-1.5 bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-700/60">
                  <LocationOnOutlinedIcon className="!text-sm text-cyan-400" />
                  <span>{user.locality}</span>
                </span>
              )}
              {user.phone && (
                <span className="flex items-center gap-1.5 bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-700/60">
                  <PhoneOutlinedIcon className="!text-sm text-cyan-400" />
                  <span>{user.phone}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 2-Column Grid: Profile Information & Change Password */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          
          {/* Account Details Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/85 backdrop-blur-2xl border border-slate-800/90 shadow-xl flex flex-col gap-5">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
              <PersonOutlineIcon className="text-cyan-400 !text-xl" />
              <h2 className="text-base font-bold text-white">Account Details</h2>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
                <span className="text-slate-400 text-xs">Full Name</span>
                <span className="font-semibold text-white">{user.name}</span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
                <span className="text-slate-400 text-xs">Email Address</span>
                <span className="font-semibold text-white">{user.email}</span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
                <span className="text-slate-400 text-xs">Assigned Role</span>
                <span className="font-semibold text-cyan-400">{user.role || 'Citizen'}</span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
                <span className="text-slate-400 text-xs">Locality / Ward</span>
                <span className="font-semibold text-white">{user.locality || 'Not specified'}</span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
                <span className="text-slate-400 text-xs">Contact Phone</span>
                <span className="font-semibold text-white">{user.phone || 'Not specified'}</span>
              </div>
            </div>

            {/* Logout Section */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-300">Sign Out</p>
                <p className="text-[11px] text-slate-500">End active session on this device</p>
              </div>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="px-4 py-2 rounded-xl text-xs font-bold text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-600 border border-rose-500/30 transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <LogoutOutlinedIcon className="!text-sm" />
                <span>{loggingOut ? 'Signing out...' : 'Log Out'}</span>
              </button>
            </div>
          </div>

          {/* Change Password Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/85 backdrop-blur-2xl border border-slate-800/90 shadow-xl flex flex-col gap-5">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
              <KeyOutlinedIcon className="text-cyan-400 !text-xl" />
              <h2 className="text-base font-bold text-white">Security & Password</h2>
            </div>

            <ChangePasswordForm />
          </div>

        </div>
      </main>
    </div>
  );
}

function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error('Both password fields are required');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await changePassword({ currentPassword, newPassword });
      toast.success('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      {/* Current Password */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-300">
          Current Password <span className="text-cyan-400">*</span>
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-cyan-400 transition-colors">
            <LockOutlinedIcon className="!text-lg" />
          </div>
          <input
            type={showCurrent ? 'text' : 'password'}
            placeholder="Enter current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-slate-800/70 border border-slate-700/80 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/70 hover:border-slate-600/80 transition-all"
          />
          <button
            type="button"
            onClick={() => setShowCurrent(!showCurrent)}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
            tabIndex={-1}
          >
            {showCurrent ? <VisibilityOff className="!text-lg" /> : <Visibility className="!text-lg" />}
          </button>
        </div>
      </div>

      {/* New Password */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-300">
          New Password <span className="text-cyan-400">*</span>
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-cyan-400 transition-colors">
            <LockOutlinedIcon className="!text-lg" />
          </div>
          <input
            type={showNew ? 'text' : 'password'}
            placeholder="Enter new password (min 6 characters)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-slate-800/70 border border-slate-700/80 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/70 hover:border-slate-600/80 transition-all"
          />
          <button
            type="button"
            onClick={() => setShowNew(!showNew)}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
            tabIndex={-1}
          >
            {showNew ? <VisibilityOff className="!text-lg" /> : <Visibility className="!text-lg" />}
          </button>
        </div>
      </div>

      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 shadow-md shadow-indigo-600/25 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
        >
          {loading ? 'Updating Password...' : 'Save New Password'}
        </button>
      </div>
    </form>
  );
}

export default Profile;

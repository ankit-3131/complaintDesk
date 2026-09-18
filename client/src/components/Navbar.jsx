import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { logout_API } from '../api/userApi';
import toast from 'react-hot-toast';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LogoutIcon from '@mui/icons-material/Logout';
import CloseIcon from '@mui/icons-material/Close';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';

export default function Navbar({ searchValue = '', onSearchChange, showSearch = true }) {
  const navigate = useNavigate();
  const { user, loading } = useUser();
  const shouldShowSearch = showSearch && Boolean(user) && typeof onSearchChange === 'function';

  const handleLogout = async () => {
    try {
      await logout_API();
      localStorage.removeItem('token');
      toast.success('Logged out successfully');
      navigate('/');
      window.location.reload();
    } catch (e) {
      toast.error('Logout failed');
    }
  };

  const getUserInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-slate-900/80 border-b border-slate-800/80 shadow-lg shadow-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4 sm:gap-8">
        
        {/* Brand Logo */}
        <Link 
          to="/" 
          className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-xl py-1 px-1.5 -ml-1.5 transition-all"
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-500 p-[1px] shadow-md shadow-indigo-500/25 group-hover:shadow-indigo-500/40 group-hover:scale-105 transition-all duration-300">
            <div className="w-full h-full bg-slate-900 rounded-[11px] flex items-center justify-center">
              <AssignmentOutlinedIcon className="text-cyan-400 !text-xl group-hover:rotate-6 transition-transform duration-300" />
            </div>
          </div>
          
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white">
                Complaint<span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">Desk</span>
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Civic Ops
              </span>
            </div>
          </div>
        </Link>

        {/* Center Search Bar (Only shown when user is logged in) */}
        {shouldShowSearch && (
          <div className="flex-1 max-w-xl mx-2 hidden md:block">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-cyan-400 transition-colors">
                <SearchIcon className="!text-lg" />
              </div>
              <input
                type="text"
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search issues by title, description..."
                className="w-full pl-10 pr-9 py-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-100 placeholder-slate-400/80 text-sm focus:outline-none focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 hover:border-slate-600/80 hover:bg-slate-800/90 transition-all duration-200"
              />
              {searchValue && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white transition-colors"
                >
                  <CloseIcon className="!text-sm" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Right Navigation Controls */}
        <div className="flex items-center gap-3 sm:gap-4">
          {loading ? (
            <div className="h-9 w-24 rounded-xl bg-slate-800/80 animate-pulse" />
          ) : user ? (
            <>
              {/* Create Ticket CTA (Only for Citizens) */}
              {user.role === 'Citizen' && (
                <button
                  onClick={() => navigate('/create-ticket')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-600/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200"
                >
                  <AddIcon className="!text-lg" />
                  <span className="hidden sm:inline">New Ticket</span>
                </button>
              )}

              {/* User Pill */}
              <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-200 shadow-inner">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center font-bold text-xs text-white shadow-sm">
                  {getUserInitials(user.name)}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-200 leading-tight truncate max-w-[100px]">
                    {user.name}
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${
                    user.role === 'Staff' ? 'text-purple-400' : 'text-cyan-400'
                  }`}>
                    {user.role}
                  </span>
                </div>
              </div>

              {/* Profile Button */}
              <button
                onClick={() => navigate('/profile')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 shadow-sm hover:shadow hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200"
                title="Your Profile"
              >
                <PersonOutlineIcon className="!text-lg text-slate-400 group-hover:text-white" />
                <span className="hidden md:inline">Profile</span>
              </button>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-rose-400 bg-rose-500/5 hover:bg-rose-500/10 border border-slate-700/50 hover:border-rose-500/30 shadow-sm hover:shadow hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200"
                title="Log Out"
              >
                <LogoutIcon className="!text-base text-rose-400/80" />
                <span className="hidden md:inline">Logout</span>
              </button>
            </>
          ) : (
            <>
              {/* Guest Login */}
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/70 border border-transparent hover:border-slate-700/60 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200"
              >
                Log In
              </button>

              {/* Guest Sign Up */}
              <button
                onClick={() => navigate('/signup')}
                className="px-4.5 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 shadow-md shadow-indigo-600/30 hover:shadow-cyan-500/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200"
              >
                Get Started
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Search Bar (only shown on small screens when user is logged in) */}
      {shouldShowSearch && (
        <div className="md:hidden px-4 pb-3 pt-1 border-t border-slate-800/40">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <SearchIcon className="!text-lg" />
            </div>
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search issues..."
              className="w-full pl-10 pr-9 py-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-100 placeholder-slate-400/80 text-sm focus:outline-none focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20"
            />
            {searchValue && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400"
              >
                <CloseIcon className="!text-sm" />
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

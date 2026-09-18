import React, { useEffect, useState } from 'react';
import './index.css';
import Navbar from './components/Navbar';
import TicketList from './components/ticketList';
import CreateTicket from './components/CreateTicket';
import Login from './components/Login';
import Signup from './components/Signup';
import toast, { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { useUser } from './contexts/UserContext';
import TicketView from './components/TicketView';
import Profile from './components/Profile';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import { useSearchParams } from 'react-router-dom';
import { getAllCategories } from './api/ticketApi';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

function MainApp() {
  const navigate = useNavigate();
  const { user, loading } = useUser();
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const categoriesFetch = async () => {
      try {
        const data = await getAllCategories();
        setCategories(data?.categories || []);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    categoriesFetch();
  }, []);

  const handleFilterChange = (key, value) => {
    const params = Object.fromEntries([...searchParams]);
    if (value) params[key] = value; else delete params[key];
    setSearchParams(params);
  };

  const handleSearchChange = (value) => {
    handleFilterChange('search', value);
  };

  const currentStatus = searchParams.get('status') || '';
  const currentCategory = searchParams.get('category') || '';
  const currentSort = searchParams.get('sortBy') || 'createdAt';

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col antialiased">
      {/* Top Professional Sticky Navbar */}
      <Navbar
        searchValue={searchParams.get('search') || ''}
        onSearchChange={handleSearchChange}
        showSearch={Boolean(user)}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
        {/* Contextual Filter Toolbar for Tickets */}
        {user && (
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md shadow-sm">
            {/* Status Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              {[
                { label: 'All Issues', value: '' },
                { label: 'Open', value: 'Open' },
                { label: 'In Progress', value: 'In Progress' },
                { label: 'Resolved', value: 'Resolved' },
              ].map((tab) => {
                const isActive = currentStatus === tab.value;
                return (
                  <button
                    key={tab.label}
                    onClick={() => handleFilterChange('status', tab.value)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Category & Sort Dropdowns */}
            <div className="flex items-center gap-2.5">
              {/* Category Filter */}
              <div className="relative flex-1 sm:flex-none">
                <select
                  value={currentCategory}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full sm:w-auto appearance-none pl-3.5 pr-8 py-1.5 rounded-xl bg-slate-800/70 border border-slate-700/60 text-xs sm:text-sm text-slate-200 hover:border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all cursor-pointer"
                >
                  <option value="" className="bg-slate-900 text-slate-200">All Categories</option>
                  {categories.map((cat, idx) => (
                    <option key={idx} value={cat} className="bg-slate-900 text-slate-200">
                      {cat}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>

              {/* Sort Filter */}
              <div className="relative flex-1 sm:flex-none">
                <select
                  value={currentSort}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full sm:w-auto appearance-none pl-3.5 pr-8 py-1.5 rounded-xl bg-slate-800/70 border border-slate-700/60 text-xs sm:text-sm text-slate-200 hover:border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all cursor-pointer"
                >
                  <option value="createdAt" className="bg-slate-900 text-slate-200">Newest First</option>
                  <option value="createdAt_asc" className="bg-slate-900 text-slate-200">Oldest First</option>
                  <option value="priority" className="bg-slate-900 text-slate-200">Highest Priority</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Content */}
        {user ? (
          <div className="w-full">
            <TicketList />
          </div>
        ) : (
          /* Guest Hero Showcase */
          <div className="flex flex-col items-center justify-center text-center py-12 sm:py-20 px-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-6 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              Civic Operations & Public Safety
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-3xl leading-[1.15]">
              Community Issues Solved with <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">Speed & Clarity</span>
            </h1>
            
            <p className="mt-5 text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed">
              Track real-time public grievances, inspect interactive GIS heatmaps, and collaborate with civic departments to get local issues resolved.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => navigate('/signup')}
                className="px-6 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 shadow-lg shadow-indigo-600/30 hover:shadow-cyan-500/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200 flex items-center gap-2"
              >
                <span>Get Started</span>
                <ArrowForwardIcon className="!text-sm" />
              </button>
              
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-3 rounded-xl text-sm font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
              >
                Sign In to Account
              </button>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl w-full mt-16 text-left">
              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm hover:border-slate-700/80 transition-all">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-3 text-lg font-bold">
                  📍
                </div>
                <h3 className="text-base font-semibold text-slate-200">Interactive GIS Map</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">View localized issue clusters with heatmaps and GPS coordinates.</p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm hover:border-slate-700/80 transition-all">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-3 text-lg font-bold">
                  ⚡
                </div>
                <h3 className="text-base font-semibold text-slate-200">Live Status Tracking</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">Follow milestones step-by-step from ticket creation to field resolution.</p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm hover:border-slate-700/80 transition-all">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3 text-lg font-bold">
                  🛡️
                </div>
                <h3 className="text-base font-semibold text-slate-200">Citizen Confirmation</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">Empowers citizens to confirm or deny work before any ticket is closed.</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Toaster position="bottom-left" reverseOrder={false} />
      <Routes>
        <Route path='/' element={<MainApp />} />
        <Route path='/create-ticket' element={<CreateTicket />} />
        <Route path='/ticket/:id' element={<TicketView />} />
        <Route path='/profile' element={<Profile />} />
  <Route path='/forgot-password' element={<ForgotPassword />} />
  <Route path='/reset-password' element={<ResetPassword />} />
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Signup />} />
      </Routes>
    </Router>
  );
}

export default App;

import React from 'react';
import './index.css';
import LiquidCard from './components/LiquidCard';
import TicketList from './components/ticketList';
import CreateTicket from './components/CreateTicket';
import Login from './components/Login';
import Signup from './components/Signup';
import { Button, TextField } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import toast, { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { useUser } from './contexts/UserContext';
import { useSearchParams } from 'react-router-dom';

function MainApp() {
  const navigate = useNavigate();
  const { user, loading } = useUser();
  const [searchParams, setSearchParams] = useSearchParams();

  const handleFilterChange = (key, value) => {
    const params = Object.fromEntries([...searchParams]);
    if (value) params[key] = value; else delete params[key];
    setSearchParams(params);
  };

  const handleSearchChange = (value) => {
    handleFilterChange('search', value);
  };
  return (
    <div className='bg-black flex flex-col items-center justify-start min-h-screen gap-6 p-6'>
      <div className='p-0 flex flex-row w-[90vw] justify-between items-center h-[6dvh]'>
        <h1 className='text-white text-lg font-extrabold'>ComplaintDesk</h1>
        <div className='w-[40vw]'>
          <TextField
            className='w-full'
            id="outlined-basic"
            label="Search the issues by title, description.."
            variant="outlined"
            value={searchParams.get('search') || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
        <div className="flex gap-2 items-center">
          <select value={searchParams.get('status') || ''} onChange={(e)=>handleFilterChange('status', e.target.value)} className="bg-black/80 text-white px-2 py-1 rounded">
            <option value="">All status</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
          <select value={searchParams.get('category') || ''} onChange={(e)=>handleFilterChange('category', e.target.value)} className="bg-black/80 text-white px-2 py-1 rounded">
            <option value="">All categories</option>
            <option value="Road">Road</option>
            <option value="Water">Water</option>
            <option value="Electricity">Electricity</option>
          </select>
          <select value={searchParams.get('sortBy') || 'createdAt'} onChange={(e)=>handleFilterChange('sortBy', e.target.value)} className="bg-black/80 text-white px-2 py-1 rounded">
            <option value="createdAt">Newest</option>
            <option value="createdAt_asc">Oldest</option>
            <option value="priority">Priority</option>
          </select>
        </div>
        <div className="flex items-center gap-4">
          {!loading && user ? (
            <div className="text-white/80 text-sm">
              <div>{user.name}</div>
              <div className="text-white/60">{user.role}</div>
            </div>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => navigate('/login')} className="px-3 py-1 rounded bg-white/10 text-white">Login</button>
              <button onClick={() => navigate('/signup')} className="px-3 py-1 rounded bg-white/10 text-white">Sign up</button>
            </div>
          )}

          {(!loading && user?.role === 'Citizen') && (
            <Button
              onClick={() => navigate('/create-ticket')}
              className='m-0 h-[6dvh]'
              variant="contained"
            >
              <AddIcon /> Create Ticket
            </Button>
          )}
        </div>
      </div>
      <div className='grid gap-3 p-6 items-start justify-center min-h-screen'>
        <TicketList />
      </div>
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
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Signup />} />
      </Routes>
    </Router>
  );
}

export default App;

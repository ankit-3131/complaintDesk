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

function MainApp() {
  const navigate = useNavigate();
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
          />
        </div>
        <Button
          onClick={() => navigate('/create-ticket')}
          className='m-0 h-[6dvh]'
          variant="contained"
        >
          <AddIcon /> Create Ticket
        </Button>
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

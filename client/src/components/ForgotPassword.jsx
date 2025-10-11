import React, { useState } from 'react';
import { forgotPassword } from '../api/userApi';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function ForgotPassword(){
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try{
      await forgotPassword(email);
      toast.success('OTP sent to your email');
      navigate('/reset-password');
    }catch(err){
      toast.error(err?.response?.data?.message || 'Failed to send OTP');
    }
  }

  return (
    <div className="bg-black min-h-screen p-8 flex items-center justify-center">
      <form onSubmit={handleSubmit} className="glass-form">
        <h2 className="form-title">Forgot Password</h2>
        <div className="form-field">
          <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Enter your registered email" required />
        </div>
        <div className="submit-wrap">
          <button type="submit" className="submit-btn">Send OTP</button>
        </div>
      </form>
    </div>
  )
}

import React, { useState } from 'react';
import { resetPassword } from '../api/userApi';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function ResetPassword(){
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try{
      await resetPassword({ email, otp, newPassword });
      toast.success('Password reset successful');
      navigate('/login');
    }catch(err){
      toast.error(err?.response?.data?.message || 'Reset failed');
    }
  }

  return (
    <div className=" bg-black git amin-h-screen p-8 flex items-center justify-center">
      <form onSubmit={handleSubmit} className="glass-form">
        <h2 className="form-title">Reset Password</h2>
        <div className="form-field">
          <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Registered email" required />
        </div>
        <div className="form-field">
          <input type="text" value={otp} onChange={(e)=>setOtp(e.target.value)} placeholder="OTP" required />
        </div>
        <div className="form-field">
          <input type="password" value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} placeholder="New password" required />
        </div>
        <div className="submit-wrap">
          <button type="submit" className="submit-btn">Reset Password</button>
        </div>
      </form>
    </div>
  )
}

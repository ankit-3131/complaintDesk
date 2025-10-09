import React from 'react';
import { useUser } from '../contexts/UserContext';
import { logout_API } from '../api/userApi';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

function Profile() {
  const { user, setUser, refreshUser } = useUser();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout_API();
      localStorage.removeItem('token');
      setUser(null);
      toast.success('Logged out');
      navigate('/');
    } catch (err) {
      toast.error('Logout failed');
      console.error(err);
    }
  };

  if (!user) return <div className="p-6 text-white">Not logged in</div>;

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white">
      <div className="max-w-2xl mx-auto bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
        <h2 className="text-2xl font-bold mb-4">Profile</h2>
        <div className="mb-2"><strong>Name:</strong> {user.name}</div>
        <div className="mb-2"><strong>Email:</strong> {user.email}</div>
        <div className="mb-2"><strong>Role:</strong> {user.role}</div>
        <div className="mt-4 flex gap-2 justify-end">
          <button onClick={handleLogout} className="px-4 py-2 rounded bg-red-600">Logout</button>
        </div>
      </div>
    </div>
  );
}

export default Profile;

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getMe } from '../api/userApi';
import toast from 'react-hot-toast';

const UserContext = createContext(null);

export function useUser() {
  return useContext(UserContext);
}

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    setLoading(true);
    try {
      const data = await getMe();
      if (data && data.email) {
        setUser({ id: data.id, name: data.name, email: data.email, role: data.role || 'Citizen' });
        console.log(data);
        
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
}

export default UserContext;

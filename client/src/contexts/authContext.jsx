import { signInWithCustomToken } from 'firebase/auth';
import { createContext, useContext, useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { auth } from '../firebase/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function fetchCurrentUser() {
    try {
      const res = await axiosInstance.get('/users/me');
      await fetchFirebaseCustomToken();
      setUser(res.data.data);
    } catch (err) {
      setUser(null);

      if (err.response?.status !== 401) {
        console.error(err.response?.data?.message || err.message);
      }
    } finally {
      setLoading(false);
    }
  }
  async function fetchFirebaseCustomToken() {
    const res = await axiosInstance.get('/users/firebase-token');
    const customToken = res.data.data.token;

    const userCredential = await signInWithCustomToken(auth, customToken);

    console.log('Logged in:', userCredential.user.uid);
  }

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, setUser, fetchFirebaseCustomToken }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

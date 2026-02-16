import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext';
import { jwtDecode } from 'jwt-decode';
import api from '../api/axios';


export default function LoginPage() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setAccessToken, setIsLoggedIn, setRole } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = { email, password };
      const response = await api.post('/api/auth/login', data, { withCredentials: true });
      setAccessToken(response.data.accessToken);
      setIsLoggedIn(true);
      const decoded = jwtDecode(response.data.accessToken);
      setRole(decoded.role);
      // setTimeout(() => {
      // }, 2000);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50'>
      <div className='w-full max-w-md bg-white p-8 rounded-xl border border-gray-200'>
        <h2 className='text-2xl font-semibold text-gray-800 mb-6'>
          Enter Your Information
        </h2>
        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <input type="email" autoFocus value={email} onChange={(e) => setEmail(e.target.value)} placeholder='email' required disabled={loading} className='w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500' />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder='password' required disabled={loading} className='w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500' />
          <button  disabled={!email || !password || loading} className='bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'>{loading ? "Signing You In" : "Continue"}</button>
        </form>
        {error && (
          <p className='text-sm text-red-500 text-center mt-2'>{error}</p>
        )}
      </div>

    </div>
  );
}

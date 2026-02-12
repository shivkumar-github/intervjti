import React, { useState } from 'react'
import axios from 'axios';
import {useNavigate} from 'react-router-dom'
import { useAuth } from '../context/AuthContext'; 
import { jwtDecode } from 'jwt-decode';


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
    const data = { email, password };
    const response = await axios.post('http://localhost:1000/api/auth/login', data, { withCredentials: true });
    if (response.data.success) {
      setAccessToken(response.data.accessToken);
      setIsLoggedIn(true);
      const decoded = jwtDecode(response.data.accessToken);
      setRole(decoded.role);
      navigate('/');
    }
    setLoading(false);
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50'>
      <div className='w-full max-w-md bg-white p-8 rounded-xl border border-gray-200'>
        <h2 className='text-2xl font-semibold text-gray-800 mb-6'>
          Enter Your Information
        </h2>
        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder='email' required className='w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500' />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder='password' required className='w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500' />
          <button className='bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer' disabled={!email || !password}>Continue</button>
        </form>
      </div>
    </div>
  );
}

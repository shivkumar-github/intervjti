import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'


export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMatch, setPasswordMatch] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!confirmPassword || !password || password === confirmPassword) setPasswordMatch('');
    else setPasswordMatch('Both passwords do not match!');
  }, [password, confirmPassword]);

  // first user clicks on send otp then verify otp options comes which contains field to enter otp and after verifying otp we will redirect 

  const sendOtp = async (e) => {
    e.preventDefault();
    const data = { email, otp };
    const response = await axios.post('http://localhost:1000/api/auth/send-otp', data);
    setOtpSent(true);
  }

  const verifyOtp = async (e) => {
    e.preventDefault();
    const data = { email, otp };
    const response = await axios.post('http://localhost:1000/api/auth/verify-otp', data);

    if (response.data.success) setVerified(true);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { email, password };
    const response = await axios.post('http://localhost:1000/api/auth/set-password', data);
    if (response.data.success) {
      navigate('/loginpage');
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50' >
      <div className='w-full max-w-md bg-white p-8 rounded-xl border border-gray-200'>
        <h2 className='text-2xl font-semibold text-gra mb-6'>
          Create Your Account
        </h2>
        <form className='flex flex-col gap-4'>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder='your email' required className='w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-blue-500'/>
          <button onClick={(e) => sendOtp(e)} className='bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition hover:cursor-pointer'>send otp</button>

          {otpSent &&
            <>
              <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder='otp' required className='w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline focus:ring-2 focus:ring-blue-500' />
              <button onClick={(e) => verifyOtp(e)} className='bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition  hover:cursor-pointer'>verify otp</button>
            </>
          }

          {verified &&
            <>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder='password' reqired className='w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline:none focus:ring-2 focus:ring-blue-500' />
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder='retype password' required className='w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500' />
            <p className='text-sm text-red-500'>{passwordMatch}</p>
              <button onClick={handleSubmit} className='bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition cursor-pointer'>Create Account</button>
            </>
          }
        </form>
      </div>
    </div>
  )
}

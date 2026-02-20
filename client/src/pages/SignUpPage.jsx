import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios';


export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMatch, setPasswordMatch] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [error, setError] = useState('');

  const [sendingOtpLoading, setSendingOtpLoading] = useState(false);
  const [verifyingOtpLoading, setVerifyingOtpLoading] = useState(false);
  const [creatingAccountLoading, setCreatingAccountLoading] = useState(false);
  const [success, setSuccess] = useState(false);


  const navigate = useNavigate();

  useEffect(() => {
    if (!confirmPassword || !password || password === confirmPassword) setPasswordMatch('');
    else setPasswordMatch('Both passwords do not match!');
  }, [password, confirmPassword]);

  useEffect(() => {
    setOtp('');
    setOtpSent(false);
    setOtpVerified(false);
  }, [email]);

  // first user clicks on send otp then verify otp options comes which contains field to enter otp and after verifying otp we will redirect 

  const sendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSendingOtpLoading(true);
    setOtpSent(false);
    try {
      const data = { email };
      await api.post('/api/auth/send-otp', data);
      setOtpSent(true);
    } catch (err) {
      setError('An error occured while sending OTP, Try again!');
    } finally {
      setSendingOtpLoading(false);
    }
  }

  const verifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setVerifyingOtpLoading(true);

    try {
      const data = { email, otp };
      const response = await api.post('/api/auth/verify-otp', data);
      setOtpVerified(true);
    }
    catch (err) {
      setError("Can not verify OTP please Try again!");
    } finally {
      setVerifyingOtpLoading(false);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCreatingAccountLoading(true);

    try {
      const data = { email, password };
      await api.post('/api/auth/set-password', data);
      setSuccess(true);
      navigate('/loginpage');
    } catch {
      setError('Failed to create Account!');
    } finally {
      setCreatingAccountLoading(false);
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50' >
      <div className='w-full max-w-md bg-white p-8 rounded-xl border border-gray-200'>
        <h2 className='text-2xl font-semibold text-gray-800 mb-6'>
          Create Your Account
        </h2>
        <form className='flex flex-col gap-4'>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder='your email' required disabled={success} className='w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-blue-500' />
          <button onClick={(e) => sendOtp(e)} disabled={sendingOtpLoading || email === '' || success} className='bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition hover:cursor-pointer disabled:cursor-not-allowed'>{sendingOtpLoading ? "Sending..." : "Send OTP"}</button>

          {otpSent && (
            <>
              <p className='text-green-500 text-sm'>OTP successfully sent to your mail.</p>
              <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder='otp' required disabled={success} className='w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none
               focus:ring-2 focus:ring-blue-500' />
              <button onClick={(e) => verifyOtp(e)} disabled={!otp || verifyingOtpLoading || success} className='bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition  hover:cursor-pointer disabled:cursor-not-allowed'>{verifyingOtpLoading ? "Verifying..." : "Verify OTP"}</button>
            </>
          )}

          {otpVerified && (
            <>
              <p className='text-green-500 text-sm'>OTP verified successfully, now set your password</p>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder='password' required disabled={success} className='w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500' />
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder='retype password' required  disabled={success} className='w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500' />
              <p className='text-sm text-red-500'>{passwordMatch}</p>
              <button onClick={handleSubmit} disabled={creatingAccountLoading || passwordMatch !== '' || success} className='bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition cursor-pointer disabled:cursor-not-allowed'>{creatingAccountLoading ? "Creating Account..." : "Create Account"}</button>
            </>
          )}

          {error && (
            <p className='text-sm text-red-500'>
              {error}
            </p>
          )}

          {success && (
            <p className='text-green-500'>
              Account created successfully. Redirecting to Login...
            </p>
          )}
        </form>
      </div>
    </div>
  )
}

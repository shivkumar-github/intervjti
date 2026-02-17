import React, { useState } from 'react'
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

function ContactUs() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [error, setError] = useState('');
  
  const { accessToken } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponseMessage('');
    setError('');
    try {
      const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
      const data = { name, email, message };
      await api.post('/api/contact', data,
        { headers }
      );
      setResponseMessage('Successfully delivered Your Message:)');
      setEmail('');
      setName('');
      setMessage('');
    } catch (err) {
      setError('An error occured while delivering your message please try again!');
    } finally {
      setLoading(false);
    }
  }


  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50'>
      <div className='w-full max-w-md bg-white p-8 rounded-xl border border-gray-200'>
        <h1 className='text-2xl font-semibold text-gray-800 mb-6'>
          Write A message</h1>
        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <label className='text-sm text-gray-600'>Your Name</label>
          <input type="text" placeholder='Enter Your Name' required value={name} onChange={(e) => setName(e.target.value)} className='w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500' />
          <label className='text-sm text-gray-600'>Your E-mail</label>
          <input type="email" placeholder='Enter Your Mail' required value={email} onChange={(e) => setEmail(e.target.value)} className='w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500' />
          <label className='text-sm text-gray-600'>Message</label>
          <textarea
            placeholder='Write your message...'
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className='
              w-full
              min-h-30
              md:min-h-40
              lg:min-h-45
              border border-gray-300
              rounded-md
              p-3
              resize-none
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500
              focus:border-blue-500
              transition
            '
          />


          <button type='submit' disabled={loading || !name || !email || !message} className='bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'>{loading ? "Sending..." : "Send Message"}</button>
        </form>
        {responseMessage && (
          <p className='text-green-500 text-sm'>
            {responseMessage}
          </p>
        )}

        {error && (
          <p className='text-red-500 text-sm'>
            {error}
          </p>
        )}
      </div>
    </div>
  )
}

export default ContactUs
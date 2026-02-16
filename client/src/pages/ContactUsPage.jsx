import React, { useState } from 'react'

function ContactUs() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    const handler = () => {
      e.preventDefault();
    }
  }


  return (
    <div className='min-h-screen'>
      <h1>Write A message</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder='Enter Your Name' value={name} onChange={(e)=>setName(e.target.value)} />
        <input type="email" placeholder='Enter Your Mail' value={ email} onChange={(e)=>setEmail(e.target.value)} />
        <input type="text" placeholder='Enter message here' value={message} onChange={(e)=>setMessage(e.target.value)}/>
        <button type='submit'>Send Message</button>
      </form>
    </div>
  )
}

export default ContactUs
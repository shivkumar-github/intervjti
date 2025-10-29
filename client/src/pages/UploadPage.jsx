import { useState } from "react"
import axios, { all } from 'axios'

export default function UploadPage() {
  const [studentName, setStudentName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [batch, setBatch] = useState(0);
  const [expText, setExpText] = useState('');
  const handleSubmitExperience = (e) => {
    e.preventDefault();
    const data = { studentName, companyName, batch, expText };
    try {
      axios.post('http://localhost:1000/api/experiences', data);
      console.log('sent data successfully');
      console.log(data);
    } catch (err) {
      console.error("error submitting your experience");
    }
    setStudentName('');
    setCompanyName('');
    setBatch(0);
    setExpText('');
  }
  return (
    <form>
      <input type="text" placeholder='your name' value={studentName} onChange={(e) => setStudentName(e.target.value)} />
      <input type="text" placeholder='company name' value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
      <input type="number" placeholder='batch' value={batch} onChange={(e) => setBatch(e.target.value)} />
      <input type="text" placeholder="write your exp" value={expText} onChange={(e) => setExpText(e.target.value)} />
      <button type="submit" onClick={handleSubmitExperience}>submit</button>
    </form>
  )
}

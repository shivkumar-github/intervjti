import { useState } from "react"
import RichTextEditor from "../components/RichTextEditor";
import { useAuth } from '../context/AuthContext';
import api from "../api/axios";

export default function UploadPage() {
  const { accessToken } = useAuth();

  const [studentName, setStudentName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [batch, setBatch] = useState('');
  const [content, setContent] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmitExperience = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (content.replace(/<[^>]*>/g, '').length < 50) {
      setError("Please provide more details");
      setLoading(false);
      return;
    }
    try {
      const data = { studentName, companyName, batch, content };
      const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};

      await api.post('/api/experiences', data,
        { headers }
      );

      setMessage("Experience submitted for approval ;)");

      setStudentName('');
      setCompanyName('');
      setBatch('');
      setContent('');
      // setTimeout(() => setMessage(''), 0);
      setMessage('');
    } catch (err) {
      setError("Failed to upload your experience!");
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <form onSubmit={handleSubmitExperience}
        className="max-w-3xl mx-auto bg-white border border-gray-200 shadow-sm rounded-xl p-8 space-y-6"
      >
        <h2 className="text-2xl font-semibold text-gray-800">
          Upload Your Experience
        </h2>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-600">Your Name</label>
          <input
            type="text"
            placeholder='Enter Your Name'
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            required
            disabled={loading}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />

        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-600">Company Name</label>
          <input type="text"
            placeholder='Enter Company Name'
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
            disabled={loading}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition  "
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-600">Your Batch</label>
          <input type="text"
            placeholder='Enter Your Batch'
            value={batch}
            onChange={(e) => setBatch(e.target.value)}
            required
            disabled={loading}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-600">
            Write Your Experience
          </label>
          <div className="rounded-md p-2 border border-gray-300">
            <RichTextEditor content={content} onChange={setContent} />
          </div>
        </div>
        <p className="text-xs text-gray-400 text-right">
          {content.replace(/<[^>]*>/g, '').length} characters
        </p>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white font-medium py-2.5 rounded-md hover:bg-blue-700 transition active:scale-95 cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
        >{loading ? "Submitting..." : "Submit Experience"}</button>

        {message && (
          <p className="text-sm text-center text-green-500">{message}</p>
        )}
        {
          error && (
            <p className="text-sm text-red-500 text-center mt-2">
              {error}
            </p>
          )}
      </form>
    </div>
  )
}

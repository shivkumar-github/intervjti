import React from 'react'
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { onApprove, onReject } from '../api/experienceApi';
import api from '../api/axios';


export default function ExperienceDetailsPage() {
  const statusStyles = {
    approved: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    rejected: "bg-red-100 text-red-700"
  };

  const rejectionReasons = ['SPAM', 'DUPLICATE', 'INCOMPLETE DETAILS', 'OTHER'];

  const { id } = useParams();
  const { accessToken, role } = useAuth();

  const [experience, setExperience] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const [remark, setRemark] = useState('');
  const [submitting, setSubmitting] = useState(false);


  const navigate = useNavigate();

  const handleApprove = async () => {
    try {
      await onApprove(id, accessToken);
      setExperience(prev => ({ ...prev, status: "approved", remark: null, reason: null }));
      console.log('successfully updated the status');
      navigate('/admindashboard');
    } catch (err) {
      console.log('An error occured while approving the experience', err);
    }
  };

  const handleReject = async () => {
    if (!reason) {
      setError('Please Enter a valid reason');
      return;
    }
    try {
      setSubmitting(true);
      await onReject(id, accessToken, reason, remark);
      setExperience(prev => ({ ...prev, status: "rejected" , reason, remark}));
      console.log('successfully rejected the experience');
      navigate('/admindashboard');
    } catch (err) {
      console.log('An error occured while rejecting the experience', err);
    } finally {
      setSubmitting(false);
    }
  }



  useEffect(() => {
    const getExperience = async () => {
      if (!accessToken) return;
      try {
        const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};

        const res = await api.get(`/api/experiences/${id}`,
          { headers }
        );
        setExperience(res.data.experience);

      } catch (err) {
        if (err.response?.status === 403) {
          setError("You are not allowed to view this experience!");
        } else if (err.response?.status === 404) {
          setError("Experience not found");
        } else {
          setError("Something went wrong!");
        }
      } finally {
        setLoading(false);
      }
    }

    getExperience();
  }, [id, accessToken]);

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center text-gray-500'>
        Loading Experience...
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen flex items-center justify-center text-red-500'>
        {error}
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>

      <div className='max-w-3xl mx-auto px-6 py-12'>

        <div className='bg-white border border-gray-200 rounded-xl p-8 shadow-sm'>

          <div className='mb-6 border-b border-gray-100 pb-4'>
            <h1 className='text-2xl font-semibold text-gray-800 mb-2'>
              {experience?.companyName}
            </h1>

            <div className='text-sm text-gray-500 flex flex-wrap gap-2'>
              <span>{experience?.studentName}</span>
              <span>.</span>
              <span>{experience?.batch}</span>
              <span>.</span>
              <span className={`capitalize px-2 py-0.5 rounded ${statusStyles[experience?.status] || 'bg-gray-100 text-gray-600'}`}>{experience?.status}</span>
            </div>
          </div>
          <article
            className='prose prose-lg prose-gray max-w-none'
            dangerouslySetInnerHTML={{
              __html: experience.content
            }}
          >
          </article>
          {experience?.status === 'rejected' && (
            <div className='mt-6 p-4 bg-red-50 border border-red-200 rounded'>
              <p className='font-medium text-red-700'>
                Reason:{experience?.reason}
              </p>
              <p className='text-red-600'>
                Remark : {experience?.remark}
              </p>
            </div>
          )}

          {role === 'admin' && (
            <div>
              <div className='flex gap-3 mt-4'>
                {experience.status !== 'approved' && (
                  <button
                    onClick={handleApprove}
                    className='flex-1 bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition cursor-pointer'
                  >
                    Approve
                  </button>
                )}
                {experience.status !== 'rejected' && (
                  <button
                    onClick={() => setRejecting(true)}
                    className='flex-1 bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition cursor-pointer'
                  >
                    Reject
                  </button>
                )}
              </div>
              {rejecting && (
                <div className='flex flex-col gap-3 mt-4'>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className='border rounded-md p-2' required
                  >
                    <option value="">Select reason for rejection</option>
                    {
                      rejectionReasons.map((reason) => {
                        return (<option key={reason} value={reason}>{reason}</option>)
                      })
                    }
                  </select>
                  <label>Enter Remark</label>
                  <input type="text" value={remark} onChange={(e) => setRemark(e.target.value)} placeholder='Enter remark' className='border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition' />
                  <button
                    onClick={handleReject}
                    disabled={submitting}
                    className='flex-1 bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition cursor-pointer disabled:cursor-not-allowed'
                  >
                    Submit
                  </button>
                </div>  
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

import React from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { onApprove } from '../api/experienceApi';

function ExperienceCard({ id, companyName, studentName, status, batch, preview, showAdminActions = false,refreshExps }) {
	const { accessToken, role } = useAuth();
	const [ approveLoading, setApproveLoading ] = useState(false);
	const [error, setError] = useState('');
	
	const statusStyles = {
		approved: "bg-green-100 text-green-700",
		pending: "bg-yellow-100 text-yellow-700",
		rejected: "bg-red-100 text-red-700"
	};
	const handleApprove = async (id) => {
		setApproveLoading(true);
		try {
			await onApprove(id, accessToken);
			setError('');
		} catch (err) {
			setError('An Error Occured while approving experience!');
		} finally {
			setApproveLoading(false);
		}
	};

	const navigate = useNavigate();

	return (
		<div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:-translate-y-1 transition cursor-pointer ">
			<Link to={`/experience/${id}`}>
				<div className='flex justify-between items-center mb-2'>
					<h2 className='font-semibold text-gray-800'>
						{companyName}
					</h2>

					<span className={` text-xs px-2 py-1 rounded-full ${statusStyles[status] || "bg-gray-100 text-gray-600"}`}>
						{status}
					</span>
				</div>
				<p className='text-sm text-gray-500 mb-3'>Student Name : {studentName}</p>
				<p className='text-sm text-gray-500 mb-3'>batch : {batch}</p>
				<p className='text-gray-600 text-sm leading-relaxed'>{preview}</p>
			</Link>

			{role === 'admin' && showAdminActions && (
				<div className='flex gap-3 mt-4'>
					{status !== 'approved' && (
						<button
							onClick={() => handleApprove(id)}
							disabled={approveLoading}
							className='flex-1 bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition cursor-pointer disabled:cursor-not-allowed'
						>
							{approveLoading?"Approving...":"Approve"}
						</button>
					)}
					{status !== 'rejected' && (
						<button
							onClick={() => navigate(`/experience/${id}`)}
							className='flex-1 bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition cursor-pointer'
						>
							Reject
						</button>
					)}
				</div>
			)}

			{error && (
				<p className='text-sm text-red-500'>
					{error}
				</p>
			)}
		</div>
	)
}

export default ExperienceCard

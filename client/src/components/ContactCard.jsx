import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios';

export default function ContactCard({ id, name, email, message, isRead }) {
	const { accessToken } = useAuth();

	const [loading, setLoading] = useState(false);
	const [loadingMessage, setLoadingMessage] = useState('');
	const [error, setError] = useState('');

	const handleMarkRead = async (e) => {
		setError('');
		setLoadingMessage('');
		setLoading(true);
		try {
			const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
			await api.patch(`/api/contact/${id}`, {}, { headers });
			setLoadingMessage('Marked experience as read.');
		} catch (err) {
			setError('An error occured please try again!');
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className='bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition'>

			<div className='flex justify-between items-start mb-2'>
				<div>
					<h3 className='text-lg font-semibold text-gray-600'>{name}</h3>
					<p className='text-sm text-gray-500'>{email}</p>
				</div>
				<span
					className={`text-xs px-2 py-1 rounded-full font-medium
						${isRead ? "bg-gray-100 text-gray-600" : "bg-blue-100 text-blue-700"
						}
						`}
				>
					{isRead ? "Read" : "Unread"}
				</span>
			</div>

			<p className='text-gray-700 text-sm leading-relaxed whitespace-pre-line'>
				{message}
			</p>

			{!isRead && (
				<button
					onClick={handleMarkRead}
					disabled={loading}
					className='mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md cursor-pointer hover:bg-blue-700 transition disabled:cursor-not-allowed disabled:opacity-50'
				>
					{loading ? "Marking..." : "Mark as Read"}
				</button>
			)}

			{loadingMessage && (
				<p className='mt-2 text-sm text-green-600'>
					{loadingMessage}
				</p>
			)}

			{error && (
				<p className='mt-2 text-sm text-red-600 '>{error}</p>
			)}
		</div>
	)
}

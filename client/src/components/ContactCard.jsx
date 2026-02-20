import React from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios';

export default function ContactCard({ id, name, email, message, isRead }) {
	const { accessToken } = useAuth();
	const [loading, setLoading] = useState(true);
	const [message, setMessage] = useState('');
	const [error, setError] = useState('');

	const handleMarkRead = async (e) => {
		setError('');
		setMessage('');
		setLoading(true);
		try {
			const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
			await api.patch(`/api/contact/${id}`, { headers });
			setMessage('Marked experience as read.');
		} catch (err) {
			setError('An error occured please try again!');
		} finally {
			setLoading(false);
		}
	}

	return (
		<div>
			<h3>{name}</h3>
			<p>{email}</p>
			<p>{message}</p>
			<p>{ isRead}</p>
			{!isRead && (
				<button>{loading ? "Marking..." : "Mark as Read"}</button>	  
			)}
		</div>
	)
}

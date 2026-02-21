import ExperienceCard from "../components/ExperienceCard";
import { useState } from "react"
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import ContactCard from "../components/ContactCard";

export default function AdminDashboardPage() {
	const { accessToken } = useAuth();
	const [allExps, setAllExps] = useState([]);
	const [loading, setLoading] = useState(true);

	const [contactMessages, setContactMessages] = useState([]);

	const getAllExps = async () => {
		try {
			const response = await api.get('/api/experiences/adminExperiences',
				{
					headers: {
						Authorization: `Bearer ${accessToken}`
					}
				}
			);
			setAllExps(response.data.data);
		} catch (err) {
			console.log('An Error occured while fetching all exeperiences!')
		} finally {
			setLoading(false);
		}
	}

	const getContactMessages = async () => {
		try {
			const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
			const response = await api.get('/api/contact', { headers });
			setContactMessages(response.data.data);
			console.log(response);
		} catch (err) {
			console.log("An error occured while fetching Contacts!");
		}
	}

	useEffect(() => {
		if (!accessToken) return;
		getAllExps();
		getContactMessages();
	}, [accessToken]);

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center text-gray-500">
				Loading...
			</div>
		);
	}


	return (
		<div className="min-h-screen bg-gray-50 py-12">
			<div className="max-w-6xl mx-auto px-6 space-y-16">

				{/* EXPERIENCES SECTION */}
				<section>
					<div className="mb-8">
						<h1 className="text-3xl font-semibold text-gray-800">
							All Experiences
						</h1>
						<p className="text-gray-500 mt-2">
							Review and moderate student experiences
						</p>
					</div>

					{allExps.length === 0 ? (
						<div className="bg-white border border-gray-200 rounded-lg p-10 text-center text-gray-500">
							No experiences to review
						</div>
					) : (
						<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
							{allExps.map((exp) => (
								<ExperienceCard
									key={exp._id || exp.id}
									{...exp}
									showAdminActions={true}
									refreshExps={getAllExps}
								/>
							))}
						</div>
					)}
				</section>

				{/* CONTACT MESSAGES SECTION */}
				<section>
					<div className="mb-8">
						<h2 className="text-2xl font-semibold text-gray-800">
							Contact Messages
						</h2>
						<p className="text-gray-500 mt-1">
							Messages submitted through the contact form
						</p>
					</div>

					{contactMessages.length === 0 ? (
						<div className="bg-white border border-gray-200 rounded-lg p-8 text-center text-gray-500">
							No contact messages yet
						</div>
					) : (
						<div className="space-y-4 max-w-3xl">
							{contactMessages.map((contact) => (
								<ContactCard
									key={contact._id || contact.id}
									{...contact}
								/>
							))}
						</div>
					)}
				</section>

			</div>
		</div>
	);
}

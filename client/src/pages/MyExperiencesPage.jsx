import ExperienceCard from "../components/ExperienceCard";
import { useState, useEffect } from "react"
import axios, { all } from 'axios'
import { useAuth } from "../context/AuthContext";

export default function MyExperiencesPage() {

	const { accessToken } = useAuth();
	const [userExps, setUserExps] = useState([]);
	const [loading, setLoading] = useState(true);
	useEffect(() => {
		if (!accessToken) return;
		const getAllUserExps = async () => {
			try {

				const response = await axios.get('http://localhost:1000/api/experiences/users/me/experiences',
					{
						headers: {
							Authorization: `Bearer ${accessToken}`
						}
					}
				);
				setUserExps(response.data.data);
			} catch (err) {
				console.log('failed to load your experiences!');
			} finally {
				setLoading(false);
			}
		}
		getAllUserExps();
	}, [accessToken]);


	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center text-gray-500">
				Loading your Experiences...
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 py-12">
			<div className="max-w-6xl mx-auto px-6">


				<div className="mb-10">
					<h1 className="text-3xl font-semibold text-gray-800">
						My Experiences
					</h1>
					<p className="text-gray-500 mt-2">
						Track your submissions and their approval status.
					</p>
				</div>

				{/* no experiences */}
				{
					userExps.length === 0 && (
						<div className="
						bg-white
						border border-gray-200
						rounded-lg
						p-10
						text-center
						text-gray-500	
						">
							You haven't uploaded any experiences yet...
						</div>
					)

				}

				<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{
						userExps.map((exp) => {
							return (<ExperienceCard key={exp.id} {...exp} showAdminActions={false} />);
						})
					}
				</div>
			</div>
		</div>
	)
}

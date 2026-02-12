import ExperienceCard from "../components/ExperienceCard";
import { useState } from "react"
import axios, { all } from 'axios'
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function AdminDashboardPage() {	
	const { accessToken } = useAuth();
	const [allExps, setAllExps] = useState([]);
	const [loading, setLoading] = useState(true);
	useEffect(() => {
		if (!accessToken) return;
		const getAllExps = async () => {
			try {
				const response = await axios.get('http://localhost:1000/api/experiences/adminExperiences',
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
		getAllExps();
	}, [accessToken]);

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center text-gray-500">
				Loading all experiences...
			</div>
		);
	}

	

	return (
		<div className="min-h-screen bg-gray-50 py-12">
			<div className="max-w-6xl mx-auto px-6">


				<div className="mb-10">
					<h1 className="text-3xl font-semibold text-gray-800">
						All Experiences
					</h1>
					<p className="text-gray-500 mt-2">
						Review And Moderate Student Experiences
					</p>
				</div>

				{/* no experiences */}
				{
					allExps.length === 0 && (
						<div className="
						bg-white
						border border-gray-200
						rounded-lg
						p-10
						text-center
						text-gray-500	
						">
							No Experiences to review
						</div>
					)

				}

				<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{
						allExps.map((exp) => {
							return (<ExperienceCard key={exp.id} {...exp} showAdminActions ={true} />);
						})
					}
				</div>
			</div>
		</div>
	)
}

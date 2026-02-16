import ExperienceCard from "../components/ExperienceCard";
import { useState } from "react"
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

export default function HomePage() {
  const [allExps, setAllExps] = useState([]);
  const { accessToken } = useAuth();
  useEffect(() => {
    const getAllExps = async () => {
      const response = await api.get('/api/experiences',
      );
      if (!response.data.success) {
        return;
      }
      setAllExps(response.data.data);
    }
    getAllExps();
  }, [accessToken]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-semibold text-gray-800 mb-8">
          Latest Experiences
        </h1>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

          {
            allExps.map((exp) => {
              return (<ExperienceCard key={exp.id} {...exp} showAdminActions={false} />);
            })
          }
        </div>
      </div>
    </div>
  )
}

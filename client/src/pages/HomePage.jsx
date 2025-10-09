import ExperienceCard from "../components/ExperienceCard";
import { useState } from "react"
import axios, { all } from 'axios'
import { useEffect } from "react";



export default function HomePage() {
  
  const [allExp, setAllExp] = useState([]);
  useEffect(() => {
    const getAllExp = async () => {
      const response = await axios.get('http://localhost:1000/api/experiences');
      if (!response.data.success) {
        console.log('Error occured while fetching data from backend');
        return;
      }
      console.log('Fetched data successfully.');
      setAllExp(response.data.data);
    }
    getAllExp();
  }, []);
  
  return (
    <>
    

      <div>
        {
          allExp.map((exp) => {
            return (<ExperienceCard key={exp._id} {...exp} />);
          })
        }
      </div>
    </>
  )
}

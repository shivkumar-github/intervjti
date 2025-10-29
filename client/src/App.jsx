import { Routes, Route } from "react-router-dom";
import Home from './pages/HomePage'
import SignUpPage from './pages/SignUpPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import LoginPage from './pages/LoginPage'
import UploadPage from './pages/UploadPage'
import ExperienceDetailsPage from './pages/ExperienceDetailsPage'
import NavBar from "./components/NavBar";

function App() {
  
  return ( 
    <>
      <NavBar/>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/signup" element={<SignUpPage/>} />
        <Route path="/admindashboard" element={<AdminDashboardPage/>} />
        <Route path="/loginpage" element={<LoginPage/>} />
        <Route path="/uploadpage" element={<UploadPage />} />
        <Route path="/experiencedetailspage" element={<ExperienceDetailsPage/>} />
      </Routes>
    </>
  )
}

export default App

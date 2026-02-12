import { Routes, Route } from "react-router-dom";
import SignUpPage from './pages/SignUpPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import LoginPage from './pages/LoginPage'
import UploadPage from './pages/UploadPage'
import ExperienceDetailsPage from './pages/ExperienceDetailsPage'
import NavBar from "./components/NavBar";
import HomePage from "./pages/HomePage";
import MyExperiencesPage from './pages/MyExperiencesPage'

function App() {
  
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/admindashboard" element={<AdminDashboardPage />} />
        <Route path="/loginpage" element={<LoginPage />} />
        <Route path="/uploadpage" element={<UploadPage />} />
        <Route path="/experiencedetailspage" element={<ExperienceDetailsPage />} />
        <Route path="/myexperiencespage" element={<MyExperiencesPage />} />
        <Route path="/experience/:id" element={ <ExperienceDetailsPage/>} />
      </Routes>
    </>
  );
}

export default App

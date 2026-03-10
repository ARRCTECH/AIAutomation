import { Routes, Route } from 'react-router-dom';
import CompanyProfile from './Pages/CompanyProfile';
import CompanyProfileDetails from './Pages/CompanyProfileDetails';
import Whatsapp from './Pages/Whatsapp';
import HomePage from "./compoents/HomePage";
import LeadManagement from "./Pages/Leads/LeadManagement"; 

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/leads" element={<LeadManagement />} />
      <Route path="/companyProfile" element={<CompanyProfile />} />
      <Route path="/companyProfileDetails" element={<CompanyProfileDetails />} />
      <Route path="/whatsapp" element={<Whatsapp/>} />
      {/* Add other routes as needed */}
    </Routes>
  );
}


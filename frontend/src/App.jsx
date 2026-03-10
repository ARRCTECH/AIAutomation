import { Routes, Route } from 'react-router-dom';
import CompanyProfile from './Pages/CompanyProfile';
import CompanyProfileDetails from './Pages/CompanyProfileDetails';
import Whatsapp from './Pages/Whatsapp';
// import other components as needed

export default function App() {
  return (
    <Routes>
      <Route path="/companyProfile" element={<CompanyProfile />} />
      <Route path="/companyProfileDetails" element={<CompanyProfileDetails />} />
      <Route path="/whatsapp" element={<Whatsapp/>} />
      {/* Add other routes as needed */}
    </Routes>
  );
}
// App.js

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from "./compoents/HomePage";
import LeadManagement from "./pages/Leads/LeadManagement"; 

function App() {
  return (
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/leads" element={<LeadManagement />} />
      </Routes>
  );
}

export default App;
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import OPDBooking from "./pages/OPDBooking";
import WaitingTime from "./pages/WaitingTime";
import BedAvailability from "./pages/BedAvailability";
import PharmacyInfo from "./pages/PharmacyInfo";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/opd" element={<OPDBooking />} />
          <Route path="/waiting" element={<WaitingTime />} />
          <Route path="/beds" element={<BedAvailability />} />
          <Route path="/pharmacy" element={<PharmacyInfo />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

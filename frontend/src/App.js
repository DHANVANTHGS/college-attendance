import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./Loginpage.jsx";
import QRScannerPage from "./qrscan.jsx";
import StudentList from "./StudentList";
import QRButtonComponent from "./QRButtonComponent";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/scan" element={<QRScannerPage />} />
        <Route path="/students/:department/:roomno" element={<StudentList />} />
        <Route path="/qr" element={<QRButtonComponent />} /> 
      </Routes>
    </Router>
  );
}

export default App;

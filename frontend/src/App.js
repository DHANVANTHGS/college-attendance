import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./Loginpage.jsx";
import QRScannerPage from "./qrscan.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/scan" element={<QRScannerPage />} />
      </Routes>
    </Router>
  );
}

export default App;

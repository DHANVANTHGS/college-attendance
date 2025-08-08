import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./Loginpage.jsx";
import QRScannerPage from "./qrscan.jsx";
import StudentList from "./StudentList.jsx";
import StudentHome from "./StudentHome.jsx";
import RequestForm from "./RequestForm.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/student" element={<StudentHome/>}/>
        <Route path="/student/scan" element={<QRScannerPage />} />
        <Route path="/student/request" element={<RequestForm/>} />
        <Route path="/staff/:department/:roomno" element={<StudentList />} />
      </Routes>
    </Router>
  );
}

export default App;

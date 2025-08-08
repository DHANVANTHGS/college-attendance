// StudentHome.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const StudentHome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900 to-teal-900 text-white px-4">
      <div className="bg-white text-black p-8 rounded-lg shadow-lg w-full max-w-sm text-center">
        <h1 className="text-2xl font-bold mb-6">Welcome Student</h1>
        <button
          className="w-full py-3 mb-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          onClick={() => navigate("scan")}
        >
          📸 Attendance
        </button>
        <button
          className="w-full py-3 bg-green-600 text-white rounded hover:bg-green-700 transition"
          onClick={() => navigate("request")}
        >
          📝 Request
        </button>
      </div>
    </div>
  );
};

export default StudentHome;

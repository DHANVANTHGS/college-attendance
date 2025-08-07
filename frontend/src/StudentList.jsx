/*import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const StudentList = () => {
  const { department, roomno } = useParams();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/staff?department=${department}&roomno=${roomno}`,
            {
          method: 'GET',             // Explicit method
          credentials: 'include',    // Send cookies with the request
        }
        );
        const data = await response.json();
        setStudents(data.students || []);

      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [department, roomno]);
     
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-4">
        Attendance for {department} - Room {roomno}
      </h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full border-collapse bg-white rounded shadow">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-3 border">Name</th>
              <th className="p-3 border">Regn No.</th>
              <th className="p-3 border">Date</th>
              <th className="p-3 border">Time</th>
              <th className="p-3 border">Status</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, idx) => (
              <tr key={idx} className="text-center">
                <td className="p-3 border">{student.name}</td>
                <td className="p-3 border">{student.regnNo}</td>
                <td className="p-3 border">{student.date}</td>
                <td className="p-3 border">{student.time}</td>                
                <td className="p-3 border">{student.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default StudentList;*/

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const StudentList = () => {
  const { department, roomno } = useParams();
  const [students, setStudents] = useState([]);
  const [error, setError] = useState(""); // ✅ Defined here
  const [loading, setLoading] = useState(true); // Optional: show loading

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/students/${department}/${roomno}`);

        if (!response.ok) {
          throw new Error("Server error");
        }

        const data = await response.json();
        setStudents(data);
        setError("");
      } catch (err) {
        console.error("Fetch error:", err.message || err);

        // ✅ Set dummy data on fetch failure
        setError("⚠️ Backend unavailable. Showing dummy data.");

        setStudents([
          { name: "Alice Johnson", regnNo: "22EC001", date: "2025-08-06", status: "Present" },
          { name: "Bob Smith", regnNo: "22EC002", date: "2025-08-06", status: "Absent" },
          { name: "Clara Lee", regnNo: "22EC003", date: "2025-08-06", status: "Present" },
        ]);
      } finally {
        setLoading(false); // ✅ Always stop loading
      }
    };

    fetchStudents();
  }, [department, roomno]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Students in {department} - Room {roomno}
      </h2>

      
      {loading && <p className="text-center text-gray-600">Loading...</p>}


      {error && (
        <div className="mb-4 text-red-600 text-center font-medium">{error}</div>
      )}

      
      {!loading && (
        <table className="w-full border border-gray-300 rounded shadow">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-2 border">Name</th>
              <th className="px-4 py-2 border">Regn No.</th>
              <th className="px-4 py-2 border">Date</th>
              <th className="px-4 py-2 border">Status</th>
            </tr>
          </thead>
          <tbody>
            {students.map((stu, index) => (
              <tr key={index} className="text-center">
                <td className="px-4 py-2 border">{stu.name}</td>
                <td className="px-4 py-2 border">{stu.regnNo}</td>
                <td className="px-4 py-2 border">{stu.date}</td>
                <td className="px-4 py-2 border">{stu.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default StudentList;


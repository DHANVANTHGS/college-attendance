import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const StudentList = () => {
  const { department, roomno } = useParams();
  const [students, setStudents] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [activeTab, setActiveTab] = useState("students");
  const navigate= useNavigate();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/staff/attendance?department=${department}&class=${roomno}`,
          { method: "GET", credentials: "include" }
        );
        if (!response.ok) {
            throw new Error("Failed to fetch students");
        }
        const data = await response.json();
        console.log(data.students);
        setStudents(data.students || []);
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchRequests = async () => {
      try {
        const response = await fetch("http://localhost:5000/staff/get_Request", {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        setRequests(data.requests || []);
      } catch (error) {
        console.error("Error fetching requests:", error);
      }
    };

    fetchStudents();
    fetchRequests();
  }, [department, roomno]);

  const handleStatusChange = async (regnNo, newStatus) => {
    try {
      await fetch(`http://localhost:5000/staff/updateAttendance?department=${department}&class=${roomno}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ regnNo, status: newStatus }),
      });
      setStudents((prev) =>
        prev.map((s) =>
          s.regnNo === regnNo ? { ...s, status: newStatus } : s
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleRequestAction = async (regnNo, action, type) => {
    const status = action === "accept" ? (type === "OD" ? "OD" : "Absent") : null;
    try {
      await fetch(`http://localhost:5000/staff/addUser/department=${department}/class=${roomno}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ regnNo, action, status }),
      });

      if (status) {
        setStudents((prev) =>
          prev.map((s) =>
            s.regnNo === regnNo ? { ...s, status } : s
          )
        );
      }
      setRequests((prev) => prev.filter((r) => r.regnNo !== regnNo));
    } catch (error) {
      console.error("Error handling request:", error);
    }
  };

  const filteredStudents =
    statusFilter === "All"
      ? students
      : students.filter((s) => s.status === statusFilter);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-4">
        Attendance for {department} - Room {roomno}
      </h2>

      {/* Tabs */}
      <div className="flex gap-4 mb-4">
        <button
          className={`px-4 py-2 rounded ${activeTab === "students" ? "bg-blue-500 text-white" : "bg-white border"}`}
          onClick={() => setActiveTab("students")}
        >
          Students
        </button>
        <button
          className={`px-4 py-2 rounded ${activeTab === "requests" ? "bg-blue-500 text-white" : "bg-white border"}`}
          onClick={() => setActiveTab("requests")}
        >
          Requests
        </button>
      </div>

      {activeTab === "students" && (
        <>
          {/* Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
            <button className="bg-green-600 text-white px-4 py-2 rounded shadow w-full sm:w-auto" onClick={()=>navigate("adduser")}>
              ➕ Add User
            </button>
            <select
              className="border px-3 py-2 rounded w-full sm:w-auto"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="OD">OD</option>
            </select>
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse bg-white rounded shadow">
                <thead>
                  <tr className="bg-gray-200 text-center">
                    <th className="p-3 border">Name</th>
                    <th className="p-3 border">Regn No.</th>
                    <th className="p-3 border">Date</th>
                    <th className="p-3 border">Time</th>
                    <th className="p-3 border">Status</th>
                    <th className="p-3 border">Change Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((students, idx) => (
                    <tr key={idx} className="text-center">
                      <td className="p-3 border">{students.name}</td>
                      <td className="p-3 border">{students.regnNo}</td>
                      <td className="p-3 border">{students.date}</td>
                      <td className="p-3 border">{students.time}</td>
                      <td className="p-3 border">{students.status}</td>
                      <td className="p-3 border">
                        <select
                          className="border px-2 py-1 rounded"
                          value={students.status}
                          onChange={(e) =>
                            handleStatusChange(students.regnNo, e.target.value)
                          }
                        >
                          <option value="Present">Present</option>
                          <option value="Absent">Absent</option>
                          <option value="OD">OD</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {activeTab === "requests" && (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse bg-white rounded shadow">
            <thead>
              <tr className="bg-gray-200 text-center">
                <th className="p-3 border">Name</th>
                <th className="p-3 border">Regn No.</th>
                <th className="p-3 border">Type</th>
                <th className="p-3 border">Reason</th>
                <th className="p-3 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req, index) => (
  <tr key={index}>
    <td>{req.name}</td>
    <td>{req.type}</td>
    <td>{req.reason}</td>
    <td>
      <button onClick={() => handleRequestAction(req.regnNo,"accept",req.type)} className="text-green-600">Accept</button>
      <button onClick={() => handleRequestAction(req.regnNo,"deny",req.type)} className="text-red-600 ml-2">Deny</button>
    </td>
  </tr>
))}

            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StudentList;

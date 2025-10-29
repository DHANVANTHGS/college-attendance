import React, { useEffect, useState } from "react";
import "./studentList.css";

const App = ({ department, roomno }) => {
  const [students, setStudents] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [activeTab, setActiveTab] = useState("students");

  useEffect(() => {
    // Fetch students
    const fetchStudents = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/staff/attendance?department=${department}&roomno=${roomno}`,
          { method: "GET", credentials: "include" }
        );
        const data = await response.json();
        setStudents(Array.isArray(data) ? data : data.students || []);
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setLoading(false);
      }
    };

    // Fetch requests
    const fetchRequests = async () => {
      try {
        const response = await fetch(`http://localhost:5000/staff/get_Request?department=${department}&roomno=${roomno}`, {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        setRequests(Array.isArray(data) ? data : data.requests || []);
      } catch (error) {
        console.error("Error fetching requests:", error);
      }
    };

    fetchStudents();
    fetchRequests();
  }, [department, roomno]);

  // Update student status
  const handleStatusChange = async (regnNo, newStatus) => {
    setStudents((prev) =>
      prev.map((s) => (s.regnNo === regnNo ? { ...s, status: newStatus } : s))
    );

    try {
      await fetch("http://localhost:5000/api/updatestatus", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ regnNo, status: newStatus }),
      });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // Handle request action
  const handleRequestAction = async (regnNo, action, type) => {
    const status = action === "accept" ? (type === "OD" ? "OD" : "Absent") : null;

    if (status) {
      setStudents((prev) =>
        prev.map((s) => (s.regnNo === regnNo ? { ...s, status } : s))
      );
    }
    setRequests((prev) => prev.filter((r) => r.regnNo !== regnNo));

    try {
      await fetch("http://localhost:5000/api/handlerequest", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ regnNo, action, status }),
      });
    } catch (error) {
      console.error("Error handling request:", error);
    }
  };

  const filteredStudents =
    statusFilter === "All"
      ? students
      : students.filter((s) => s.status === statusFilter);

  return (
    <div className="student-list-container">
      <h2>
        Attendance for {department} - Room {roomno}
      </h2>

      {/* ===== Top Control Bar ===== */}
      <div className="top-bar">
        {/* Left Side (Tabs) */}
        <div className="tabs">
          <button
            className={`tab-button ${activeTab === "students" ? "active" : ""}`}
            onClick={() => setActiveTab("students")}
          >
            Students
          </button>
          <button
            className={`tab-button ${activeTab === "requests" ? "active" : ""}`}
            onClick={() => setActiveTab("requests")}
          >
            Requests
          </button>
        </div>

        {/* Right Side (Controls) */}
        {activeTab === "students" && (
          <div className="controls">
            <button className="add-user-btn">➕ Add Student</button>
            <select
              className="filter-dropdown"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="OD">OD</option>
            </select>
          </div>
        )}
      </div>

      {/* ===== Students Table ===== */}
      {activeTab === "students" && (
        <>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Regn No.</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Change Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student, idx) => (
                    <tr key={idx}>
                      <td>{student.name}</td>
                      <td>{student.regnNo}</td>
                      <td>{student.date}</td>
                      <td>{student.time}</td>
                      <td>{student.status}</td>
                      <td>
                        <select
                          className="status-select"
                          value={student.status}
                          onChange={(e) =>
                            handleStatusChange(student.regnNo, e.target.value)
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

      {/* ===== Requests Table ===== */}
      {activeTab === "requests" && (
        <div className="table-wrapper requests">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Regn No.</th>
                <th>Type</th>
                <th>Reason</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req, index) => (
                <tr key={index}>
                  <td>{req.name}</td>
                  <td>{req.regnNo}</td>
                  <td>{req.type}</td>
                  <td>{req.reason}</td>
                  <td>
                    <button
                      className="accept"
                      onClick={() =>
                        handleRequestAction(req.regnNo, "accept", req.type)
                      }
                    >
                      Accept
                    </button>
                    <button
                      className="deny"
                      onClick={() =>
                        handleRequestAction(req.regnNo, "deny", req.type)
                      }
                    >
                      Deny
                    </button>
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

export default App;

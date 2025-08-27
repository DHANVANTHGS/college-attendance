import React, { useState } from "react";

const RequestForm = () => {
  const [name, setName] = useState("");
  const [regnNo, setRegnNo] = useState("");
  const [type, setType] = useState("Leave");
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requestBody = {
      name,
      regnNo,
      type,
      reason,
    };

    try {
      const response = await fetch("http://localhost:5000/api/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        credentials:"include"
      });

      const data = await response.json();

      if (data.status === true) {
        setSubmitted(true);
        setTimeout(() => (window.location.href = "/"), 2000);
      } else {
        alert("Failed to submit request.");
      }
    } catch (error) {
      console.error("Error submitting request:", error);
      alert("Something went wrong.");
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-green-100 text-green-800 text-lg">
        ✅ Request submitted successfully!
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md p-6 rounded-lg max-w-md w-full"
      >
        <h2 className="text-xl font-bold mb-4">Submit a Request</h2>

        <label className="block mb-2 font-medium">Name</label>
        <input
          required
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border p-2 mb-4 rounded"
        />

        <label className="block mb-2 font-medium">Registration Number</label>
        <input
          required
          type="text"
          value={regnNo}
          onChange={(e) => setRegnNo(e.target.value)}
          className="w-full border p-2 mb-4 rounded"
        />

        <label className="block mb-2 font-medium">Request For</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full border p-2 mb-4 rounded"
        >
          <option value="Leave">Leave</option>
          <option value="OD">OD</option>
        </select>

        <label className="block mb-2 font-medium">Reason</label>
        <textarea
          required
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full border p-2 mb-4 rounded"
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Submit Request
        </button>
      </form>
    </div>
  );
};

export default RequestForm;

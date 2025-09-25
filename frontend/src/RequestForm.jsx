import React, { useState } from "react";

const RequestForm = () => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "Leave",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: ""
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title || !form.description || !form.type || !form.startDate || !form.endDate) {
      setError("Please fill in all required fields.");
      return;
    }
    if (form.type === "OD" && (!form.startTime || !form.endTime)) {
      setError("Start and end time are required for OD requests.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/student/sendRequest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          type: form.type,
          startDate: form.startDate,
          endDate: form.endDate,
          startTime: form.type === "OD" ? form.startTime : null,
          endTime: form.type === "OD" ? form.endTime : null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to send request");
      }

      setSuccess("Request submitted successfully!");
      setForm({
        title: "",
        description: "",
        type: "Leave",
        startDate: "",
        endDate: "",
        startTime: "",
        endTime: ""
      });
    } catch (err) {
      setError(err.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form onSubmit={handleSubmit} className="bg-white shadow-md p-6 rounded-lg max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Submit a Request</h2>

        <label className="block mb-2 font-medium">Title</label>
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          required
          className="w-full border p-2 mb-4 rounded"
        />

        <label className="block mb-2 font-medium">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          required
          className="w-full border p-2 mb-4 rounded"
        />

        <label className="block mb-2 font-medium">Request Type</label>
        <select
          name="type"
          value={form.type}
          onChange={handleChange}
          required
          className="w-full border p-2 mb-4 rounded"
        >
          <option value="Leave">Leave</option>
          <option value="OD">OD</option>
        </select>

        <label className="block mb-2 font-medium">Start Date</label>
        <input
          type="date"
          name="startDate"
          value={form.startDate}
          onChange={handleChange}
          required
          className="w-full border p-2 mb-4 rounded"
        />

        <label className="block mb-2 font-medium">End Date</label>
        <input
          type="date"
          name="endDate"
          value={form.endDate}
          onChange={handleChange}
          required
          className="w-full border p-2 mb-4 rounded"
        />

        {form.type === "OD" && (
          <>
            <label className="block mb-2 font-medium">Start Time</label>
            <input
              type="time"
              name="startTime"
              value={form.startTime}
              onChange={handleChange}
              required={form.type === "OD"}
              className="w-full border p-2 mb-4 rounded"
            />

            <label className="block mb-2 font-medium">End Time</label>
            <input
              type="time"
              name="endTime"
              value={form.endTime}
              onChange={handleChange}
              required={form.type === "OD"}
              className="w-full border p-2 mb-4 rounded"
            />
          </>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Submit Request
        </button>

        {error && <div className="text-red-600 mt-4">{error}</div>}
        {success && <div className="text-green-600 mt-4">{success}</div>}
      </form>
    </div>
  );
};

export default RequestForm;

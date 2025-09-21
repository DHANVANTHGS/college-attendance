import './AddStudentForm.css';
import React, { useState } from 'react';
import './App.css';
import { useParams } from 'react-router-dom';

function AddStudentForm() {
  const [showForm, setShowForm] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const {department,roomno}=useParams();

  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    email: '',
    password: '',
    department: '',
    year: '',
    department,
    roomno
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'email') setEmailError(false);
    if (name === 'password') setPasswordError(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    const isEmailValid = formData.email.endsWith('@citchennai.net');
    const isPasswordValid = formData.password.trim().length >= 6;

    setEmailError(!isEmailValid);
    setPasswordError(!isPasswordValid);

    if (!isEmailValid || !isPasswordValid) return;

    try {
      // Send POST request to backend
      const res = await fetch(`http://localhost:5000/staff/addUser?department=${department}&class=${roomno}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials:"include",
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error('Failed to add student');

      const data = await res.json();
      console.log("Student added:", data);

      alert("Student added successfully!");
      setShowForm(false);
      clearForm();
    } catch (err) {
      console.error(err);
      alert("Error adding student");
    }
  };

  const clearForm = () => {
    setFormData({
      name: '',
      dob: '',
      email: '',
      password: '',
      department: '',
      year: ''
    });
    setEmailError(false);
    setPasswordError(false);
  };

  return (
    <div className="page">
      {!showForm ? (
        <button className="add-student-button" onClick={() => setShowForm(true)}>
          Add Student
        </button>
      ) : (
        <div className="form-container">
          <form className="add-student-form" onSubmit={handleSubmit}>
            <h2>Add New Student</h2>

            <label>Name:
              <input name="name" value={formData.name} onChange={handleChange} required />
            </label>

            <label>Date of Birth:
              <input type="date" name="dob" value={formData.dob} onChange={handleChange} required />
            </label>

            <label>Email:
              <input
                type="email"
                name="email"
                placeholder="example@citchennai.net"
                value={formData.email}
                onChange={handleChange}
                className={emailError ? 'error' : ''}
                required
              />
              {emailError && <span className="error-text">* Email must end with @citchennai.net</span>}
            </label>

            <label>Password:
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={passwordError ? 'error' : ''}
                required
              />
              {passwordError && <span className="error-text">* Password must be at least 6 characters</span>}
            </label>

            <label>Department:
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
              >
                <option value="">Select Department</option>
                <option value="Cyber Security">Cyber Security</option>
              </select>
            </label>

            <label>Year:
              <input
                type="number"
                name="year"
                min="1"
                max="5"
                value={formData.year}
                onChange={handleChange}
                required
              />
            </label>

            <div className="form-buttons">
              <button className="submit-button" type="submit">Submit</button>
              <button className="clear-button" type="button" onClick={clearForm}>Clear</button>
              <button className="back-button" type="button" onClick={() => setShowForm(false)}>Back</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default AddStudentForm;
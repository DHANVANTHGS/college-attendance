import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
const LoginPage = () => {
  const [role, setRole] = useState("Student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
  e.preventDefault();

  const response = await fetch("http://localhost:5000/main/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password,role }),
  });

  const data = await response.json();
  if(response.status === 200){
    if ( role=="Staff" ) {
      const { department, roomno } = data;
      navigate(`/staff/${department}/${roomno}`);
    } else if(response.status === 200 && role=="Student" ){
      navigate("/student")
    }
    else if(response.status===200 && role=="System"){
      navigate("/system/qrgen")
    }
  }
  else{
    alert(data.message);
  }
};
/*
const handleLogin = async (e) => {
  e.preventDefault();

  // Simulated response from backend
  const dummyResponse = {
    status: "success",
    department: "ECE",
    roomno: "101",
  };

  // Simulate async delay like a real fetch
  setTimeout(() => {
    const { department, roomno } = dummyResponse;
    if(role=="Staff"){
    navigate(`/staff/${department}/${roomno}`);}
    else if(role=="Student"){
      navigate("/student")
    }
  }, 500);
};
*/

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 to-teal-900 px-6 overflow-hidden">
      
      {/* Responsive background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40  pointer-events-none"
        style={{
  backgroundImage: "url('/bg-shape.png')",
  backgroundSize: 'cover',
  transform: 'scale(1)'
}}

      />

      {/* Login Card */}
<div
  className="z-10 w-full max-w-sm backdrop-blur-md p-6 sm:p-8 rounded-xl shadow-xl text-white text-center"
  style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }} // 0.7 = 70% opaque
>

        <h2 className="text-4xl font-bold mb-6">Log In</h2>

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Role Dropdown */}
          <div className="text-left">
            <label htmlFor="role" className="block text-sm mb-1">Role</label>
            <select
              id="role"
              name="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-2 rounded-full text-black focus:outline-none"
              required
            >
              <option>Student</option>
              <option>Staff</option>
              <option>System</option>
            </select>
          </div>

          {/* Email Input */}
          <div className="text-left">
            <label htmlFor="email" className="block text-sm mb-1">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-full text-black focus:outline-none"
              placeholder="you@example.com"
              required
            />
          </div>

          {/* Password Input */}
          <div className="text-left">
            <label htmlFor="password" className="block text-sm mb-1">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-full text-black focus:outline-none"
              placeholder="********"
              required
            />
            <div className="text-right mt-1">
              <a href="/forgot-password" className="text-sm text-gray-300 hover:underline">
                Forgot Password?
              </a>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
          className=" w-full bg-gradient-to-r from-green-500 to-yellow-500 hover:from-red-500 hover:to-green-500 text-white px-6 py-2 rounded-full font-bold transition duration-300">

          LOGIN
          </button>
        </form>

        {/* Register Link */}
        <p className="mt-4 text-sm">
          New here?{" "}
          <a href="#" className="text-teal-300 hover:underline">
            Register Here
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

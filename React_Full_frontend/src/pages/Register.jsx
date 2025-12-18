import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config/api";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    confirm: "",
    userType: "user"
  });

  function update(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleRegister(e) {
    e.preventDefault();

    if (form.password !== form.confirm) {
      alert("Passwords do not match!");
      return;
    }

    try {
      console.log('Sending registration data:', form);
      
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          userType: form.userType
        })
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.success) {
        alert(`${form.userType === 'admin' ? 'Admin' : 'User'} Account Created Successfully!`);
        navigate("/login");
      } else {
        alert(data.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed. Please check if the server is running.');
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Create Account</h1>

        <form className="login-form" onSubmit={handleRegister}>
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={update}
            required
            placeholder="Enter your name"
          />

          <label>Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={update}
            required
            placeholder="Enter your email"
          />

          <label>Mobile</label>
          <input
            type="text"
            name="mobile"
            value={form.mobile}
            onChange={update}
            required
            placeholder="Enter mobile number"
          />

          <label>Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={update}
            required
            placeholder="Enter password"
          />

          <label>Confirm Password</label>
          <input
            type="password"
            name="confirm"
            value={form.confirm}
            onChange={update}
            required
            placeholder="Re-enter password"
          />

          <label>Account Type</label>
          <select
            name="userType"
            value={form.userType}
            onChange={update}
            required
            style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>

          <button className="primary-button full-width" type="submit">
            Create Account
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "10px" }}>
          Already have an account?{" "}
          <span
            style={{ color: "var(--accent)", cursor: "pointer" }}
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

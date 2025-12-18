// pages/Home.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import homeImg from "../assets/homeimage.png.png";

export default function Home() {
  const navigate = useNavigate();

  const [mobile, setMobile] = useState("");
  const [error, setError] = useState("");

  function handleProceed() {
    // validation
    if (mobile.length !== 10) {
      setError("Mobile number must be exactly 10 digits");
      return;
    }

    const login = localStorage.getItem("loggedIn");
    if (!login) {
      setError(""); // clear error
      alert("Please login first!");
      navigate("/login");
      return;
    }

    setError(""); // clear error
    // Store mobile number for use in Plans page
    localStorage.setItem("currentMobile", mobile);
    navigate("/plans");
  }

  return (
    <div className="home-container">

      {/* ============================= */}
      {/*          HERO BANNER          */}
      {/* ============================= */}
      <section className="hero-card">
        <div className="hero-left">
          <h1 className="recharge-title">Recharge Made Easy</h1>
          <p className="recharge-sub">Fast, secure & instant recharge for all mobile operators.</p>
        </div>

        <div className="hero-right">
          <img src={homeImg} alt="Recharge Banner" className="hero-banner-img" />
        </div>
      </section>


      {/* ============================= */}
      {/*      ENTER DETAILS FORM       */}
      {/* ============================= */}
      <section className="recharge-section">
        <div className="form-card">
          <h3 className="section-heading">Enter Details</h3>

          <div className="recharge-form">
            {/* MOBILE INPUT */}
            <label>
              Mobile Number
              <input
                type="text"
                maxLength="10"
                value={mobile}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^\d*$/.test(val)) {
                    setMobile(val);
                  }
                  if (val.length === 10) {
                    setError("");
                  }
                }}
                placeholder="Enter 10-digit number"
              />
            </label>

            {/* 🔥 INLINE ERROR (RED TEXT BELOW INPUT) */}
            {error && <p className="error-text">{error}</p>}

            {/* OPERATOR */}
            <label>
              Operator
              <select>
                <option>Airtel</option>
                <option>Jio</option>
                <option>VI</option>
                <option>BSNL</option>
              </select>
            </label>

            {/* PROCEED BUTTON */}
            <button className="primary-button full-width" onClick={handleProceed}>
              Proceed
            </button>
          </div>
        </div>
      </section>
     

      {/* ============================= */}
      {/*       DASHBOARD SECTION       */}
      {/* ============================= */}
      <section className="dashboard-section">
        <h2 className="dashboard-title">Welcome to your Recharge Dashboard</h2>
        <p className="dashboard-sub">
          Manage your recharges, view offers and track recent activity.
        </p>

        
        {/* Latest Offers */}
        <div className="dashboard-card">
          <h3>Latest Offers</h3>
          <ul className="offer-list">
            <li>1GB Extra Data on recharge above ₹299</li>
            <li>₹30 Cashback on first recharge</li>
            <li>Unlimited Calls + 2GB/day on ₹399 plan</li>
          </ul>
        </div>

        {/* About Section */}
        <div className="dashboard-card">
          <p>
            With Recharge App, managing your mobile recharges has never been easier.
            We offer a user-friendly interface that helps you quickly browse, compare,
            and choose the best recharge plans across all major telecom operators.
          </p>

          <p>
            Our system provides real-time updates on offers and special deals so that
            you never miss an opportunity to save. You can also view your previous
            recharge transactions, access customer support, and receive personalized
            plan recommendations based on your usage.
          </p>

          <p>
            Enjoy secure payments, instant recharge confirmations, and a smooth overall
            experience—all in one place.
          </p>
        </div>
      </section>
    </div>
  );
}

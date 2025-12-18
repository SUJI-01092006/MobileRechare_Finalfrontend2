import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config/api";

// Tabs you want
const FIXED_TABS = [
  "RECOMMENDED",
  "TRULY UNLIMITED",
  "SMART RECHARGE",
  "DATA",
  "UNLIMITED 5G"
];

export default function Plans() {
  const [plans, setPlans] = useState([]);
  const [activeTab, setActiveTab] = useState("RECOMMENDED");

  const navigate = useNavigate();

  // Load plans from backend API
  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/plans`);
      const data = await response.json();
      if (data.success) {
        setPlans(data.plans);
      } else {
        console.error('Failed to fetch plans:', data.message);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
      // Fallback to default plans if API fails
      const defaultPlans = [
        { _id: "1", price: 199, validity: "28 Days", data: "1.5GB/Day", call: "Unlimited", operator: "Airtel", type: "RECOMMENDED" },
        { _id: "2", price: 49, validity: "1 Day", data: "1GB", call: "100 mins", operator: "Airtel", type: "SMART RECHARGE" },
        { _id: "3", price: 599, validity: "84 Days", data: "Unlimited", call: "Unlimited", operator: "Airtel", type: "TRULY UNLIMITED" },
        { _id: "4", price: 299, validity: "30 Days", data: "25GB", call: "No Voice", operator: "Airtel", type: "DATA" },
        { _id: "5", price: 999, validity: "365 Days", data: "2GB/Day 5G", call: "Unlimited", operator: "Airtel", type: "UNLIMITED 5G" }
      ];
      setPlans(defaultPlans);
    }
  };

  // Normalize for matching text
  function normalize(str) {
    if (!str) return "";
    return str.toString().trim().toUpperCase().replace(/\s+/g, " ");
  }

  // Decide which tab/category a plan belongs to based on its details
  function getCategoryForPlan(p) {
    // If backend already set an explicit type/category, use that
    if (p.type || p.Type) {
      return p.type || p.Type;
    }

    const desc = normalize(p.description || "");
    const data = normalize(p.data || "");
    const call = normalize(p.call || "");
    const validity = normalize(p.validity || p.Validity || "");
    const price = Number(p.price) || 0;

    // Extract days from validity
    const daysMatch = validity.match(/(\d+)\s*DAY/i);
    const days = daysMatch ? parseInt(daysMatch[1], 10) : null;

    console.log(`Plan ₹${price}: days=${days}, data="${data}", call="${call}"`);

    // 1) UNLIMITED 5G: plans with "UNLIMITED 5G" in data
    if (data.includes("UNLIMITED 5G")) {
      return "UNLIMITED 5G";
    }

    // 2) SMART RECHARGE: 1-day plans
    if (days === 1) {
      return "SMART RECHARGE";
    }

    // 3) DATA: plans with "NO CALLS" in call field
    if (call.includes("NO CALLS")) {
      return "DATA";
    }

    // 4) TRULY UNLIMITED: 56+ days with unlimited calls
    if (days && days >= 56 && call.includes("UNLIMITED CALLS")) {
      return "TRULY UNLIMITED";
    }

    // 5) RECOMMENDED: everything else
    return "RECOMMENDED";
  }

  // Filter plans by Type / Category (explicit `type` or derived from details)
  const filteredPlans = plans.filter((p) => {
    const category = getCategoryForPlan(p);
    return normalize(category) === normalize(activeTab);
  });

  // Recharge Handler
  async function handleRecharge(p) {
    const login = localStorage.getItem("loggedIn");
    const token = localStorage.getItem("token");

    if (!login || !token) {
      alert("Please login first!");
      navigate("/login");
      return;
    }

    try {
      const rechargeData = {
        phoneNumber: "1234567890",
        operator: p.operator || "Airtel",
        planId: p._id,
        amount: p.price,
        status: "SUCCESS",
        type: getCategoryForPlan(p)
      };

      const response = await fetch(`${API_BASE_URL}/api/recharge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(rechargeData)
      });

      const data = await response.json();
      
      if (data.success) {
        alert("Recharge successful!");
        navigate("/history");
      } else {
        alert(data.message || "Recharge failed!");
      }
    } catch (error) {
      console.error('Recharge error:', error);
      alert("Recharge failed! Please try again.");
    }
  }

  return (
    <div className="plans-page">
      <h2 className="plans-title">Select Plan</h2>

      {/* Tabs */}
      <div className="plans-tabs">
        {FIXED_TABS.map((tab) => (
          <button
            key={tab}
            className={`plan-tab ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <hr />

      {/* Debug Info */}
      <div style={{fontSize: '12px', color: '#666', marginBottom: '10px'}}>
        Total plans: {plans.length} | Filtered: {filteredPlans.length} | Active tab: {activeTab}
      </div>

      {/* Plans List */}
      <div className="plans-list">
        {filteredPlans.length === 0 ? (
          <p>No plans available in this category</p>
        ) : (
          filteredPlans.map((p) => (
          <div className="plan-box" key={p._id || p.id}>
              <div className="plan-info">
                <h3 className="plan-price">₹{p.price}</h3>
                <p className="plan-validity">
                  {p.validity || p.Validity} • {p.data}
                </p>
                <p className="plan-calls">{p.call}</p>
                {p.description && (
                  <p className="plan-description">{p.description}</p>
                )}
                <small style={{color: '#999'}}>Category: {getCategoryForPlan(p)}</small>
              </div>

              <button
                className="apply-btn"
                onClick={() => handleRecharge(p)}
              >
                Recharge
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

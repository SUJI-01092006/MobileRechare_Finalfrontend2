import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config/api';

const Admin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('analytics');
  const [plans, setPlans] = useState([]);
  const [editingPlan, setEditingPlan] = useState(null);
  const [showAddPlan, setShowAddPlan] = useState(false);

  // Check if user is admin on component mount
  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    const isLoggedIn = localStorage.getItem('loggedIn');
    
    if (userRole !== 'admin' || isLoggedIn !== 'true') {
      navigate('/login');
    }
  }, [navigate]);

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
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast.error('Failed to load plans');
    }
  };

  const [transactions, setTransactions] = useState([]);

  // Fetch all recharge history from backend
  useEffect(() => {
    fetchAllHistory();
  }, []);

  const fetchAllHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/recharge/history`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setTransactions(data.history);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  // --- Analytics helpers ---
  const normalizeDate = (value) => {
    if (!value) return null;
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    return d.toDateString();
  };

  const todayKey = new Date().toDateString();

  const safeAmount = (t) => {
    return Number(t.amount ?? t.price ?? 0) || 0;
  };

  const todayRecharges = transactions.filter(
    (t) => normalizeDate(t.date) === todayKey
  );

  const todayTotalAmount = todayRecharges.reduce(
    (sum, t) => sum + safeAmount(t),
    0
  );

  const totalRecharges = transactions.length;
  const totalAmount = transactions.reduce(
    (sum, t) => sum + safeAmount(t),
    0
  );

  const averageAmount =
    totalRecharges > 0 ? Math.round(totalAmount / totalRecharges) : 0;

  // Plan management functions
  const handleDeletePlan = async (planId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/plans/${planId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        fetchPlans();
        toast.success('Plan deleted successfully');
      } else {
        toast.error(data.message || 'Failed to delete plan');
      }
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast.error('Failed to delete plan');
    }
  };

  const handleUpdatePlan = async (planData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/plans/${planData._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(planData)
      });
      const data = await response.json();
      if (data.success) {
        fetchPlans();
        setEditingPlan(null);
        toast.success('Plan updated successfully');
      } else {
        toast.error(data.message || 'Failed to update plan');
      }
    } catch (error) {
      console.error('Error updating plan:', error);
      toast.error('Failed to update plan');
    }
  };

  const handleAddPlan = async (planData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/plans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(planData)
      });
      const data = await response.json();
      if (data.success) {
        fetchPlans();
        setShowAddPlan(false);
        toast.success('Plan added successfully');
      } else {
        toast.error(data.message || 'Failed to add plan');
      }
    } catch (error) {
      console.error('Error adding plan:', error);
      toast.error('Failed to add plan');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Admin Dashboard</h1>
        <button 
          onClick={() => {
            localStorage.removeItem('loggedIn');
            localStorage.removeItem('userRole');
            localStorage.removeItem('currentUser');
            navigate('/');
          }}
          style={{ padding: '8px 16px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Logout
        </button>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={() => setActiveTab('analytics')}
          style={{ 
            padding: '10px 20px', 
            marginRight: '10px',
            backgroundColor: activeTab === 'analytics' ? '#007bff' : '#f8f9fa',
            color: activeTab === 'analytics' ? 'white' : 'black',
            border: '1px solid #ccc',
            cursor: 'pointer'
          }}
        >
          Analytics
        </button>
        <button 
          onClick={() => setActiveTab('users')}
          style={{ 
            padding: '10px 20px', 
            marginRight: '10px',
            backgroundColor: activeTab === 'users' ? '#007bff' : '#f8f9fa',
            color: activeTab === 'users' ? 'white' : 'black',
            border: '1px solid #ccc',
            cursor: 'pointer'
          }}
        >
          User History
        </button>
        <button 
          onClick={() => setActiveTab('plans')}
          style={{ 
            padding: '10px 20px',
            backgroundColor: activeTab === 'plans' ? '#007bff' : '#f8f9fa',
            color: activeTab === 'plans' ? 'white' : 'black',
            border: '1px solid #ccc',
            cursor: 'pointer'
          }}
        >
          Manage Plans
        </button>
      </div>

      {activeTab === 'analytics' && (
        <div>
          <h2 style={{ marginBottom: '16px' }}>Analytics</h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              gap: '20px',
              marginBottom: '20px',
            }}
          >
            <div
              style={{
                padding: '20px',
                borderRadius: '12px',
                background:
                  'linear-gradient(135deg, rgba(0, 123, 255, 0.1), rgba(0, 123, 255, 0.02))',
                border: '1px solid rgba(0, 123, 255, 0.25)',
              }}
            >
              <h3 style={{ marginBottom: '8px' }}>Today's Recharges</h3>
              <div style={{ fontSize: '32px', fontWeight: '700' }}>
                {todayRecharges.length}
              </div>
              <p style={{ marginTop: '8px', color: '#555' }}>
                Total Amount:{' '}
                <span style={{ fontWeight: 600 }}>₹{todayTotalAmount}</span>
              </p>
            </div>

            <div
              style={{
                padding: '20px',
                borderRadius: '12px',
                background:
                  'linear-gradient(135deg, rgba(40, 167, 69, 0.1), rgba(40, 167, 69, 0.02))',
                border: '1px solid rgba(40, 167, 69, 0.25)',
              }}
            >
              <h3 style={{ marginBottom: '8px' }}>Total Recharges</h3>
              <div style={{ fontSize: '32px', fontWeight: '700' }}>
                {totalRecharges}
              </div>
              <p style={{ marginTop: '8px', color: '#555' }}>
                All Time:{' '}
                <span style={{ fontWeight: 600 }}>₹{totalAmount}</span>
              </p>
            </div>

            <div
              style={{
                padding: '20px',
                borderRadius: '12px',
                background:
                  'linear-gradient(135deg, rgba(255, 193, 7, 0.1), rgba(255, 193, 7, 0.02))',
                border: '1px solid rgba(255, 193, 7, 0.25)',
              }}
            >
              <h3 style={{ marginBottom: '8px' }}>Average Amount</h3>
              <div style={{ fontSize: '32px', fontWeight: '700' }}>
                ₹{averageAmount}
              </div>
              <p style={{ marginTop: '8px', color: '#555' }}>Per transaction</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div>
          <h2>User Transactions (All Users)</h2>
          {transactions.length > 0 ? (
            <div>
              {transactions.map((transaction, index) => (
                <div key={transaction._id || index} style={{ padding: '15px', border: '1px solid #ccc', borderRadius: '8px', marginBottom: '10px' }}>
                  <h4>{transaction.type || 'Recharge'} - {transaction.operator || 'Airtel'}</h4>
                  <p>User: {transaction.userId?.email || transaction.userId?.name || 'Unknown'}</p>
                  <p>Amount: ₹{transaction.amount || 0}</p>
                  <p>Phone: {transaction.phoneNumber || 'N/A'}</p>
                  <p>Status: {transaction.status || 'N/A'}</p>
                  <p>Date: {new Date(transaction.date || transaction.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>No transactions found</p>
          )}
        </div>
      )}

      {activeTab === 'plans' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Manage Plans</h2>
            <button 
              onClick={() => setShowAddPlan(true)}
              style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Add New Plan
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {plans.map(plan => (
              <div key={plan._id} style={{ padding: '15px', border: '1px solid #ccc', borderRadius: '8px' }}>
                <h4>{plan.operator?.toUpperCase()} - ₹{plan.price}</h4>
                <p><strong>Type:</strong> {plan.type}</p>
                <p><strong>Validity:</strong> {plan.validity}</p>
                <p><strong>Data:</strong> {plan.data}</p>
                <p><strong>Calls:</strong> {plan.call}</p>
                <p><strong>Details:</strong> {plan.description}</p>
                {plan.popular && <span style={{ backgroundColor: '#28a745', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>Popular</span>}
                <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => setEditingPlan(plan)}
                    style={{ padding: '5px 10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeletePlan(plan._id)}
                    style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(editingPlan || showAddPlan) && (
        <PlanModal 
          plan={editingPlan}
          isAdd={showAddPlan}
          onSave={editingPlan ? handleUpdatePlan : handleAddPlan}
          onClose={() => {
            setEditingPlan(null);
            setShowAddPlan(false);
          }}
        />
      )}
    </div>
  );
};

const PlanModal = ({ plan, isAdd, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    operator: plan?.operator || 'Airtel',
    price: plan?.price || '',
    validity: plan?.validity || '',
    data: plan?.data || '',
    call: plan?.call || '',
    description: plan?.description || '',
    type: plan?.type || 'RECOMMENDED',
    popular: plan?.popular || false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      operator: formData.operator,
      price: Number(formData.price),
      validity: formData.validity,
      data: formData.data,
      call: formData.call,
      description: formData.description,
      type: formData.type,
      popular: formData.popular
    };
    onSave(isAdd ? submitData : { ...plan, ...submitData });
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '8px', width: '350px', maxHeight: '90vh', overflow: 'auto' }}>
        <h3>{isAdd ? 'Add New Plan' : 'Edit Plan'}</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Operator:</label>
            <select
              value={formData.operator}
              onChange={(e) => setFormData({...formData, operator: e.target.value})}
              style={{ width: '100%', padding: '6px', marginTop: '3px', fontSize: '14px' }}
              required
            >
              <option value="Airtel">Airtel</option>
              <option value="Jio">Jio</option>
              <option value="VI">VI</option>
              <option value="BSNL">BSNL</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Price (₹):</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                style={{ width: '100%', padding: '6px', marginTop: '3px', fontSize: '14px' }}
                required
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Validity:</label>
              <input
                type="text"
                value={formData.validity}
                onChange={(e) => setFormData({...formData, validity: e.target.value})}
                placeholder="e.g., 28 days"
                style={{ width: '100%', padding: '6px', marginTop: '3px', fontSize: '14px' }}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Data:</label>
              <input
                type="text"
                value={formData.data}
                onChange={(e) => setFormData({...formData, data: e.target.value})}
                placeholder="1.5GB/day"
                style={{ width: '100%', padding: '6px', marginTop: '3px', fontSize: '14px' }}
                required
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Calls:</label>
              <input
                type="text"
                value={formData.call}
                onChange={(e) => setFormData({...formData, call: e.target.value})}
                placeholder="Unlimited"
                style={{ width: '100%', padding: '6px', marginTop: '3px', fontSize: '14px' }}
                required
              />
            </div>
          </div>
          <div>
            <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Description:</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Plan details and benefits"
              style={{ width: '100%', padding: '6px', marginTop: '3px', fontSize: '14px', height: '50px', resize: 'vertical' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Category:</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                style={{ width: '100%', padding: '6px', marginTop: '3px', fontSize: '14px' }}
                required
              >
                <option value="RECOMMENDED">RECOMMENDED</option>
                <option value="TRULY UNLIMITED">TRULY UNLIMITED</option>
                <option value="SMART RECHARGE">SMART RECHARGE</option>
                <option value="DATA">DATA</option>
                <option value="UNLIMITED 5G">UNLIMITED 5G</option>
              </select>
            </div>
            <div style={{ marginTop: '20px' }}>
              <label style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <input
                  type="checkbox"
                  checked={formData.popular}
                  onChange={(e) => setFormData({...formData, popular: e.target.checked})}
                />
                Popular
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '15px' }}>
            <button type="button" onClick={onClose} style={{ padding: '6px 12px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}>
              Cancel
            </button>
            <button type="submit" style={{ padding: '6px 12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}>
              {isAdd ? 'Add Plan' : 'Update Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Admin;
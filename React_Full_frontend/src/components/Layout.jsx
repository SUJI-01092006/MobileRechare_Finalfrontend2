// components/Layout.jsx
import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Footer from "./Footer";

export default function Layout({ children }) {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    const loggedIn = localStorage.getItem('loggedIn') === 'true';
    setUserRole(role);
    setIsLoggedIn(loggedIn);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('userRole');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    setUserRole(null);
    setIsLoggedIn(false);
    navigate('/');
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">RechargeApp</div>

        <nav className="nav-links">
          <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
            Home
          </NavLink>
          
          {userRole === 'admin' && isLoggedIn && (
            <NavLink to="/admin" className={({ isActive }) => (isActive ? "active" : "")}>
              Dashboard
            </NavLink>
          )}
          
          <NavLink to="/plans" className={({ isActive }) => (isActive ? "active" : "")}>
            Plans
          </NavLink>
          <NavLink to="/history" className={({ isActive }) => (isActive ? "active" : "")}>
            History
          </NavLink>
          <NavLink to="/contact" className={({ isActive }) => (isActive ? "active" : "")}>
            Contact
          </NavLink>
          
          {!isLoggedIn ? (
            <NavLink to="/login" className={({ isActive }) => (isActive ? "active" : "")}>
              Login
            </NavLink>
          ) : (
            <button 
              onClick={handleLogout}
              className="nav-link"
              style={{ 
                background: 'none', 
                border: 'none', 
                color: 'inherit', 
                cursor: 'pointer', 
                textDecoration: 'none',
                fontSize: 'inherit',
                padding: 0,
                font: 'inherit'
              }}
            >
              Logout
            </button>
          )}
        </nav>
      </header>

      <main className="app-main">{children}</main>

      <Footer />
    </div>
  );
}

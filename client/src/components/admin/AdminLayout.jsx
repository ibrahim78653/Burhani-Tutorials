import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AdminLayout.css';

export default function AdminLayout({ children, title, subtitle, actions }) {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="admin-container">
      {/* Mobile Top Header */}
      <header className="admin-mobile-header">
        <button 
          className="admin-menu-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle navigation menu"
        >
          {sidebarOpen ? '✕' : '☰'}
        </button>
        <Link to="/admin" className="admin-mobile-logo">
          <div className="navbar-logo" style={{ width: 32, height: 32 }}><img src="/bt-logo.webp" alt="Burhani Tutorials Logo" /></div>
          <span>Burhani Admin</span>
        </Link>
        <span className="admin-status-dot" title="Active session" />
      </header>

      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div 
          className="admin-sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <Link to="/" className="admin-logo-link">
            <div className="navbar-logo"><img src="/bt-logo.webp" alt="Burhani Tutorials Logo" /></div>
            <div>
              <div className="admin-brand-title">Burhani Tutorials</div>
              <div className="admin-brand-sub">Board Form Management</div>
            </div>
          </Link>
        </div>

        <nav className="admin-nav">
          <div className="admin-nav-group-label">NAVIGATION</div>
          <NavLink 
            to="/admin" 
            end 
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            <span className="admin-nav-icon">📊</span>
            <span>Dashboard</span>
          </NavLink>
          <NavLink 
            to="/admin/fees" 
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            <span className="admin-nav-icon">🧾</span>
            <span>Fee Management</span>
          </NavLink>
          <NavLink 
            to="/admin/students" 
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            <span className="admin-nav-icon">🎓</span>
            <span>Board Forms</span>
          </NavLink>
          <NavLink 
            to="/admin/admissions" 
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            <span className="admin-nav-icon">📝</span>
            <span>Admission Forms</span>
          </NavLink>
          <NavLink 
            to="/admin/appointments" 
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            <span className="admin-nav-icon">📅</span>
            <span>Appointments</span>
          </NavLink>
          <NavLink 
            to="/admin/free-sessions" 
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            <span className="admin-nav-icon">✨</span>
            <span>Free Sessions</span>
          </NavLink>


        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-pill">
            <div className="admin-avatar">
              {admin?.username?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div className="admin-user-info">
              <div className="admin-username">{admin?.username || 'Admin'}</div>
              <div className="admin-role">Administrator</div>
            </div>
          </div>
          <div className="admin-footer-actions">
            <Link to="/" className="btn btn-ghost btn-sm" title="View Public Portal">
              🌐 Site
            </Link>
            <button onClick={handleLogout} className="btn btn-ghost btn-sm btn-logout" title="Sign Out">
              🚪 Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main">
        <div className="admin-header-bar">
          <div className="admin-page-title-wrap">
            <h1 className="admin-page-title">{title}</h1>
            {subtitle && <p className="admin-page-subtitle">{subtitle}</p>}
          </div>
          {actions && <div className="admin-header-actions">{actions}</div>}
        </div>

        <div className="admin-content-body">
          {children}
        </div>
      </main>
    </div>
  );
}

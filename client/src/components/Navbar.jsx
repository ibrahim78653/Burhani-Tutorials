import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { INSTITUTE_INFO } from '../data/instituteData';
import './Navbar.css';

export default function Navbar({ onOpenAppointment, onOpenFreeSession }) {
  const { isLoggedIn, admin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [admissionsDropdown, setAdmissionsDropdown] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setAdmissionsDropdown(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const scrollToSection = (sectionId) => {
    setMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate(`/#${sectionId}`);
      return;
    }
    const elem = document.getElementById(sectionId);
    if (elem) {
      const navOffset = 80;
      const elementPosition = elem.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <header className={`navbar-header ${scrolled ? 'scrolled' : ''}`}>
      {/* Top Banner Notice */}
      <div className="navbar-top-bar">
        <div className="container top-bar-inner">
          <div className="top-bar-left">
            <span className="top-badge">Since 1996</span>
            <span className="top-text">5000+ Students Educated • 3 Branches in Indore</span>
          </div>
          <div className="top-bar-right">
            <a href="https://www.instagram.com/burhani_tutorial?utm_source=qr&igsi=dWlsczd6MXJ1djJl" target="_blank" rel="noopener noreferrer" className="top-link" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              <span>burhani_tutorial</span>
            </a>
            <span className="top-divider">|</span>
            <a href="tel:9827252114" className="top-link">
              📞 9827252114
            </a>
            <span className="top-divider">|</span>
            <a href="tel:9301262721" className="top-link">
              📞 9301262721
            </a>
            <span className="top-divider">|</span>
            <span className="top-branches-tag">Noorani Nagar • Saify Nagar • Masakin-E-Saifiya</span>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="navbar" role="navigation" aria-label="Main Navigation">
        <div className="container navbar-inner">
          {/* Logo & Brand */}
          <Link to="/" className="navbar-brand" aria-label="Burhani Tutorials Home">
            <div className="navbar-logo">
              <img src="/bt-logo.webp" alt="Burhani Tutorials Logo" />
            </div>
            <div className="navbar-brand-text">
              <div className="navbar-title">Burhani Tutorials</div>
              <div className="navbar-subtitle">30+ Years of Excellence • Est. 1996</div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="navbar-links desktop-only">
            <button type="button" onClick={() => scrollToSection('hero')} className="nav-link">
              Home
            </button>
            <button type="button" onClick={() => scrollToSection('about')} className="nav-link">
              About
            </button>
            <button type="button" onClick={() => scrollToSection('classes')} className="nav-link">
              Classes (5th–12th)
            </button>
            <button type="button" onClick={() => scrollToSection('courses')} className="nav-link">
              Streams (PCM/PCB)
            </button>
            <button type="button" onClick={() => scrollToSection('teachers')} className="nav-link">
              Teachers
            </button>
            <button type="button" onClick={() => scrollToSection('branches')} className="nav-link">
              Branches
            </button>
            <button type="button" onClick={() => scrollToSection('gallery')} className="nav-link">
              Gallery
            </button>

            {/* Admissions Dropdown */}
            <div
              className="nav-dropdown"
              onMouseEnter={() => setAdmissionsDropdown(true)}
              onMouseLeave={() => setAdmissionsDropdown(false)}
            >
              <button
                type="button"
                className={`nav-link dropdown-toggle ${location.pathname.includes('admission') || location.pathname.includes('apply') || location.pathname.includes('select-class') ? 'active' : ''}`}
                onClick={() => setAdmissionsDropdown(!admissionsDropdown)}
                aria-expanded={admissionsDropdown}
              >
                Admissions / Forms ▾
              </button>
              {admissionsDropdown && (
                <div className="dropdown-menu">
                  <Link to="/admission" className="dropdown-item">
                    <span className="dropdown-item-icon">📝</span>
                    <div>
                      <div className="dropdown-item-title">Tutorial Admission Form</div>
                      <div className="dropdown-item-sub">Classes 5th to 12th Regular Admission</div>
                    </div>
                  </Link>
                  <Link to="/select-class" className="dropdown-item">
                    <span className="dropdown-item-icon">🎓</span>
                    <div>
                      <div className="dropdown-item-title">Board Registration Form</div>
                      <div className="dropdown-item-sub">Classes 9th, 10th, 11th & 12th Board</div>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            <button type="button" onClick={() => scrollToSection('contact')} className="nav-link">
              Contact
            </button>
          </div>

          {/* Action CTAs */}
          <div className="navbar-actions desktop-only">
            {onOpenFreeSession && (
              <button
                type="button"
                className="btn btn-outline btn-sm nav-trial-btn"
                onClick={onOpenFreeSession}
              >
                2-Day Free Session
              </button>
            )}

            {onOpenAppointment ? (
              <button
                type="button"
                className="btn btn-accent btn-sm nav-appt-btn"
                onClick={() => onOpenAppointment()}
              >
                Book Appointment
              </button>
            ) : (
              <Link to="/admission" className="btn btn-accent btn-sm">
                Admission Form
              </Link>
            )}

            {isLoggedIn ? (
              <Link to="/admin" className="btn btn-ghost btn-sm nav-admin-btn" title="Admin Dashboard">
                ⚙️ {admin?.username || 'Dashboard'}
              </Link>
            ) : (
              <Link to="/admin/login" className="nav-admin-link" title="Institute Administration">
                Admin
              </Link>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            className="mobile-menu-toggle mobile-only"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-drawer-backdrop" onClick={() => setMobileMenuOpen(false)}>
          <div className="mobile-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-drawer-header">
              <div className="navbar-brand">
                <div className="navbar-logo">
                  <img src="/bt-logo.webp" alt="Burhani Tutorials Logo" />
                </div>
                <div>
                  <div className="navbar-title">Burhani Tutorials</div>
                  <div className="navbar-subtitle">Since 1996 • 5000+ Students</div>
                </div>
              </div>
              <button className="drawer-close" onClick={() => setMobileMenuOpen(false)}>
                ✕
              </button>
            </div>

            <div className="mobile-drawer-body">
              <div className="mobile-drawer-nav">
                <button type="button" onClick={() => scrollToSection('hero')} className="mobile-nav-item">
                  <span>🏠</span> Home
                </button>
                <button type="button" onClick={() => scrollToSection('about')} className="mobile-nav-item">
                  <span>🏛️</span> About Institute
                </button>
                <button type="button" onClick={() => scrollToSection('classes')} className="mobile-nav-item">
                  <span>📚</span> Classes 5th – 12th
                </button>
                <button type="button" onClick={() => scrollToSection('courses')} className="mobile-nav-item">
                  <span>🔬</span> Science & Commerce Streams
                </button>
                <button type="button" onClick={() => scrollToSection('teachers')} className="mobile-nav-item">
                  <span>👨‍🏫</span> Our Teachers / Leadership
                </button>
                <button type="button" onClick={() => scrollToSection('branches')} className="mobile-nav-item">
                  <span>📍</span> 3 Branches in Indore
                </button>
                <button type="button" onClick={() => scrollToSection('gallery')} className="mobile-nav-item">
                  <span>🖼️</span> Institute Gallery
                </button>
                <button type="button" onClick={() => scrollToSection('contact')} className="mobile-nav-item">
                  <span>📞</span> Contact Us
                </button>

                <div className="mobile-nav-divider" />
                <div className="mobile-nav-group-title">STUDENT FORMS & ADMISSION</div>

                <Link to="/admission" className="mobile-nav-item highlight-form" onClick={() => setMobileMenuOpen(false)}>
                  <span>📝</span> Class 5th–12th Admission Form
                </Link>
                <Link to="/select-class" className="mobile-nav-item highlight-form" onClick={() => setMobileMenuOpen(false)}>
                  <span>🎓</span> Class 9th–12th Board Form
                </Link>
              </div>

              {/* Mobile Quick Action Buttons */}
              <div className="mobile-drawer-actions">
                {onOpenAppointment && (
                  <button
                    type="button"
                    className="btn btn-accent btn-block"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAppointment();
                    }}
                  >
                    📅 Book an Appointment
                  </button>
                )}
                {onOpenFreeSession && (
                  <button
                    type="button"
                    className="btn btn-outline btn-block"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenFreeSession();
                    }}
                  >
                    ✨ Get 2-Day Free Session
                  </button>
                )}
              </div>

              {/* Mobile Quick Call Bar */}
              <div className="mobile-call-strip">
                <a href="tel:9827252114" className="mobile-call-btn">
                  📞 Call 9827252114
                </a>
                <a href="tel:9301262721" className="mobile-call-btn">
                  📞 Call 9301262721
                </a>
              </div>

              {/* Admin Link */}
              <div className="mobile-drawer-footer">
                {isLoggedIn ? (
                  <Link to="/admin" className="mobile-admin-link" onClick={() => setMobileMenuOpen(false)}>
                    Admin Dashboard ({admin?.username})
                  </Link>
                ) : (
                  <Link to="/admin/login" className="mobile-admin-link" onClick={() => setMobileMenuOpen(false)}>
                    🔒 Staff & Admin Login
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

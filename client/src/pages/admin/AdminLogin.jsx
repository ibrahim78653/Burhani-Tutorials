import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import './AdminLogin.css';

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) { toast.error('Please enter username and password'); return; }
    setLoading(true);
    try {
      await login(username.trim(), password);
      toast.success('Welcome back!');
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <Helmet>
        <title>Admin Login — Burhani Tutorials</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      {/* Left Branding Panel */}
      <div className="admin-login-left">
        <div className="admin-login-brand">
          <div className="admin-login-logo">
            <img src="/bt-logo.webp" alt="Burhani Tutorials Logo" />
          </div>
          <h1>Burhani Tutorials</h1>
          <p>Admin Portal</p>
        </div>

        <div>
          <div className="admin-login-divider" />
          <div className="admin-login-tagline">
            <blockquote>"30+ Years of Excellence in Teaching"</blockquote>
            <cite>— 5000+ Students Successfully Passed Out</cite>
          </div>
          <div className="admin-login-features">
            <div className="login-feature">
              <span className="login-feature-dot" />
              Manage student admissions & board forms
            </div>
            <div className="login-feature">
              <span className="login-feature-dot" />
              Track appointments & free trial sessions
            </div>
            <div className="login-feature">
              <span className="login-feature-dot" />
              Fee management & PDF export
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="admin-login-right">
        <div className="admin-login-card">
          <div className="admin-login-header">
            <div className="admin-login-icon-wrap">🔐</div>
            <h2>Welcome Back</h2>
            <p>Sign in to access the admin portal</p>
          </div>

          <form onSubmit={handleSubmit} className="admin-login-form">
            <div className="form-group">
              <label className="form-label" htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                className="form-input"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter your username"
                autoComplete="username"
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <div className="password-input-wrap">
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  className="form-input"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button type="button" className="show-pass-btn" onClick={() => setShowPass(!showPass)} aria-label={showPass ? 'Hide password' : 'Show password'}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary btn-lg btn-full">
              {loading ? <><div className="spinner spinner-sm" /> Signing in...</> : 'Sign In →'}
            </button>
          </form>

          <div className="admin-login-back">
            <a href="/">← Back to main site</a>
          </div>
        </div>
      </div>
    </div>
  );
}

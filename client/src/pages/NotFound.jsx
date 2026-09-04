import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/Navbar';

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg, #f5f7fa)', display: 'flex', flexDirection: 'column' }}>
      <Helmet>
        <title>Page Not Found — Burhani Tutorials</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <Navbar />

      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 24px',
        textAlign: 'center',
      }}>
        {/* 404 number */}
        <div style={{
          fontSize: '6rem',
          fontWeight: 800,
          lineHeight: 1,
          background: 'linear-gradient(135deg, #0f172a, #10b981)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: '16px',
          fontFamily: 'var(--font-sans)',
        }}>
          404
        </div>

        {/* Icon */}
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📚</div>

        <h1 style={{
          fontSize: '1.75rem',
          fontWeight: 700,
          color: 'var(--color-primary, #0f172a)',
          marginBottom: '12px',
          fontFamily: 'var(--font-sans)',
        }}>
          Page Not Found
        </h1>

        <p style={{
          fontSize: '1rem',
          color: 'var(--color-text-muted, #64748b)',
          maxWidth: '420px',
          lineHeight: 1.6,
          marginBottom: '32px',
        }}>
          The page you are looking for doesn't exist or may have been moved.
          Return to the homepage to find what you need.
        </p>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link
            to="/"
            className="btn btn-accent btn-md"
          >
            🏠 Go to Homepage
          </Link>
          <Link
            to="/admission"
            className="btn btn-outline btn-md"
          >
            📝 Admission Form
          </Link>
        </div>

        {/* Quick links */}
        <div style={{ marginTop: '40px', color: 'var(--color-text-muted, #64748b)', fontSize: '0.875rem' }}>
          <p style={{ marginBottom: '8px' }}>Quick links:</p>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link to="/admission" style={{ color: 'var(--color-primary, #0f172a)', textDecoration: 'underline' }}>Tutorial Admission</Link>
            <Link to="/select-class" style={{ color: 'var(--color-primary, #0f172a)', textDecoration: 'underline' }}>Board Registration</Link>
            <Link to="/admin/login" style={{ color: 'var(--color-text-light, #94a3b8)', textDecoration: 'underline' }}>Admin Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

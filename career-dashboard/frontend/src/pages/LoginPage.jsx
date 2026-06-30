import React from 'react';
import { useLocation } from 'react-router-dom';

export default function LoginPage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const error = params.get('error');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ width: 360, textAlign: 'center' }}>
        <h1 style={{ color: '#22d3ee', marginBottom: 4 }}>Career Dashboard</h1>
        <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 24 }}>
          Sign in to analyze your resume, GitHub, LinkedIn, and coding profiles.
        </p>

        {error && (
          <p className="bad" style={{ fontSize: 13, marginBottom: 16 }}>
            Sign-in with {error} failed. Please try again.
          </p>
        )}

        <a href="/api/auth/google" style={oauthButtonStyle('#fff', '#111')}>
          Continue with Google
        </a>
        <a href="/api/auth/github" style={oauthButtonStyle('#24292e', '#fff')}>
          Continue with GitHub
        </a>
      </div>
    </div>
  );
}

function oauthButtonStyle(bg, color) {
  return {
    display: 'block',
    background: bg,
    color,
    padding: '12px 16px',
    borderRadius: 8,
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: 14,
    marginBottom: 12,
    border: '1px solid #334155',
  };
}

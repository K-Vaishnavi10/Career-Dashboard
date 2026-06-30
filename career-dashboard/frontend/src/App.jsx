import React from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import { ScoreProvider } from './ScoreContext.jsx';
import { useAuth } from './auth/AuthContext.jsx';
import ProtectedRoute from './auth/ProtectedRoute.jsx';

import LoginPage from './pages/LoginPage.jsx';
import OAuthCallbackPage from './pages/OAuthCallbackPage.jsx';
import ResumePage from './pages/ResumePage.jsx';
import JDMatchPage from './pages/JDMatchPage.jsx';
import GithubPage from './pages/GithubPage.jsx';
import LinkedinPage from './pages/LinkedinPage.jsx';
import CodingPage from './pages/CodingPage.jsx';
import OverallPage from './pages/OverallPage.jsx';

const links = [
  { to: '/', label: 'Overall Score', end: true },
  { to: '/resume', label: 'Resume Analyzer' },
  { to: '/jd-match', label: 'Resume vs JD' },
  { to: '/github', label: 'GitHub Analyzer' },
  { to: '/linkedin', label: 'LinkedIn Analyzer' },
  { to: '/coding', label: 'Coding Profiles' },
];

function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h1>Career Dashboard</h1>
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => (isActive ? 'active' : '')}>
            {l.label}
          </NavLink>
        ))}

        {user && (
          <div style={{ marginTop: 32, paddingTop: 16, borderTop: '1px solid #1e293b' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              {user.avatarUrl && (
                <img src={user.avatarUrl} alt={user.name} style={{ width: 28, height: 28, borderRadius: '50%' }} />
              )}
              <div style={{ fontSize: 13, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.name}
              </div>
            </div>
            <button onClick={logout} style={{ width: '100%', background: '#334155' }}>
              Log out
            </button>
          </div>
        )}
      </aside>
      <main className="main-content">{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <ScoreProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/oauth-callback" element={<OAuthCallbackPage />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Routes>
                  <Route path="/" element={<OverallPage />} />
                  <Route path="/resume" element={<ResumePage />} />
                  <Route path="/jd-match" element={<JDMatchPage />} />
                  <Route path="/github" element={<GithubPage />} />
                  <Route path="/linkedin" element={<LinkedinPage />} />
                  <Route path="/coding" element={<CodingPage />} />
                </Routes>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </ScoreProvider>
  );
}

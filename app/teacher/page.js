'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function TeacherPortal() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [schedules, setSchedules] = useState([]);
  const [homeworks, setHomeworks] = useState([]);
  const [liveMeetLink, setLiveMeetLink] = useState('');
  const [googleConnected, setGoogleConnected] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    async function checkAuth() {
      const token = localStorage.getItem('arena_token');
      if (!token) {
        router.replace('/login');
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();

        if (!data.success || data.user.role !== 'teacher') {
          router.replace('/login');
          return;
        }

        setCurrentUser(data.user);
        await loadAllData(token);
      } catch (err) {
        router.replace('/login');
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [router]);

  const loadAllData = async (token) => {
    try {
      const authHeader = { 'Authorization': `Bearer ${token}` };
      const [schedRes, hwRes] = await Promise.all([
        fetch('/api/schedules', { headers: authHeader }).then(r => r.json()),
        fetch('/api/homeworks', { headers: authHeader }).then(r => r.json())
      ]);

      if (schedRes.success) setSchedules(schedRes.schedules);
      if (hwRes.success) setHomeworks(hwRes.homeworks);
    } catch (e) {
      console.error(e);
    }
  };

  const handleStartClass = async (schedId) => {
    const token = localStorage.getItem('arena_token');
    try {
      const res = await fetch('/api/schedules/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ scheduleId: schedId, meetLink: liveMeetLink })
      });
      const data = await res.json();
      if (data.success) {
        setToast('✅ Class is now LIVE! Broadcast launched.');
        await loadAllData(token);
        setTimeout(() => setToast(''), 4000);
      }
    } catch (e) {
      alert('Error starting class session');
    }
  };

  const handleStopClass = async (schedId) => {
    const token = localStorage.getItem('arena_token');
    try {
      const res = await fetch('/api/schedules/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ scheduleId: schedId })
      });
      const data = await res.json();
      if (data.success) {
        setToast('🛑 Class Session ended.');
        await loadAllData(token);
        setTimeout(() => setToast(''), 4000);
      }
    } catch (e) {
      alert('Error ending session');
    }
  };

  const handleConnectGoogle = async () => {
    const token = localStorage.getItem('arena_token');
    try {
      const res = await fetch('/api/google/oauth-url', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        alert(data.message || 'Google API credentials not configured');
      }
    } catch (e) {
      alert('Error fetching OAuth URL');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('arena_token');
    localStorage.removeItem('arena_user');
    router.replace('/login');
  };

  if (loading) {
    return (
      <div style={{ background: '#090D16', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#06B6D4', fontFamily: 'monospace' }}>
        🔄 Authenticating Instructor Session...
      </div>
    );
  }

  return (
    <div id="app-root">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand-header">
          <div className="brand-logo" style={{ background: 'linear-gradient(135deg, var(--cyan), var(--purple))' }}>👨‍🏫</div>
          <div className="brand-text">
            <h1>ARENA SECURITY</h1>
            <span style={{ color: 'var(--cyan)' }}>Instructor Portal</span>
          </div>
        </div>

        <nav className="nav-menu">
          <div className="nav-section-title">Instructor Controls</div>

          <a className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>
            Classroom Controls
          </a>

          <a className={`nav-link ${activeTab === 'google' ? 'active' : ''}`} onClick={() => setActiveTab('google')}>
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
            Google Workspace OAuth
          </a>

          <a className={`nav-link ${activeTab === 'homeworks' ? 'active' : ''}`} onClick={() => setActiveTab('homeworks')}>
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            Grading & Homeworks
          </a>
        </nav>

        <div className="user-info-box">
          <div className="user-avatar" style={{ background: 'linear-gradient(135deg, var(--cyan), #38BDF8)' }}>RC</div>
          <div className="user-details">
            <h4>{currentUser?.name}</h4>
            <span style={{ color: 'var(--cyan)' }}>Lead Security Instructor</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-wrapper">
        
        {/* Top Header */}
        <header className="top-header">
          <div className="header-title">
            <h2>Instructor Portal — Rahat Chowdhury</h2>
          </div>

          <div className="header-actions">
            <div className="role-switcher-container">
              <Link href="/login" className="role-btn">
                <span>🔄 Switch Account</span>
              </Link>
            </div>

            <button className="btn btn-outline btn-sm" onClick={handleLogout}>
              🚪 Logout
            </button>
          </div>
        </header>

        <div className="content-area">

          {toast && (
            <div className="toast toast-cyan visible" style={{ marginBottom: '20px' }}>
              {toast}
            </div>
          )}

          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <div>
              <div className="section-header">
                <div className="section-title">
                  👨‍🏫 Instructor Management Console
                </div>
                <Link href="/classroom" className="btn btn-cyan btn-lg">
                  🎥 Enter Instructor Canvas
                </Link>
              </div>

              {/* Start Live Class Widget */}
              <div className="glass-card" style={{ marginBottom: '30px', borderColor: 'rgba(6,182,212,0.3)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '14px' }}>🔴 Launch Live Session</h3>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Optional: Google Meet Link (Leave blank for Auto-Create via Meet API)"
                    value={liveMeetLink}
                    onChange={(e) => setLiveMeetLink(e.target.value)}
                    style={{ flex: 1, minWidth: '300px' }}
                  />
                  <button className="btn btn-cyan" onClick={() => handleStartClass('SCH-101')}>
                    🚀 Start Batch 1 Live Session
                  </button>
                </div>
              </div>

              {/* Schedules Table */}
              <div className="glass-card">
                <div className="section-header">
                  <div className="section-title">📅 Assigned Batch Classes (Thu - Sun 9:30-11:30 PM)</div>
                </div>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Batch</th>
                      <th>Day & Date</th>
                      <th>Time</th>
                      <th>Topic</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedules.map((s) => (
                      <tr key={s.id}>
                        <td><span className="badge badge-cyan">{s.batchName}</span></td>
                        <td>{s.day}, {s.date}</td>
                        <td>{s.time}</td>
                        <td style={{ color: '#fff', fontWeight: 600 }}>{s.topic}</td>
                        <td>
                          {s.status === 'LIVE' ? (
                            <span className="badge badge-rose">🔴 LIVE</span>
                          ) : (
                            <span className="badge badge-emerald">UPCOMING</span>
                          )}
                        </td>
                        <td style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {s.status === 'LIVE' ? (
                            <>
                              <button className="btn btn-danger btn-sm" onClick={() => handleStopClass(s.id)}>
                                ⏹️ End Session
                              </button>
                              <Link href={`/classroom?scheduleId=${s.id}`} className="btn btn-cyan btn-sm">
                                🎥 Open Live Canvas & Chat
                              </Link>
                            </>
                          ) : (
                            <>
                              <button className="btn btn-cyan btn-sm" onClick={() => handleStartClass(s.id)}>
                                ▶️ Start Live Class
                              </button>
                              <Link href={`/classroom?scheduleId=${s.id}`} className="btn btn-outline btn-sm">
                                💬 Open Chat Canvas
                              </Link>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* GOOGLE OAUTH TAB */}
          {activeTab === 'google' && (
            <div className="glass-card">
              <div className="section-header">
                <div className="section-title">🔑 Google Workspace OAuth & Classroom Integration</div>
              </div>
              <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
                Connect your official Google Instructor account to automatically generate Google Meet session links, sync Google Classroom coursework, and export student grades.
              </p>

              <button className="btn btn-cyan btn-lg" onClick={handleConnectGoogle}>
                🌐 Connect Google Workspace Account
              </button>
            </div>
          )}

          {/* HOMEWORKS TAB */}
          {activeTab === 'homeworks' && (
            <div className="glass-card">
              <div className="section-header">
                <div className="section-title">📝 Student Homework Submissions & Grading</div>
              </div>
              
              {homeworks.map((hw) => (
                <div key={hw.id} style={{ marginBottom: '24px', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--bg-card-border)' }}>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--cyan)', marginBottom: '8px' }}>{hw.title} ({hw.batchId})</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '14px' }}>{hw.description}</p>
                  
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px' }}>Submissions ({hw.submissions.length}):</div>
                  {hw.submissions.length === 0 ? (
                    <div style={{ color: 'var(--text-dim)', fontSize: '0.82rem' }}>No student submissions yet.</div>
                  ) : (
                    hw.submissions.map((sub, i) => (
                      <div key={i} style={{ background: '#090D16', padding: '12px', borderRadius: '6px', marginBottom: '8px', border: '1px solid var(--bg-card-border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <strong>{sub.studentName} ({sub.studentId})</strong>
                          <span className="badge badge-emerald">{sub.score}</span>
                        </div>
                        <pre style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'pre-wrap' }}>{sub.content}</pre>
                      </div>
                    ))
                  )}
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

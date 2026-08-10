'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AuditorPortal() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [schedules, setSchedules] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [toast, setToast] = useState('');

  // Schedule modal state
  const [showModal, setShowModal] = useState(false);
  const [batchId, setBatchId] = useState('B1');
  const [slot, setSlot] = useState('Thursday');
  const [teacherName, setTeacherName] = useState('Rahat Chowdhury');
  const [topic, setTopic] = useState('');

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

        if (!data.success || data.user.role !== 'auditor') {
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
      const [schedRes, attRes] = await Promise.all([
        fetch('/api/schedules', { headers: authHeader }).then(r => r.json()),
        fetch('/api/attendance', { headers: authHeader }).then(r => r.json())
      ]);

      if (schedRes.success) setSchedules(schedRes.schedules);
      if (attRes.success) setAttendance(attRes.logs);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateSchedule = async () => {
    if (!topic.trim()) return;
    const token = localStorage.getItem('arena_token');

    try {
      const res = await fetch('/api/schedules/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ batchId, slot, teacherName, topic })
      });
      const data = await res.json();
      if (data.success) {
        setToast('✅ Class scheduled & instructor assigned!');
        setShowModal(false);
        setTopic('');
        await loadAllData(token);
        setTimeout(() => setToast(''), 4000);
      }
    } catch (e) {
      alert('Error assigning class');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('arena_token');
    localStorage.removeItem('arena_user');
    router.replace('/login');
  };

  if (loading) {
    return (
      <div style={{ background: '#090D16', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B5CF6', fontFamily: 'monospace' }}>
        🛡️ Authenticating Auditor Session...
      </div>
    );
  }

  return (
    <div id="app-root">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand-header">
          <div className="brand-logo" style={{ background: 'linear-gradient(135deg, var(--purple), var(--rose))' }}>🛡️</div>
          <div className="brand-text">
            <h1>ARENA SECURITY</h1>
            <span style={{ color: 'var(--purple)' }}>Auditor Management</span>
          </div>
        </div>

        <nav className="nav-menu">
          <div className="nav-section-title">Auditor Controls</div>

          <a className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>
            Master Overview
          </a>

          <a className={`nav-link ${activeTab === 'scheduling' ? 'active' : ''}`} onClick={() => setActiveTab('scheduling')}>
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Assign Batch Instructors
          </a>

          <a className={`nav-link ${activeTab === 'attendance' ? 'active' : ''}`} onClick={() => setActiveTab('attendance')}>
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            Master Attendance Logs
          </a>
        </nav>

        <div className="user-info-box">
          <div className="user-avatar" style={{ background: 'linear-gradient(135deg, var(--purple), var(--rose))' }}>AO</div>
          <div className="user-details">
            <h4>Super Admin Auditor</h4>
            <span style={{ color: 'var(--purple)' }}>Silent Audit Mode</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-wrapper">
        
        {/* Top Header */}
        <header className="top-header">
          <div className="header-title">
            <h2>Auditor Management Portal — Super Admin</h2>
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
            <div className="toast toast-purple visible" style={{ marginBottom: '20px' }}>
              {toast}
            </div>
          )}

          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <div>
              <div className="section-header">
                <div className="section-title">🛡️ System Executive Summary</div>
                <button className="btn btn-purple" onClick={() => setShowModal(true)}>
                  ➕ Schedule New Class & Assign Instructor
                </button>
              </div>

              <div className="grid-3" style={{ marginBottom: '30px' }}>
                <div className="glass-card">
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 700 }}>Total Active Batches</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '8px', color: 'var(--purple)' }}>4 Batches (B1 - B4)</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '4px' }}>Thu-Sun (9:30 - 11:30 PM)</div>
                </div>

                <div className="glass-card">
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 700 }}>Silent Audit Mode</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '8px', color: 'var(--cyan)' }}>Active</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '4px' }}>Watch Live without interfering</div>
                </div>

                <div className="glass-card">
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 700 }}>Export Attendance</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '8px', color: 'var(--primary)' }}>Ready</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '4px' }}>CSV / Excel Format</div>
                </div>
              </div>

              {/* Master Schedule Table */}
              <div className="glass-card">
                <div className="section-header">
                  <div className="section-title">📅 Master Class Schedules & Instructor Assignments</div>
                </div>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Batch</th>
                      <th>Day / Slot</th>
                      <th>Assigned Instructor</th>
                      <th>Topic</th>
                      <th>Status</th>
                      <th>Silent Audit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedules.map((s) => (
                      <tr key={s.id}>
                        <td><span className="badge badge-purple">{s.batchName}</span></td>
                        <td>{s.day} ({s.time})</td>
                        <td><strong>{s.teacherName}</strong></td>
                        <td>{s.topic}</td>
                        <td>
                          {s.status === 'LIVE' ? (
                            <span className="badge badge-rose">🔴 LIVE</span>
                          ) : (
                            <span className="badge badge-emerald">UPCOMING</span>
                          )}
                        </td>
                        <td>
                          <Link href="/classroom" className="btn btn-outline btn-sm">
                            👁️ Audit Live Session
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* SCHEDULING TAB */}
          {activeTab === 'scheduling' && (
            <div className="glass-card">
              <div className="section-header">
                <div className="section-title">📌 Schedule Batch Classes & Assign Instructors</div>
                <button className="btn btn-purple" onClick={() => setShowModal(true)}>
                  ➕ Add New Class Slot
                </button>
              </div>

              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Batch</th>
                    <th>Slot</th>
                    <th>Topic</th>
                    <th>Instructor</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.map((s) => (
                    <tr key={s.id}>
                      <td>{s.batchName}</td>
                      <td>{s.day}</td>
                      <td>{s.topic}</td>
                      <td>{s.teacherName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ATTENDANCE TAB */}
          {activeTab === 'attendance' && (
            <div className="glass-card">
              <div className="section-header">
                <div className="section-title">📊 Master Attendance Audit Log (All Students & Batches)</div>
              </div>

              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Student Name</th>
                    <th>Student ID</th>
                    <th>Batch</th>
                    <th>Status</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((log, i) => (
                    <tr key={i}>
                      <td>{log.date}</td>
                      <td><strong>{log.studentName}</strong></td>
                      <td>{log.studentId}</td>
                      <td><span className="badge badge-purple">{log.batchName}</span></td>
                      <td><span className="badge badge-emerald">{log.status}</span></td>
                      <td>{log.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </div>

      {/* Schedule Modal */}
      {showModal && (
        <div className="modal-overlay active">
          <div className="modal-box">
            <div className="modal-header">
              <h3>Schedule New Class Slot</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>

            <div className="form-group">
              <label className="form-label">Target Batch:</label>
              <select className="form-control" value={batchId} onChange={(e) => setBatchId(e.target.value)}>
                <option value="B1">Batch 1 — Web Security</option>
                <option value="B2">Batch 2 — API Security</option>
                <option value="B3">Batch 3 — SOC</option>
                <option value="B4">Batch 4 — Cloud Security</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Day Slot (Thu-Sun 9:30-11:30 PM):</label>
              <select className="form-control" value={slot} onChange={(e) => setSlot(e.target.value)}>
                <option value="Thursday">Thursday (9:30 PM - 11:30 PM)</option>
                <option value="Friday">Friday (9:30 PM - 11:30 PM)</option>
                <option value="Saturday">Saturday (9:30 PM - 11:30 PM)</option>
                <option value="Sunday">Sunday (9:30 PM - 11:30 PM)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Assign Instructor:</label>
              <input
                type="text"
                className="form-control"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Class Topic / Module Title:</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Advanced XSS & CSP Bypass Techniques"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-purple" onClick={handleCreateSchedule}>Confirm & Assign</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

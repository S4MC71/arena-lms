'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function StudentPortal() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [schedules, setSchedules] = useState([]);
  const [homeworks, setHomeworks] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [liveStream, setLiveStream] = useState({ isSharing: false, broadcasterName: '' });
  const [activeMeetLink, setActiveMeetLink] = useState(null);

  // Homework modal state
  const [selectedHw, setSelectedHw] = useState(null);
  const [submissionText, setSubmissionText] = useState('');
  const [submittingHw, setSubmittingHw] = useState(false);
  const [hwToast, setHwToast] = useState('');

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

        if (!data.success || data.user.role !== 'student') {
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
    const interval = setInterval(pollLiveStream, 5000);
    return () => clearInterval(interval);
  }, [router]);

  const loadAllData = async (token) => {
    try {
      const authHeader = { 'Authorization': `Bearer ${token}` };
      
      const [schedRes, hwRes, attRes] = await Promise.all([
        fetch('/api/schedules', { headers: authHeader }).then(r => r.json()),
        fetch('/api/homeworks', { headers: authHeader }).then(r => r.json()),
        fetch('/api/attendance', { headers: authHeader }).then(r => r.json())
      ]);

      if (schedRes.success) setSchedules(schedRes.schedules);
      if (hwRes.success) setHomeworks(hwRes.homeworks);
      if (attRes.success) setAttendance(attRes.logs);
      
      await pollLiveStream();
    } catch (e) {
      console.error(e);
    }
  };

  const pollLiveStream = async () => {
    try {
      const res = await fetch('/api/stream/live');
      const data = await res.json();
      if (data.success) {
        setLiveStream(data.stream || { isSharing: false });
        setActiveMeetLink(data.activeMeetLink || null);
      }
    } catch (e) {}
  };

  const handleLogout = () => {
    localStorage.removeItem('arena_token');
    localStorage.removeItem('arena_user');
    router.replace('/login');
  };

  const handleOpenHwModal = (hw) => {
    setSelectedHw(hw);
    const existing = hw.submissions.find(s => s.studentId === currentUser?.id);
    setSubmissionText(existing ? existing.content : '');
  };

  const handleSubmitHomework = async () => {
    if (!selectedHw || !submissionText.trim()) return;
    setSubmittingHw(true);
    const token = localStorage.getItem('arena_token');

    try {
      const res = await fetch('/api/homeworks/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ homeworkId: selectedHw.id, submissionContent: submissionText })
      });
      const data = await res.json();

      if (data.success) {
        setHwToast('✅ Homework submitted successfully!');
        setSelectedHw(null);
        await loadAllData(token);
        setTimeout(() => setHwToast(''), 4000);
      }
    } catch (e) {
      alert('Error submitting homework');
    } finally {
      setSubmittingHw(false);
    }
  };

  if (loading) {
    return (
      <div style={{ background: '#090D16', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981', fontFamily: 'monospace' }}>
        🔄 Authenticating Student Session...
      </div>
    );
  }

  const batchNames = { B1: 'Batch 1 — Web Security', B2: 'Batch 2 — API Security', B3: 'Batch 3 — SOC', B4: 'Batch 4 — Cloud Security' };

  return (
    <div id="app-root">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand-header">
          <div className="brand-logo">🛡️</div>
          <div className="brand-text">
            <h1>ARENA SECURITY</h1>
            <span>Student Portal</span>
          </div>
        </div>

        <nav className="nav-menu">
          <div className="nav-section-title">Navigation</div>

          <a className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>
            Dashboard
          </a>

          <a className={`nav-link ${activeTab === 'schedule' ? 'active' : ''}`} onClick={() => setActiveTab('schedule')}>
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            My Batch Schedule
          </a>

          <a className={`nav-link ${activeTab === 'homework' ? 'active' : ''}`} onClick={() => setActiveTab('homework')}>
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            Homeworks & Submissions
          </a>

          <a className={`nav-link ${activeTab === 'attendance' ? 'active' : ''}`} onClick={() => setActiveTab('attendance')}>
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            My Attendance Logs
          </a>
        </nav>

        <div className="user-info-box">
          <div className="user-avatar">{currentUser?.avatar || 'ST'}</div>
          <div className="user-details">
            <h4>{currentUser?.name}</h4>
            <span>{batchNames[currentUser?.batchId] || currentUser?.batchId}</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-wrapper">
        
        {/* Top Header */}
        <header className="top-header">
          <div className="header-title">
            <h2>Arena Web Security — Student Portal</h2>
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

          {hwToast && (
            <div className="toast toast-emerald visible" style={{ marginBottom: '20px' }}>
              {hwToast}
            </div>
          )}

          {/* Live Alert Banner if class is active */}
          {(liveStream.isSharing || activeMeetLink) && (
            <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(244,63,94,0.15), rgba(6,182,212,0.15))', borderColor: 'rgba(244,63,94,0.4)', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <span className="badge badge-rose" style={{ marginBottom: '6px' }}>🔴 LIVE CLASS IN PROGRESS</span>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{liveStream.broadcasterName} is Live Now!</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Join the classroom canvas or Google Meet to attend today’s session.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {activeMeetLink && (
                    <a href={activeMeetLink} target="_blank" rel="noopener noreferrer" className="btn btn-cyan">
                      🟢 Join Google Meet
                    </a>
                  )}
                  <Link href="/classroom" className="btn btn-primary">
                    🎥 Open Live Classroom Canvas
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <div>
              <div className="section-header">
                <div className="section-title">
                  🎓 Enrolled Batch: <span>{batchNames[currentUser?.batchId] || currentUser?.batchId}</span>
                </div>
              </div>

              <div className="grid-3" style={{ marginBottom: '30px' }}>
                <div className="glass-card">
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 700 }}>Upcoming Class</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '8px', color: 'var(--primary)' }}>Thu-Sun (9:30 PM)</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '4px' }}>Instructor: Rahat Chowdhury</div>
                </div>

                <div className="glass-card">
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 700 }}>Homework Pending</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '8px', color: 'var(--amber)' }}>{homeworks.length} Assignments</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '4px' }}>Submit via Portal</div>
                </div>

                <div className="glass-card">
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 700 }}>Attendance Rate</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '8px', color: 'var(--cyan)' }}>100% Present</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '4px' }}>Automated Verification</div>
                </div>
              </div>

              {/* Schedules Table */}
              <div className="glass-card" style={{ marginBottom: '30px' }}>
                <div className="section-header">
                  <div className="section-title">📅 Enrolled Batch Schedule</div>
                </div>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Day & Date</th>
                      <th>Time Slot</th>
                      <th>Topic / Subject</th>
                      <th>Instructor</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedules.map((s) => (
                      <tr key={s.id}>
                        <td><strong>{s.day}</strong><br/><span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{s.date}</span></td>
                        <td>{s.time}</td>
                        <td style={{ color: 'var(--text-main)', fontWeight: 600 }}>{s.topic}</td>
                        <td>{s.teacherName}</td>
                        <td>
                          {s.status === 'LIVE' ? (
                            <span className="badge badge-rose">🔴 LIVE NOW</span>
                          ) : (
                            <span className="badge badge-emerald">UPCOMING</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* SCHEDULE TAB */}
          {activeTab === 'schedule' && (
            <div className="glass-card">
              <div className="section-header">
                <div className="section-title">📅 Detailed Batch Class Schedules</div>
              </div>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Batch</th>
                    <th>Date & Day</th>
                    <th>Time</th>
                    <th>Topic</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.map((s) => (
                    <tr key={s.id}>
                      <td><span className="badge badge-cyan">{s.batchName}</span></td>
                      <td>{s.day}, {s.date}</td>
                      <td>{s.time}</td>
                      <td><strong>{s.topic}</strong></td>
                      <td>
                        <Link href={`/classroom?scheduleId=${s.id}`} className="btn btn-outline btn-sm">
                          🎥 View Canvas & Chat
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* HOMEWORK TAB */}
          {activeTab === 'homework' && (
            <div>
              <div className="section-header">
                <div className="section-title">📝 Assigned Homeworks & Submissions</div>
              </div>

              <div className="grid-2">
                {homeworks.map((hw) => {
                  const existingSub = hw.submissions.find(s => s.studentId === currentUser?.id);
                  return (
                    <div className="glass-card" key={hw.id} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                          <span className="badge badge-amber">Due: {hw.dueDate}</span>
                          {existingSub ? (
                            <span className="badge badge-emerald">Status: {existingSub.status} ({existingSub.score})</span>
                          ) : (
                            <span className="badge badge-rose">Not Submitted</span>
                          )}
                        </div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>{hw.title}</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>{hw.description}</p>
                        
                        {existingSub && (
                          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '6px', fontSize: '0.8rem', border: '1px solid var(--bg-card-border)', marginBottom: '14px' }}>
                            <strong>Your Submission:</strong><br/>
                            <span style={{ color: 'var(--cyan)' }}>{existingSub.content}</span>
                          </div>
                        )}
                      </div>

                      <button className="btn btn-primary btn-sm" onClick={() => handleOpenHwModal(hw)}>
                        {existingSub ? '✏️ Update Submission' : '📤 Submit Homework Solution'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ATTENDANCE TAB */}
          {activeTab === 'attendance' && (
            <div className="glass-card">
              <div className="section-header">
                <div className="section-title">📊 Verified Attendance History</div>
              </div>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Batch</th>
                    <th>Status</th>
                    <th>Joined At</th>
                    <th>Class Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((log, index) => (
                    <tr key={index}>
                      <td>{log.date}</td>
                      <td><span className="badge badge-emerald">{log.batchName}</span></td>
                      <td><span className="badge badge-cyan">{log.status}</span></td>
                      <td>{log.joinedAt}</td>
                      <td>{log.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </div>

      {/* Homework Submission Modal */}
      {selectedHw && (
        <div className="modal-overlay active">
          <div className="modal-box">
            <div className="modal-header">
              <h3>Submit Solution: {selectedHw.title}</h3>
              <button className="close-btn" onClick={() => setSelectedHw(null)}>&times;</button>
            </div>
            <div className="form-group">
              <label className="form-label">Writeup / Code / Flag Submission:</label>
              <textarea
                className="form-control"
                rows="5"
                placeholder="Paste payload, code, or explanation here..."
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="btn btn-outline" onClick={() => setSelectedHw(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmitHomework} disabled={submittingHw}>
                {submittingHw ? 'Submitting...' : 'Confirm Submission'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

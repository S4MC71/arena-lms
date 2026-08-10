'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('student1@arena.com');
  const [password, setPassword] = useState('pass123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const performLogin = async (loginEmail, loginPass) => {
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPass })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Invalid credentials. Please try again.');
        setLoading(false);
        return;
      }

      localStorage.setItem('arena_token', data.token);
      localStorage.setItem('arena_user', JSON.stringify(data.user));

      const redirectMap = {
        student: '/student',
        teacher: '/teacher',
        auditor: '/auditor'
      };

      router.replace(redirectMap[data.user.role] || '/student');
    } catch (err) {
      setError('⚠️ Cannot connect to server: ' + err.message);
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    performLogin(email, password);
  };

  const handleQuickLogin = (quickEmail, quickPass) => {
    setEmail(quickEmail);
    setPassword(quickPass);
    performLogin(quickEmail, quickPass);
  };

  return (
    <div style={{ background: 'radial-gradient(circle at 50% 30%, #0F172A 0%, #030712 100%)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ maxWidth: '480px', width: '100%' }}>

        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div className="brand-logo" style={{ width: '60px', height: '60px', fontSize: '2rem', margin: '0 auto 12px', borderRadius: '14px' }}>🛡️</div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.5px', background: 'linear-gradient(135deg, #FFF, #9CA3AF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            ARENA WEB SECURITY
          </h1>
          <p style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '1.5px', marginTop: '4px' }}>
            Virtual Classroom & LMS Portal
          </p>
        </div>

        {/* Login Form Card */}
        <div className="glass-card" style={{ padding: '28px' }}>
          <form onSubmit={handleSubmit} autoComplet="off">

            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Email Address</label>
              <input
                type="email"
                id="login-email"
                className="form-control"
                placeholder="user@arena.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">Password</label>
              <input
                type="password"
                id="login-password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div style={{ color: 'var(--rose)', fontSize: '0.82rem', marginBottom: '14px', fontWeight: 600, padding: '8px 12px', background: 'rgba(244,63,94,0.1)', borderRadius: '6px', border: '1px solid rgba(244,63,94,0.3)' }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
              {loading ? '🔄 Authenticating...' : '🔒 Secure Login to Portal'}
            </button>

          </form>

          {/* Quick Demo Accounts */}
          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--bg-card-border)' }}>
            <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: 700, display: 'block', marginBottom: '10px', textAlign: 'center', letterSpacing: '1px' }}>
              Quick Login (Development & Testing)
            </span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => handleQuickLogin('student1@arena.com', 'pass123')} style={{ justifyContent: 'space-between' }}>
                <span>🎓 Student 1 — Batch 1 (Web Security)</span>
                <span style={{ color: 'var(--cyan)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>student1@arena.com</span>
              </button>

              <button type="button" className="btn btn-outline btn-sm" onClick={() => handleQuickLogin('student2@arena.com', 'pass123')} style={{ justifyContent: 'space-between' }}>
                <span>🎓 Student 2 — Batch 2 (API Security)</span>
                <span style={{ color: 'var(--cyan)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>student2@arena.com</span>
              </button>

              <button type="button" className="btn btn-outline btn-sm" onClick={() => handleQuickLogin('student3@arena.com', 'pass123')} style={{ justifyContent: 'space-between' }}>
                <span>🎓 Student 3 — Batch 3 (SOC)</span>
                <span style={{ color: 'var(--cyan)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>student3@arena.com</span>
              </button>

              <button type="button" className="btn btn-outline btn-sm" onClick={() => handleQuickLogin('student4@arena.com', 'pass123')} style={{ justifyContent: 'space-between' }}>
                <span>🎓 Student 4 — Batch 4 (Cloud Security)</span>
                <span style={{ color: 'var(--cyan)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>student4@arena.com</span>
              </button>

              <button type="button" className="btn btn-outline btn-sm" onClick={() => handleQuickLogin('teacher@arena.com', 'pass123')} style={{ justifyContent: 'space-between', borderColor: 'rgba(6,182,212,0.4)' }}>
                <span>👨‍🏫 Teacher — Rahat Chowdhury</span>
                <span style={{ color: 'var(--cyan)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>teacher@arena.com</span>
              </button>

              <button type="button" className="btn btn-outline btn-sm" onClick={() => handleQuickLogin('auditor@arena.com', 'pass123')} style={{ justifyContent: 'space-between', borderColor: 'rgba(139,92,246,0.4)' }}>
                <span>🛡️ Auditor — Super Admin</span>
                <span style={{ color: 'var(--purple)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>auditor@arena.com</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';

export default function GatewayPage() {
  return (
    <div style={{ background: 'radial-gradient(circle at 50% 30%, #0F172A 0%, #030712 100%)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1000px', width: '100%', textAlign: 'center' }}>
        
        {/* Brand Header */}
        <div style={{ marginBottom: '40px' }}>
          <div className="brand-logo" style={{ width: '64px', height: '64px', fontSize: '2rem', margin: '0 auto 16px', borderRadius: '14px' }}>🛡️</div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.5px', background: 'linear-gradient(135deg, #FFF, #9CA3AF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            ARENA WEB SECURITY
          </h1>
          <p style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '2px', marginTop: '6px' }}>
            Virtual Classroom & LMS Platform (Next.js Powered)
          </p>
          <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '12px auto 0', fontSize: '0.95rem' }}>
            Select your portal below to enter the Arena Web Security environment. Integrated with Zoom Video SDK, Automated Attendance, Live Classwork, and Homework Modules.
          </p>
        </div>

        {/* Portal Cards Grid */}
        <div className="grid-3" style={{ marginBottom: '40px' }}>

          {/* Student Portal Card */}
          <div className="glass-card" style={{ textAlign: 'left', position: 'relative', borderColor: 'rgba(16, 185, 129, 0.3)', background: 'rgba(16, 185, 129, 0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '2.2rem' }}>🎓</span>
                <span className="badge badge-emerald">STUDENT ACCESS</span>
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>Student Portal</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.6', marginBottom: '20px' }}>
                Access your enrolled batch schedules (Thu-Sun 9:30-11:30 PM), join live Zoom classrooms, submit live classworks & homeworks, and view attendance logs.
              </p>
            </div>
            <Link href="/login" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}>
              Enter Student Portal &rarr;
            </Link>
          </div>

          {/* Teacher Portal Card */}
          <div className="glass-card" style={{ textAlign: 'left', position: 'relative', borderColor: 'rgba(6, 182, 212, 0.3)', background: 'rgba(6, 182, 212, 0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '2.2rem' }}>👨‍🏫</span>
                <span className="badge badge-cyan">INSTRUCTOR ACCESS</span>
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>Teacher Portal</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.6', marginBottom: '20px' }}>
                Manage assigned batch classes, start live sessions with auto-attendance, broadcast live classwork countdown timers, and grade student submissions.
              </p>
            </div>
            <Link href="/login" className="btn btn-cyan btn-lg" style={{ width: '100%', justifyContent: 'center' }}>
              Enter Teacher Portal &rarr;
            </Link>
          </div>

          {/* Auditor Portal Card */}
          <div className="glass-card" style={{ textAlign: 'left', position: 'relative', borderColor: 'rgba(139, 92, 246, 0.3)', background: 'rgba(139, 92, 246, 0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '2.2rem' }}>🛡️</span>
                <span className="badge badge-purple">MANAGEMENT ACCESS</span>
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>Auditor Portal</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.6', marginBottom: '20px' }}>
                Schedule classes for Thu-Sun slots, assign instructors to batches (Batch 1-4), watch live ongoing classes in silent audit mode, and export master attendance logs.
              </p>
            </div>
            <Link href="/login" className="btn btn-purple btn-lg" style={{ width: '100%', justifyContent: 'center' }}>
              Enter Auditor Portal &rarr;
            </Link>
          </div>

        </div>

        {/* Live Classroom Quick Access */}
        <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(244,63,94,0.1), rgba(139,92,246,0.1))', borderColor: 'rgba(244,63,94,0.3)', padding: '20px 30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', textAlign: 'left' }}>
            <div>
              <span className="badge badge-rose">🔴 ACTIVE LIVE SESSION</span>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: '4px' }}>Direct Demo: Live Classroom Interface (Zoom SDK Integrated)</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Test the custom video canvas, dynamic student watermark, live chat, and payload code viewer.</p>
            </div>
            <Link href="/classroom" className="btn btn-danger btn-lg">
              🎥 Launch Live Classroom Canvas
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

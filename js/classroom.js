/* Arena Web Security - Live Classroom Module (Zoom Video SDK Ready) */

const Classroom = {
  isAudioOn: true,
  isVideoOn: true,
  isScreenSharing: false,
  timerInterval: null,

  init() {
    this.renderChatMessages();
    this.startTimerCountdown();
  },

  renderChatMessages() {
    const container = document.getElementById('chat-msg-container');
    if (!container) return;

    container.innerHTML = ArenaData.activeRoom.chatMessages.map(msg => `
      <div class="chat-msg">
        <div class="author">
          <span>${msg.author}</span>
          <span class="time">${msg.time}</span>
        </div>
        <div>${msg.text}</div>
      </div>
    `).join('');
    container.scrollTop = container.scrollHeight;
  },

  sendChatMessage() {
    const input = document.getElementById('chat-input-field');
    if (!input || !input.value.trim()) return;

    const user = ArenaData.users[ArenaData.currentRole];
    const newMsg = {
      author: `${user.name} (${user.role})`,
      text: input.value.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    ArenaData.activeRoom.chatMessages.push(newMsg);
    input.value = '';
    this.renderChatMessages();
  },

  switchTab(tabName) {
    document.querySelectorAll('.classroom-sidebar .tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.classroom-sidebar .tab-content').forEach(content => content.classList.remove('active'));

    const activeBtn = Array.from(document.querySelectorAll('.classroom-sidebar .tab-btn'))
      .find(btn => btn.textContent.toLowerCase().includes(tabName));
    if (activeBtn) activeBtn.classList.add('active');

    const activeContent = document.getElementById(`tab-${tabName}`);
    if (activeContent) activeContent.classList.add('active');
  },

  toggleAudio() {
    this.isAudioOn = !this.isAudioOn;
    const btn = document.getElementById('btn-audio-toggle');
    if (btn) {
      btn.classList.toggle('off', !this.isAudioOn);
      btn.innerHTML = this.isAudioOn ? '🎤' : '🔇';
    }
    App.toast(this.isAudioOn ? 'Microphone Unmuted' : 'Microphone Muted');
  },

  toggleVideo() {
    this.isVideoOn = !this.isVideoOn;
    const btn = document.getElementById('btn-video-toggle');
    if (btn) {
      btn.classList.toggle('off', !this.isVideoOn);
      btn.innerHTML = this.isVideoOn ? '📹' : '🚫';
    }
    App.toast(this.isVideoOn ? 'Camera Turned ON' : 'Camera Turned OFF');
  },

  toggleScreenShare() {
    this.isScreenSharing = !this.isScreenSharing;
    const btn = document.getElementById('btn-screen-share');
    if (btn) {
      btn.classList.toggle('active', this.isScreenSharing);
    }
    App.toast(this.isScreenSharing ? 'Started Screen & Code Sharing' : 'Stopped Screen Sharing');
  },

  startTimerCountdown() {
    let secondsLeft = 19 * 60 + 45;
    const display = document.getElementById('timer-clock');
    if (!display) return;

    if (this.timerInterval) clearInterval(this.timerInterval);

    this.timerInterval = setInterval(() => {
      if (secondsLeft <= 0) {
        clearInterval(this.timerInterval);
        display.textContent = "00:00 - EXPIRED";
        return;
      }
      secondsLeft--;
      const mins = Math.floor(secondsLeft / 60).toString().padStart(2, '0');
      const secs = (secondsLeft % 60).toString().padStart(2, '0');
      display.textContent = `${mins}:${secs}`;
    }, 1000);
  },

  submitClassworkSolution() {
    const input = document.getElementById('cw-solution-input');
    if (!input || !input.value.trim()) {
      App.toast('Please enter your solution payload before submitting!');
      return;
    }

    App.toast('✅ Classwork Payload Submitted Successfully! Recorded in Gradebook.');
    input.value = '';
  },

  openPushClassworkModal() {
    App.openModal('modal-push-cw');
  },

  createBreakoutRooms() {
    App.toast('👥 Created 4 Breakout Rooms for Lab Teams (Batch 1)');
  },

  leaveRoom() {
    // Record student left timestamp in attendance log if current role is student
    if (ArenaData.currentRole === 'student') {
      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const currentLog = ArenaData.attendanceLogs.find(l => l.studentId === ArenaData.users.student.id && l.scheduleId === 'SCH-102');
      if (currentLog) {
        currentLog.leftAt = nowTime;
      }
    }

    ArenaData.activeRoom.isInRoom = false;
    App.toast('Left Live Classroom. Attendance logged.');
    App.showView('dashboard');
  }
};

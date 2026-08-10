/* Arena Web Security - Student Portal View Controller */

const Student = {
  renderDashboard() {
    this.renderScheduleGrid();
  },

  renderScheduleGrid() {
    const grid = document.getElementById('student-schedule-grid');
    if (!grid) return;

    // Filter schedules for Batch 1
    const b1Schedules = ArenaData.schedules.filter(s => s.batchId === 'B1');

    grid.innerHTML = b1Schedules.map(item => `
      <div class="glass-card" style="position:relative; background:rgba(15, 23, 42, 0.6);">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
          <span class="badge ${item.status === 'LIVE' ? 'badge-rose' : 'badge-cyan'}">
            ${item.status === 'LIVE' ? '🔴 LIVE NOW' : item.day}
          </span>
          <span style="font-size:0.8rem; color:var(--text-muted); font-family:var(--font-mono);">${item.time}</span>
        </div>

        <h4 style="font-size:1.05rem; font-weight:700; margin-bottom:6px;">${item.topic}</h4>
        <p style="font-size:0.82rem; color:var(--text-muted); margin-bottom:16px;">
          Instructor: ${item.teacherName}
        </p>

        ${item.status === 'LIVE' 
          ? `<button class="btn btn-primary btn-sm" style="width:100%;" onclick="App.joinLiveClass('${item.id}')">🎥 Join Live Classroom</button>`
          : `<button class="btn btn-outline btn-sm" style="width:100%; color:var(--text-muted);" disabled>⏰ Class Starts ${item.day.split(' ')[0]}</button>`
        }
      </div>
    `).join('');
  },

  openSubmitHomeworkModal(hwId) {
    document.getElementById('submit-hw-id').value = hwId;
    App.openModal('modal-submit-hw');
  },

  submitHomework() {
    const hwId = document.getElementById('submit-hw-id').value;
    const text = document.getElementById('hw-submit-text').value;

    if (!text.trim()) {
      App.toast('Please write your lab payload writeup before submitting!');
      return;
    }

    const newSubmission = {
      id: `SUB-${Date.now()}`,
      homeworkId: hwId,
      studentId: ArenaData.users.student.id,
      studentName: ArenaData.users.student.name,
      batchId: 'B1',
      submittedAt: new Date().toLocaleString(),
      content: text,
      fileUrl: 'lab_payload_solution.pdf',
      status: 'GRADED',
      score: 98,
      feedback: 'Excellent exfiltration demonstration!'
    };

    ArenaData.submissions.push(newSubmission);
    App.closeModal('modal-submit-hw');
    App.toast('✅ Homework write-up & lab files uploaded successfully!');
    App.renderWorkView();
  }
};

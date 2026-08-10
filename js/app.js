/* Arena Web Security - Main Application Router & Controller */

const App = {
  init() {
    this.bindRoleSwitcher();
    this.bindNavigationLinks();
    this.setRole(ArenaData.currentRole);
    Classroom.init();
  },

  setRole(role) {
    ArenaData.currentRole = role;

    // Update Role Buttons UI
    document.querySelectorAll('.role-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.role === role);
    });

    // Update Sidebar User Badge
    const user = ArenaData.users[role];
    if (user) {
      document.getElementById('sidebar-avatar').textContent = user.avatar;
      document.getElementById('sidebar-username').textContent = user.name;
      document.getElementById('sidebar-userrole').textContent = `${user.role} ${user.batchId ? `(${user.batchId})` : ''}`;
    }

    // Toggle Auditor Navigation Link Visibility
    document.querySelectorAll('.auditor-only').forEach(el => {
      el.style.display = (role === 'auditor') ? 'flex' : 'none';
    });

    // Toggle Teacher Only Controls Visibility
    document.querySelectorAll('.teacher-only').forEach(el => {
      el.style.display = (role === 'teacher') ? 'inline-flex' : 'none';
    });

    // Update Page Header Title
    const titleMap = {
      student: 'Student Dashboard - Arena Security',
      teacher: 'Teacher Instructor Dashboard',
      auditor: 'Auditor Operations & Scheduling'
    };
    document.getElementById('page-title').textContent = titleMap[role] || 'Arena Security LMS';

    // Refresh Active Views
    this.renderCurrentView();
    this.toast(`Switched to ${role.toUpperCase()} View Portal`);
  },

  bindRoleSwitcher() {
    document.querySelectorAll('.role-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const role = e.currentTarget.dataset.role;
        this.setRole(role);
      });
    });
  },

  bindNavigationLinks() {
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        const view = e.currentTarget.dataset.view;
        this.showView(view);
      });
    });
  },

  showView(viewId) {
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.toggle('active', link.dataset.view === viewId);
    });

    document.querySelectorAll('.view-section').forEach(sec => {
      sec.classList.remove('active');
    });

    const targetSec = document.getElementById(`view-${viewId}`);
    if (targetSec) {
      targetSec.classList.add('active');
    }

    this.renderViewData(viewId);
  },

  renderCurrentView() {
    const activeNav = document.querySelector('.nav-link.active');
    const viewId = activeNav ? activeNav.dataset.view : 'dashboard';
    this.showView(viewId);
  },

  renderViewData(viewId) {
    switch (viewId) {
      case 'dashboard':
        Student.renderDashboard();
        break;
      case 'schedule':
        this.renderScheduleView();
        break;
      case 'work':
        this.renderWorkView();
        break;
      case 'attendance':
        this.renderAttendanceView();
        break;
      case 'auditor':
        Auditor.renderAuditorTable();
        break;
      case 'classroom':
        // Highlight active status
        document.getElementById('sidebar-live-badge').style.display = 'inline-flex';
        break;
    }
  },

  renderScheduleView() {
    const container = document.getElementById('full-schedule-table');
    if (!container) return;

    container.innerHTML = `
      <table class="custom-table">
        <thead>
          <tr>
            <th>Batch Name</th>
            <th>Day Slot</th>
            <th>Time</th>
            <th>Assigned Instructor</th>
            <th>Topic</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${ArenaData.schedules.map(s => `
            <tr>
              <td style="font-weight:700; color:var(--text-main);">${s.batchName}</td>
              <td>${s.day}</td>
              <td>${s.time}</td>
              <td style="color:var(--cyan); font-weight:600;">${s.teacherName}</td>
              <td>${s.topic}</td>
              <td>
                <span class="badge ${s.status === 'LIVE' ? 'badge-rose' : 'badge-emerald'}">
                  ${s.status}
                </span>
              </td>
              <td>
                ${ArenaData.currentRole === 'teacher' && s.status !== 'LIVE'
                  ? `<button class="btn btn-cyan btn-sm" onclick="Teacher.startClass('${s.id}')">🚀 Start Class</button>`
                  : (s.status === 'LIVE' 
                      ? `<button class="btn btn-primary btn-sm" onclick="App.joinLiveClass('${s.id}')">🎥 Join Class</button>`
                      : `<span style="color:var(--text-dim); font-size:0.8rem;">Scheduled</span>`
                    )
                }
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  },

  renderWorkView() {
    const container = document.getElementById('homework-list-container');
    if (!container) return;

    container.innerHTML = ArenaData.homeworks.map(hw => {
      const mySub = ArenaData.submissions.find(sub => sub.homeworkId === hw.id);
      return `
        <div class="glass-card" style="margin-bottom:16px; background:rgba(15, 23, 42, 0.6);">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
            <div>
              <span class="badge badge-purple">Homework Assignment</span>
              <h3 style="font-size:1.15rem; font-weight:700; margin-top:6px;">${hw.title}</h3>
            </div>
            <span class="badge badge-amber">Due: ${hw.dueDate}</span>
          </div>

          <p style="color:var(--text-muted); font-size:0.88rem; margin-bottom:14px;">${hw.description}</p>
          
          <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; border-top:1px solid var(--bg-card-border); padding-top:12px;">
            <div style="font-size:0.82rem; color:var(--cyan);">
              📎 Attachment: <u>${hw.attachment}</u> (Max Score: ${hw.maxScore})
            </div>

            <div>
              ${mySub
                ? `<span class="badge badge-emerald">Submitted (Score: ${mySub.score}/${hw.maxScore})</span>`
                : (ArenaData.currentRole === 'student'
                    ? `<button class="btn btn-primary btn-sm" onclick="Student.openSubmitHomeworkModal('${hw.id}')">📤 Submit Writeup</button>`
                    : `<span class="badge badge-amber">Pending Submissions</span>`
                  )
              }
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  renderAttendanceView() {
    const container = document.getElementById('attendance-table-container');
    if (!container) return;

    container.innerHTML = `
      <table class="custom-table">
        <thead>
          <tr>
            <th>Student / Instructor</th>
            <th>Batch & Topic</th>
            <th>Joined At</th>
            <th>Left At</th>
            <th>Duration</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${ArenaData.attendanceLogs.map(log => `
            <tr>
              <td style="font-weight:700; color:var(--text-main);">${log.studentName}</td>
              <td>
                <div style="font-weight:600; color:var(--cyan);">${log.batchName}</div>
                <div style="font-size:0.78rem; color:var(--text-dim);">${log.topic}</div>
              </td>
              <td>${log.joinedAt}</td>
              <td>${log.leftAt}</td>
              <td style="font-family:var(--font-mono); font-weight:600; color:var(--primary);">${log.durationMins} Mins</td>
              <td>
                <span class="badge badge-emerald">VERIFIED ${log.status}</span>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  },

  joinLiveClass(scheduleId) {
    const sched = ArenaData.schedules.find(s => s.id === scheduleId);
    if (sched) {
      document.getElementById('classroom-topic-title').textContent = sched.topic;
    }

    // Dynamic watermark text with user credentials
    const currentUser = ArenaData.users[ArenaData.currentRole];
    document.getElementById('video-watermark').textContent = `${currentUser.id} | ${currentUser.name} | Arena Security`;

    ArenaData.activeRoom.isInRoom = true;
    this.showView('classroom');
    this.toast(`Joined Live Classroom Session for ${sched ? sched.topic : 'Arena Security'}`);
  },

  toast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toastEl = document.createElement('div');
    toastEl.className = 'toast';
    toastEl.innerHTML = `<span>🛡️</span> <span>${message}</span>`;
    container.appendChild(toastEl);

    setTimeout(() => {
      toastEl.remove();
    }, 4000);
  },

  openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('active');
  },

  closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('active');
  }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

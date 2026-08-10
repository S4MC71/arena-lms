/* Arena Web Security - Auditor Portal Controller */

const Auditor = {
  handleAssignSchedule(e) {
    e.preventDefault();

    const batchId = document.getElementById('assign-batch').value;
    const slotRaw = document.getElementById('assign-slot').value;
    const teacherName = document.getElementById('assign-teacher').value;
    const topic = document.getElementById('assign-topic').value;

    const batch = ArenaData.batches.find(b => b.id === batchId);
    const dayName = slotRaw.split(' ')[0];

    const newSchedule = {
      id: `SCH-${Date.now()}`,
      batchId: batchId,
      batchName: batch ? batch.name : 'Arena Security Batch',
      day: slotRaw,
      date: '2026-08-17',
      time: '9:30 PM - 11:30 PM',
      teacherId: 'TCH-402',
      teacherName: teacherName,
      topic: topic,
      status: 'UPCOMING',
      zoomSessionId: `arena-${batchId.toLowerCase()}-session-${Date.now()}`
    };

    ArenaData.schedules.unshift(newSchedule);

    document.getElementById('assign-topic').value = '';
    App.toast(`✅ Class Assigned & Zoom SDK Session Created for ${batch ? batch.name : 'Batch'}`);
    
    this.renderAuditorTable();
    App.renderScheduleView();
  },

  renderAuditorTable() {
    const container = document.getElementById('auditor-master-table');
    if (!container) return;

    container.innerHTML = `
      <table class="custom-table">
        <thead>
          <tr>
            <th>Batch</th>
            <th>Day & Slot</th>
            <th>Assigned Teacher</th>
            <th>Topic</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${ArenaData.schedules.map(item => `
            <tr>
              <td style="font-weight:700; color:var(--text-main);">${item.batchName}</td>
              <td>${item.day}</td>
              <td style="color:var(--cyan); font-weight:600;">${item.teacherName}</td>
              <td>${item.topic}</td>
              <td>
                <span class="badge ${item.status === 'LIVE' ? 'badge-rose' : 'badge-emerald'}">
                  ${item.status}
                </span>
              </td>
              <td>
                ${item.status === 'LIVE' 
                  ? `<button class="btn btn-purple btn-sm" onclick="App.joinLiveClass('${item.id}')">🕵️ Watch Audit</button>`
                  : `<span style="color:var(--text-dim); font-size:0.8rem;">Scheduled</span>`
                }
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }
};

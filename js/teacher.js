/* Arena Web Security - Teacher Portal Controller */

const Teacher = {
  startClass(scheduleId) {
    const sched = ArenaData.schedules.find(s => s.id === scheduleId);
    if (!sched) return;

    sched.status = 'LIVE';
    
    // Automatic Attendance System Turned ON
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Add teacher attendance record
    const existingLog = ArenaData.attendanceLogs.find(l => l.scheduleId === scheduleId && l.studentId === ArenaData.users.student.id);
    if (!existingLog) {
      ArenaData.attendanceLogs.unshift({
        id: `ATT-${Date.now()}`,
        scheduleId: scheduleId,
        batchName: sched.batchName,
        topic: sched.topic,
        studentId: ArenaData.users.student.id,
        studentName: ArenaData.users.student.name,
        teacherName: sched.teacherName,
        joinedAt: nowTime,
        leftAt: 'In Session',
        durationMins: 0,
        status: 'PRESENT'
      });
    }

    App.toast(`🔴 Class Started! Automatic Attendance System is now ACTIVE.`);
    App.joinLiveClass(scheduleId);
  },

  pushClassworkToRoom() {
    const title = document.getElementById('modal-cw-title').value;
    const desc = document.getElementById('modal-cw-desc').value;
    const timer = parseInt(document.getElementById('modal-cw-timer').value) || 15;

    const newCw = {
      id: `CW-${Date.now()}`,
      scheduleId: 'SCH-102',
      title: title,
      instructions: desc,
      timerMinutes: timer,
      active: true,
      submissionsCount: 0,
      totalStudents: 42
    };

    ArenaData.classworks.unshift(newCw);

    // Update active classroom UI display
    document.getElementById('cw-title').textContent = title;
    document.getElementById('cw-desc').textContent = desc;
    document.getElementById('timer-clock').textContent = `${timer}:00`;

    App.closeModal('modal-push-cw');
    App.toast(`⚡ Classwork Broadcasted to all Students in Room (${timer} Mins Timer)`);
    Classroom.switchTab('timer');
  },

  gradeSubmission(subId, score) {
    const sub = ArenaData.submissions.find(s => s.id === subId);
    if (sub) {
      sub.score = score;
      sub.status = 'GRADED';
      App.toast(`Grade updated: ${score}/100 for ${sub.studentName}`);
      App.renderWorkView();
    }
  }
};

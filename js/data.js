/* Arena Web Security LMS - Central Data Store */

const ArenaData = {
  currentRole: 'student', // 'student', 'teacher', 'auditor'
  
  users: {
    student: {
      id: 'STD-1092',
      name: 'Tanvir Hossain',
      role: 'Student',
      avatar: 'TH',
      batch: 'Batch 1: Web Security & Bug Bounty',
      batchId: 'B1'
    },
    teacher: {
      id: 'TCH-402',
      name: 'Rahat Chowdhury (Lead Instructor)',
      role: 'Teacher',
      avatar: 'RC',
      specialization: 'Application Security & Exploit Development'
    },
    auditor: {
      id: 'AUD-001',
      name: 'Arena Operations Auditor',
      role: 'Auditor',
      avatar: 'AO',
      access: 'Super Admin & Auditor'
    }
  },

  batches: [
    { id: 'B1', name: 'Batch 1: Web Security & Bug Bounty', count: 42 },
    { id: 'B2', name: 'Batch 2: API Security & DevSecOps', count: 38 },
    { id: 'B3', name: 'Batch 3: SOC & Threat Hunting', count: 45 },
    { id: 'B4', name: 'Batch 4: Cloud Security & Penetration Testing', count: 30 }
  ],

  // Class Schedules (Auditor assigned)
  schedules: [
    {
      id: 'SCH-101',
      batchId: 'B1',
      batchName: 'Batch 1: Web Security & Bug Bounty',
      day: 'Thursday (বৃহস্পতি)',
      date: '2026-08-13',
      time: '9:30 PM - 11:30 PM',
      teacherId: 'TCH-402',
      teacherName: 'Rahat Chowdhury',
      topic: 'LFI/RFI Exploitation & Filter Bypass Techniques',
      status: 'UPCOMING', // 'UPCOMING', 'LIVE', 'COMPLETED'
      zoomSessionId: 'arena-b1-lfi-session'
    },
    {
      id: 'SCH-102',
      batchId: 'B1',
      batchName: 'Batch 1: Web Security & Bug Bounty',
      day: 'Friday (শুক্রবার)',
      date: '2026-08-14',
      time: '9:30 PM - 11:30 PM',
      teacherId: 'TCH-402',
      teacherName: 'Rahat Chowdhury',
      topic: 'SQL Injection: Blind, Time-Based & Out-of-Band Exfiltration',
      status: 'LIVE',
      zoomSessionId: 'arena-b1-sqli-session'
    },
    {
      id: 'SCH-103',
      batchId: 'B2',
      batchName: 'Batch 2: API Security & DevSecOps',
      day: 'Saturday (শনি)',
      date: '2026-08-15',
      time: '9:30 PM - 11:30 PM',
      teacherId: 'TCH-402',
      teacherName: 'Rahat Chowdhury',
      topic: 'JWT Token Forgery, Algorithm Confusion & Key Injection',
      status: 'UPCOMING',
      zoomSessionId: 'arena-b2-jwt-session'
    },
    {
      id: 'SCH-104',
      batchId: 'B3',
      batchName: 'Batch 3: SOC & Threat Hunting',
      day: 'Sunday (রবি)',
      date: '2026-08-16',
      time: '9:30 PM - 11:30 PM',
      teacherId: 'TCH-402',
      teacherName: 'Rahat Chowdhury',
      topic: 'Malware Analysis & PCAP Log Investigation',
      status: 'UPCOMING',
      zoomSessionId: 'arena-b3-soc-session'
    }
  ],

  // Live Classworks
  classworks: [
    {
      id: 'CW-301',
      scheduleId: 'SCH-102',
      title: 'XSS Filter Bypass Lab Challenge',
      instructions: 'Craft a valid XSS payload bypassing SVG/Script tags filter for `target.arena-security.local/search?q=`',
      timerMinutes: 20,
      active: true,
      submissionsCount: 28,
      totalStudents: 42
    }
  ],

  // Homework Assignments
  homeworks: [
    {
      id: 'HW-501',
      batchId: 'B1',
      title: 'LFI Payload Exfiltration & PHP Wrapper Report',
      description: 'Analyze the target PHP application, extract sensitive configuration files using `php://filter` wrapper, and submit a detailed PDF/MD writeup.',
      dueDate: '2026-08-16 (Sunday) 9:00 PM',
      maxScore: 100,
      attachment: 'lfi_lab_environment_config.zip'
    },
    {
      id: 'HW-502',
      batchId: 'B1',
      title: 'CSRF Token Bypass & PoC HTML Generator',
      description: 'Construct a self-executing HTML CSRF PoC script targeting password change endpoints.',
      dueDate: '2026-08-20 (Thursday) 9:00 PM',
      maxScore: 50,
      attachment: 'csrf_challenge_doc.pdf'
    }
  ],

  // Student Homework Submissions
  submissions: [
    {
      id: 'SUB-901',
      homeworkId: 'HW-501',
      studentId: 'STD-1092',
      studentName: 'Tanvir Hossain',
      batchId: 'B1',
      submittedAt: '2026-08-14 11:15 AM',
      content: 'PHP Filter wrapper payload used: php://filter/convert.base64-encode/resource=db_config.php. Decoded base64 string reveals MySQL DB password.',
      fileUrl: 'lfi_exfiltration_report_tanvir.pdf',
      status: 'GRADED', // 'PENDING', 'GRADED'
      score: 95,
      feedback: 'Excellent write-up! Great explanation of base64 filter exfiltration.'
    }
  ],

  // Attendance Records
  attendanceLogs: [
    {
      id: 'ATT-801',
      scheduleId: 'SCH-102',
      batchName: 'Batch 1: Web Security & Bug Bounty',
      topic: 'SQL Injection: Blind & Out-of-Band',
      studentId: 'STD-1092',
      studentName: 'Tanvir Hossain',
      teacherName: 'Rahat Chowdhury',
      joinedAt: '9:31 PM',
      leftAt: '11:29 PM',
      durationMins: 118,
      status: 'PRESENT'
    },
    {
      id: 'ATT-802',
      scheduleId: 'SCH-100',
      batchName: 'Batch 1: Web Security & Bug Bounty',
      topic: 'Command Injection & Reverse Shell Labs',
      studentId: 'STD-1092',
      studentName: 'Tanvir Hossain',
      teacherName: 'Rahat Chowdhury',
      joinedAt: '9:30 PM',
      leftAt: '11:30 PM',
      durationMins: 120,
      status: 'PRESENT'
    }
  ],

  // Active Classroom Session State
  activeRoom: {
    isInRoom: false,
    topic: 'SQL Injection: Blind & Out-of-Band',
    teacher: 'Rahat Chowdhury',
    isAudioOn: true,
    isVideoOn: true,
    isScreenSharing: false,
    chatMessages: [
      { author: 'Rahat Chowdhury (Teacher)', text: 'Welcome everyone! Today we are covering SQLi exfiltration payloads.', time: '9:31 PM' },
      { author: 'Tanvir Hossain (Student)', text: 'Sir, is time-based blind SQLi applicable on PostgreSQL?', time: '9:33 PM' },
      { author: 'Rahat Chowdhury (Teacher)', text: 'Yes, using pg_sleep() function.', time: '9:34 PM' }
    ]
  }
};

/**
 * POST /api/google/classroom/coursework
 * Creates a new assignment in Google Classroom for a specific batch
 */
const { db, verifyToken, setCors } = require('../../_db');
const { getAuthClientForUser, isGoogleConfigured } = require('../../_google');

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { google } = require('googleapis');

  const user = verifyToken(req.headers.authorization);
  if (!user || user.role !== 'teacher') return res.status(403).json({ error: 'Teachers only' });

  if (!isGoogleConfigured()) {
    return res.status(503).json({ error: 'Google API not configured', setup: true });
  }

  const { title, description, batchId, dueDate } = req.body;
  if (!title || !description || !batchId) {
    return res.status(400).json({ error: 'Title, description, and batchId are required' });
  }

  const authClient = getAuthClientForUser(user.id);
  if (!authClient) {
    return res.status(401).json({ error: 'Teacher not connected to Google Account. Please connect first.' });
  }

  try {
    const classroom = google.classroom({ version: 'v1', auth: authClient });
    
    // 1. Get or create the Course for this batch
    let courseId = db.classroomCourses[batchId]?.courseId;
    
    if (!courseId) {
      // Create new course
      const courseNames = {
        B1: 'Batch 1: Web Security',
        B2: 'Batch 2: API Security',
        B3: 'Batch 3: SOC',
        B4: 'Batch 4: Cloud Security'
      };
      
      const newCourse = await classroom.courses.create({
        requestBody: {
          name: courseNames[batchId] || `Arena Batch ${batchId}`,
          section: 'Cybersecurity',
          ownerId: 'me',
          courseState: 'ACTIVE'
        }
      });
      
      courseId = newCourse.data.id;
      db.classroomCourses[batchId] = {
        courseId,
        courseLink: newCourse.data.alternateLink
      };
    }

    // 2. Create the CourseWork (Assignment)
    const newHomework = {
      id: `HW-${Date.now()}`,
      batchId,
      title,
      description,
      dueDate: dueDate || 'TBD',
      maxScore: 100,
      attachment: 'No attachment'
    };
    
    const courseWork = await classroom.courses.courseWork.create({
      courseId,
      requestBody: {
        title,
        description,
        workType: 'ASSIGNMENT',
        state: 'PUBLISHED',
        maxPoints: 100
      }
    });
    
    // Save mapping between Arena HW ID and Google CourseWork ID
    db.classroomCourseWork[newHomework.id] = {
      courseWorkId: courseWork.data.id,
      courseId
    };

    // Save to local DB for fast rendering in Arena UI
    db.homeworks.push(newHomework);

    res.json({ success: true, homework: newHomework });

  } catch (err) {
    console.error('Error creating Google Classroom assignment:', err);
    res.status(500).json({ error: 'Failed to create assignment in Google Classroom', details: err.message });
  }
};

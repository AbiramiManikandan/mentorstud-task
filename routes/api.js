const express = require('express');
const Mentor = require('../models/mentor');
const Student = require('../models/student');
const router = express.Router();

// Create Mentor
router.post('/mentors', async (req, res) => {
  try {
    const mentor = new Mentor(req.body);
    await mentor.save();
    res.status(201).json(mentor);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Create Student
router.post('/students', async (req, res) => {
  try {
    const student = new Student(req.body);
    await student.save();
    res.status(201).json(student);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Assign a Student to a Mentor
router.put('/assign-student/:mentorId', async (req, res) => {
  try {
    const { mentorId } = req.params;
    const { studentIds } = req.body;

    const mentor = await Mentor.findById(mentorId);
    if (!mentor) return res.status(404).json({ error: 'Mentor not found' });

    for (const studentId of studentIds) {
      const student = await Student.findById(studentId);
      if (student && !student.mentor) {
        student.mentor = mentorId;
        student.previousMentors.push(mentorId);
        await student.save();
        mentor.students.push(studentId);
      }
    }

    await mentor.save();
    res.status(200).json(mentor);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Change Mentor for a Student
router.put('/change-mentor/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { newMentorId } = req.body;

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const newMentor = await Mentor.findById(newMentorId);
    if (!newMentor) return res.status(404).json({ error: 'Mentor not found' });

    if (student.mentor) {
      student.previousMentors.push(student.mentor);
    }
    student.mentor = newMentorId;
    await student.save();

    newMentor.students.push(studentId);
    await newMentor.save();

    res.status(200).json(student);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get All Students for a Mentor
router.get('/mentors/:mentorId/students', async (req, res) => {
  try {
    const { mentorId } = req.params;
    const mentor = await Mentor.findById(mentorId).populate('students');
    if (!mentor) return res.status(404).json({ error: 'Mentor not found' });

    res.status(200).json(mentor.students);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get Previous Mentors for a Student
router.get('/students/:studentId/previous-mentors', async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findById(studentId).populate('previousMentors');
    if (!student) return res.status(404).json({ error: 'Student not found' });

    res.status(200).json(student.previousMentors);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;

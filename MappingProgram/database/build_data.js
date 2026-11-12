const fs = require('fs');
const path = require('path');

const rooms = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/rooms.json'), 'utf8'));

const sections = [
  // Year 1 (Core IT)
  { id: 'bsit-1a', code: 'BSIT 1-A', name: 'BSIT 1-A (Year 1 - Block A)', year: 1, track: 'Core' },
  { id: 'bsit-1b', code: 'BSIT 1-B', name: 'BSIT 1-B (Year 1 - Block B)', year: 1, track: 'Core' },
  { id: 'bsit-1c', code: 'BSIT 1-C', name: 'BSIT 1-C (Year 1 - Block C)', year: 1, track: 'Core' },

  // Year 2 (Core IT)
  { id: 'bsit-2a', code: 'BSIT 2-A', name: 'BSIT 2-A (Year 2 - Block A)', year: 2, track: 'Core' },
  { id: 'bsit-2b', code: 'BSIT 2-B', name: 'BSIT 2-B (Year 2 - Block B)', year: 2, track: 'Core' },
  { id: 'bsit-2c', code: 'BSIT 2-C', name: 'BSIT 2-C (Year 2 - Block C)', year: 2, track: 'Core' },

  // Year 3 (WMAD: Web & Mobile Application Development)
  { id: 'bsit-3-wmad-1', code: 'BSIT 3 WMAD-1', name: 'BSIT 3 WMAD 1 (Year 3 - Web & Mobile 1)', year: 3, track: 'WMAD' },
  { id: 'bsit-3-wmad-2', code: 'BSIT 3 WMAD-2', name: 'BSIT 3 WMAD 2 (Year 3 - Web & Mobile 2)', year: 3, track: 'WMAD' },
  { id: 'bsit-3-wmad-3', code: 'BSIT 3 WMAD-3', name: 'BSIT 3 WMAD 3 (Year 3 - Web & Mobile 3)', year: 3, track: 'WMAD' },

  // Year 3 (SMP: Service Management Program)
  { id: 'bsit-3-smp-1', code: 'BSIT 3 SMP-1', name: 'BSIT 3 SMP 1 (Year 3 - Service Management 1)', year: 3, track: 'SMP' },
  { id: 'bsit-3-smp-2', code: 'BSIT 3 SMP-2', name: 'BSIT 3 SMP 2 (Year 3 - Service Management 2)', year: 3, track: 'SMP' },

  // Year 4 (WMAD)
  { id: 'bsit-4-wmad-1', code: 'BSIT 4 WMAD-1', name: 'BSIT 4 WMAD 1 (Year 4 - Web & Mobile 1)', year: 4, track: 'WMAD' },
  { id: 'bsit-4-wmad-2', code: 'BSIT 4 WMAD-2', name: 'BSIT 4 WMAD 2 (Year 4 - Web & Mobile 2)', year: 4, track: 'WMAD' },
  { id: 'bsit-4-wmad-3', code: 'BSIT 4 WMAD-3', name: 'BSIT 4 WMAD 3 (Year 4 - Web & Mobile 3)', year: 4, track: 'WMAD' },

  // Year 4 (SMP)
  { id: 'bsit-4-smp-1', code: 'BSIT 4 SMP-1', name: 'BSIT 4 SMP 1 (Year 4 - Service Management 1)', year: 4, track: 'SMP' },
  { id: 'bsit-4-smp-2', code: 'BSIT 4 SMP-2', name: 'BSIT 4 SMP 2 (Year 4 - Service Management 2)', year: 4, track: 'SMP' }
];

// Curriculum subject templates per year & track
const subjectsByYear = {
  1: [
    { code: 'IT 101', name: 'Introduction to Computing', type: 'Lecture', hours: 3 },
    { code: 'IT 102', name: 'Computer Programming 1 (Python)', type: 'Lecture', hours: 3 },
    { code: 'MATH 101', name: 'Discrete Mathematics for IT', type: 'Lecture', hours: 3 },
    { code: 'GE 104', name: 'Purposive Communication', type: 'Lecture', hours: 3 },
    { code: 'GE 101', name: 'Understanding the Self', type: 'Lecture', hours: 3 },
    { code: 'IT 103', name: 'Living in the IT Era', type: 'Lecture', hours: 3 },
    { code: 'PE 101', name: 'Physical Fitness & Health', type: 'Activity', hours: 2 }
  ],
  2: [
    { code: 'IT 201', name: 'Data Structures and Algorithms', type: 'Lecture', hours: 3 },
    { code: 'IT 202', name: 'Object-Oriented Programming (Java)', type: 'Lecture', hours: 3 },
    { code: 'IT 203', name: 'Platform Technologies & OS', type: 'Lecture', hours: 3 },
    { code: 'IT 204', name: 'Database Management Systems 1 (SQL)', type: 'Lecture', hours: 3 },
    { code: 'IT 205', name: 'Quantitative Methods & Statistics', type: 'Lecture', hours: 3 },
    { code: 'GE 107', name: 'Science, Technology, and Society', type: 'Lecture', hours: 3 },
    { code: 'PE 103', name: 'Individual and Dual Sports', type: 'Activity', hours: 2 }
  ],
  '3-WMAD': [
    { code: 'WMAD 301', name: 'Mobile Application Development 1 (Android/Kotlin)', type: 'Lecture', hours: 3 },
    { code: 'WMAD 302', name: 'Web Systems and Technologies (React & Node.js)', type: 'Lecture', hours: 3 },
    { code: 'IT 301', name: 'Cloud Computing Architecture (AWS/GCP)', type: 'Lecture', hours: 3 },
    { code: 'IT 302', name: 'Information Assurance and Cybersecurity', type: 'Lecture', hours: 3 },
    { code: 'IT 303', name: 'Integrative Programming & API Technologies', type: 'Lecture', hours: 3 },
    { code: 'WMAD 303', name: 'UI/UX Design for Web and Mobile Interfaces', type: 'Lecture', hours: 3 },
    { code: 'CONSULT', name: 'Specialization Advising & Lab Mentorship', type: 'Consultation', hours: 2 }
  ],
  '3-SMP': [
    { code: 'SMP 301', name: 'Business Process Management & Reengineering', type: 'Lecture', hours: 3 },
    { code: 'SMP 302', name: 'IT Service Management (ITSM & Service Desks)', type: 'Lecture', hours: 3 },
    { code: 'IT 304', name: 'Systems Analysis and Enterprise Design', type: 'Lecture', hours: 3 },
    { code: 'IT 305', name: 'Enterprise Architecture & Governance', type: 'Lecture', hours: 3 },
    { code: 'IT 306', name: 'Advanced Database Administration & Tuning', type: 'Lecture', hours: 3 },
    { code: 'SMP 303', name: 'Customer Relationship Management Systems', type: 'Lecture', hours: 3 },
    { code: 'CONSULT', name: 'Faculty Consultation & Career Mentorship', type: 'Consultation', hours: 2 }
  ],
  '4-WMAD': [
    { code: 'WMAD 401', name: 'Advanced Cross-Platform Mobile Dev (Flutter)', type: 'Lecture', hours: 3 },
    { code: 'IT 401', name: 'Capstone Project 1 (Concept & Implementation)', type: 'Lecture', hours: 3 },
    { code: 'WMAD 402', name: 'Full-Stack Modern Frameworks & Microservices', type: 'Lecture', hours: 3 },
    { code: 'WMAD 403', name: 'DevOps, CI/CD, and Containerization (Docker)', type: 'Lecture', hours: 3 },
    { code: 'IT 402', name: 'Systems Integration and Architecture', type: 'Lecture', hours: 3 },
    { code: 'SEMINAR', name: 'Industry Tech Colloquium & Job Readiness', type: 'Consultation', hours: 2 }
  ],
  '4-SMP': [
    { code: 'SMP 401', name: 'IT Quality Assurance & Auditing (CISA/ISO)', type: 'Lecture', hours: 3 },
    { code: 'IT 401', name: 'Capstone Project 1 (Service Architecture)', type: 'Lecture', hours: 3 },
    { code: 'SMP 402', name: 'Strategic IT Leadership & Change Management', type: 'Lecture', hours: 3 },
    { code: 'SMP 403', name: 'IT Infrastructure Library (ITIL 4 Masterclass)', type: 'Lecture', hours: 3 },
    { code: 'IT 403', name: 'Professional Ethics, Cyber Laws, and IP', type: 'Lecture', hours: 3 },
    { code: 'SEMINAR', name: 'Enterprise Service Management Symposium', type: 'Consultation', hours: 2 }
  ]
};

const lectureRooms = rooms.filter(r => r.category === 'lecture');
const officeRooms = rooms.filter(r => (r.category === 'office' || r.category === 'faculty') && r.id !== 'octa-office');

const facultyNames = [
  'Engr. Mark Anthony Reyes',
  'Dr. Sarah Jenkins',
  'Prof. Daniel Cruz',
  'Prof. Elena Rostova',
  'Prof. Leo Navarro',
  'Engr. Carlos Mendoza',
  'Dr. Ramon Bautista',
  'Prof. Alicia Chen',
  'Engr. Patricia Gomez',
  'Dr. Michael Santos',
  'Prof. Maria Angelica Flores',
  'Engr. Victoriano Tan'
];

const timeSlots = [
  { start: '07:30', end: '09:00', display: '07:30 AM - 09:00 AM' },
  { start: '09:15', end: '10:45', display: '09:15 AM - 10:45 AM' },
  { start: '11:00', end: '12:30', display: '11:00 AM - 12:30 PM' },
  { start: '13:00', end: '14:30', display: '01:00 PM - 02:30 PM' },
  { start: '14:45', end: '16:15', display: '02:45 PM - 04:15 PM' },
  { start: '16:30', end: '18:00', display: '04:30 PM - 06:00 PM' }
];

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

// Deterministic seed helper
function pseudoHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

const fullSchedulesJson = sections.map(sec => ({
  programId: sec.id,
  programCode: sec.code,
  programName: sec.name,
  yearLevel: sec.year,
  track: sec.track,
  semester: '1st Semester, A.Y. 2026-2027',
  days: {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: []
  }
}));

const sqlInserts = [];

daysOfWeek.forEach((day, dIdx) => {
  timeSlots.forEach((slot, slotIdx) => {
    const usedRoomIds = new Set();

    sections.forEach((sec, sIdx) => {
      const k = 3 + ((sIdx + dIdx) % 2); // 3 or 4 classes per day
      if (((slotIdx + sIdx + dIdx) % 6) < k) {
        const yearKey = (sec.year >= 3) ? `${sec.year}-${sec.track}` : sec.year;
        const subjPool = subjectsByYear[yearKey] || subjectsByYear[1];
        const subjIdx = (sIdx * 3 + dIdx * 2 + slotIdx) % subjPool.length;
        const subj = subjPool[subjIdx];

        // Pick unassigned room
        const availLectures = lectureRooms.filter(r => !usedRoomIds.has(r.id));
        const availOffices = officeRooms.filter(r => !usedRoomIds.has(r.id));
        let assignedRoom;

        if (subj.code === 'CONSULT' || subj.code === 'SEMINAR') {
          assignedRoom = availOffices.length > 0 ? availOffices[(sIdx + dIdx) % availOffices.length] : availLectures[0];
        } else {
          assignedRoom = availLectures.length > 0 ? availLectures[(sIdx + dIdx) % availLectures.length] : availOffices[0];
        }

        if (!assignedRoom) {
          assignedRoom = allSchedRooms[(sIdx + slotIdx) % allSchedRooms.length];
        }
        usedRoomIds.add(assignedRoom.id);

        const prof = facultyNames[(sIdx + dIdx + slotIdx) % facultyNames.length];

        const classItem = {
          sectionId: sec.id,
          sectionCode: sec.code,
          sectionName: sec.name,
          subjectCode: subj.code,
          subjectName: subj.name,
          timeStart: slot.start,
          timeEnd: slot.end,
          displayTime: slot.display,
          roomId: assignedRoom.id,
          roomName: assignedRoom.name,
          roomCode: assignedRoom.code,
          floor: assignedRoom.floor,
          instructor: prof,
          type: subj.type
        };

        const secObj = fullSchedulesJson.find(s => s.programId === sec.id);
        if (secObj) {
          secObj.days[day].push(classItem);
        }

        // SQL entry
        sqlInserts.push(`INSERT INTO schedules (section_id, day_of_week, subject_code, subject_name, time_start, time_end, display_time, room_id, instructor, type) VALUES ('${sec.id}', '${day}', '${subj.code}', '${subj.name.replace(/'/g, "''")}', '${slot.start}', '${slot.end}', '${slot.display}', '${assignedRoom.id}', '${prof.replace(/'/g, "''")}', '${subj.type}');`);
      }
    });
  });
});

// Sort each section's day classes by timeStart
fullSchedulesJson.forEach(sec => {
  daysOfWeek.forEach(day => {
    sec.days[day].sort((a, b) => a.timeStart.localeCompare(b.timeStart));
  });
});

// Write to data/schedules.json
fs.writeFileSync(path.join(__dirname, '../data/schedules.json'), JSON.stringify(fullSchedulesJson, null, 2), 'utf8');
console.log(`Generated schedules.json with ${fullSchedulesJson.length} sections.`);

// Generate schema.sql
const schemaSql = `-- ========================================================
-- Campus Interactive Map & Navigation System
-- Database Schema & Schedule Seed Data
-- ========================================================

CREATE DATABASE IF NOT EXISTS campus_map CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE campus_map;

-- 1. SECTIONS TABLE
DROP TABLE IF EXISTS schedules;
DROP TABLE IF EXISTS sections;
DROP TABLE IF EXISTS rooms;

CREATE TABLE sections (
  id VARCHAR(50) PRIMARY KEY,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(150) NOT NULL,
  year_level INT NOT NULL,
  track VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. ROOMS TABLE
CREATE TABLE rooms (
  id VARCHAR(50) PRIMARY KEY,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(150) NOT NULL,
  category VARCHAR(50) NOT NULL,
  floor INT NOT NULL,
  head VARCHAR(100),
  hours VARCHAR(100),
  access VARCHAR(100),
  coord_x FLOAT,
  coord_y FLOAT,
  coord_z FLOAT,
  color VARCHAR(20)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. SCHEDULES TABLE
CREATE TABLE schedules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  section_id VARCHAR(50) NOT NULL,
  day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
  subject_code VARCHAR(50) NOT NULL,
  subject_name VARCHAR(150) NOT NULL,
  time_start VARCHAR(10) NOT NULL,
  time_end VARCHAR(10) NOT NULL,
  display_time VARCHAR(50) NOT NULL,
  room_id VARCHAR(50) NOT NULL,
  instructor VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'Lecture',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. INSERT SECTIONS
${sections.map(s => `INSERT INTO sections (id, code, name, year_level, track) VALUES ('${s.id}', '${s.code}', '${s.name.replace(/'/g, "''")}', ${s.year}, '${s.track}');`).join('\n')}

-- 5. INSERT ROOMS
${rooms.map(r => `INSERT INTO rooms (id, code, name, category, floor, head, hours, access, coord_x, coord_y, coord_z, color) VALUES ('${r.id}', '${(r.code || '').replace(/'/g, "''")}', '${(r.name || '').replace(/'/g, "''")}', '${r.category}', ${r.floor}, '${(r.head || '').replace(/'/g, "''")}', '${(r.hours || '7:00 AM - 7:00 PM').replace(/'/g, "''")}', '${(r.access || '').replace(/'/g, "''")}', ${r.coordinates ? r.coordinates.x : 0}, ${r.coordinates ? r.coordinates.y : 0}, ${r.coordinates ? r.coordinates.z : 0}, '${r.color || '#0284c7'}');`).join('\n')}

-- 6. INSERT SCHEDULES (${sqlInserts.length} class sessions)
${sqlInserts.join('\n')}
`;

fs.writeFileSync(path.join(__dirname, 'schema.sql'), schemaSql, 'utf8');
console.log(`Generated database/schema.sql with ${sections.length} sections and ${sqlInserts.length} schedules.`);

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

export interface StudentProfile {
  id: string;
  name: string;
  rollNumber: string;
  email: string;
  phone: string;
  department: string;
  degree: string;
  semester: number;
  cgpa: number;
  creditsCompleted: number;
  totalCredits: number;
  avatar: string;
  bio: string;
  address: string;
  enrolledYear: number;
  advisorName: string;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  instructor: string;
  instructorEmail: string;
  credits: number;
  progress: number;
  grade: string;
  schedule: string;
  room: string;
  color: string;
  totalLectures: number;
  attendedLectures: number;
  category: string;
  description: string;
  nextLecture?: string;
}

export interface Assignment {
  id: string;
  courseCode: string;
  courseTitle: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded' | 'late';
  points: number;
  score?: number;
  submissionDate?: string;
  feedback?: string;
  submissionFile?: string;
}

export interface AttendanceHistoryItem {
  id: string;
  date: string;
  status: 'present' | 'absent' | 'leave' | 'holiday';
  topic: string;
  duration: string;
}

export interface AttendanceRecord {
  id: string;
  courseCode: string;
  courseTitle: string;
  instructor: string;
  totalClasses: number;
  attendedClasses: number;
  percentage: number;
  status: 'Good' | 'Warning' | 'Critical';
  history: AttendanceHistoryItem[];
}

export interface SemesterResult {
  semesterName: string;
  semesterNumber: number;
  gpa: number;
  credits: number;
  status: 'Completed' | 'Current';
  courses: {
    code: string;
    title: string;
    credits: number;
    grade: string;
    marks: number;
    maxMarks: number;
    gradePoint: number;
  }[];
}

export interface TimetableSlot {
  id: string;
  day: DayOfWeek;
  startTime: string;
  endTime: string;
  courseCode: string;
  courseTitle: string;
  room: string;
  instructor: string;
  type: 'Lecture' | 'Lab' | 'Tutorial';
  color: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'assignment' | 'grade' | 'announcement' | 'system' | 'reminder';
  read: boolean;
  actionUrl?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestions?: string[];
  codeSnippet?: string;
}

export interface UserSettings {
  theme: 'dark' | 'light';
  emailNotifications: boolean;
  assignmentAlerts: boolean;
  soundEffects: boolean;
  compactMode: boolean;
  autoStudyTimer: boolean;
  privacyShowGPA: boolean;
}

export const mockDashboardStats = [
  { label: 'Active Courses', value: '4', icon: 'BookOpen', color: 'bg-teal-500/20' },
  { label: 'Assignments', value: '7', icon: 'FileCheck2', color: 'bg-blue-500/20' },
  { label: 'Overall Score', value: '85%', icon: 'TrendingUp', color: 'bg-green-500/20' },
  { label: 'Attendance', value: '92%', icon: 'CheckCircle2', color: 'bg-purple-500/20' },
];

export const mockCourses = [
  {
    id: '1',
    name: 'Mathematics 101',
    subject: 'Mathematics',
    progress: 65,
    students: 28,
    instructor: 'Dr. Ahmed Khan',
    color: 'bg-teal-500/20',
  },
  {
    id: '2',
    name: 'English Literature',
    subject: 'English',
    progress: 48,
    students: 25,
    instructor: 'Ms. Fatima Ali',
    color: 'bg-blue-500/20',
  },
  {
    id: '3',
    name: 'Physics Fundamentals',
    subject: 'Physics',
    progress: 72,
    students: 30,
    instructor: 'Prof. Hassan Sheikh',
    color: 'bg-green-500/20',
  },
  {
    id: '4',
    name: 'History & Culture',
    subject: 'History',
    progress: 55,
    students: 22,
    instructor: 'Dr. Zainab Ahmed',
    color: 'bg-purple-500/20',
  },
];

export const mockAssignments = [
  {
    id: '1',
    title: 'Algebra Problem Set 5',
    course: 'Mathematics 101',
    dueDate: '2024-01-25',
    status: 'pending',
    submittedDate: null,
    score: null,
  },
  {
    id: '2',
    title: 'Essay: Shakespeare Analysis',
    course: 'English Literature',
    dueDate: '2024-01-22',
    status: 'submitted',
    submittedDate: '2024-01-21',
    score: null,
  },
  {
    id: '3',
    title: 'Lab Report: Mechanics',
    course: 'Physics Fundamentals',
    dueDate: '2024-01-20',
    status: 'graded',
    submittedDate: '2024-01-19',
    score: 92,
  },
  {
    id: '4',
    title: 'Timeline Project',
    course: 'History & Culture',
    dueDate: '2024-01-28',
    status: 'pending',
    submittedDate: null,
    score: null,
  },
];

export const mockTimetable = [
  {
    id: '1',
    time: '09:00 - 10:00',
    course: 'Mathematics 101',
    instructor: 'Dr. Ahmed Khan',
    room: 'A-201',
    status: 'ongoing',
  },
  {
    id: '2',
    time: '10:15 - 11:15',
    course: 'English Literature',
    instructor: 'Ms. Fatima Ali',
    room: 'B-305',
    status: 'upcoming',
  },
  {
    id: '3',
    time: '11:30 - 12:30',
    course: 'Physics Fundamentals',
    instructor: 'Prof. Hassan Sheikh',
    room: 'Lab-02',
    status: 'upcoming',
  },
  {
    id: '4',
    time: '13:30 - 14:30',
    course: 'History & Culture',
    instructor: 'Dr. Zainab Ahmed',
    room: 'C-105',
    status: 'upcoming',
  },
];

export const mockNotifications = [
  {
    id: '1',
    type: 'assignment',
    title: 'New Assignment Posted',
    message: 'Dr. Ahmed Khan posted a new assignment in Mathematics 101',
    timestamp: '2 hours ago',
    read: false,
  },
  {
    id: '2',
    type: 'grade',
    title: 'Assignment Graded',
    message: 'Your lab report has been graded: 92/100',
    timestamp: '5 hours ago',
    read: true,
  },
  {
    id: '3',
    type: 'announcement',
    title: 'Class Announcement',
    message: 'Physics class is moved to Lab-03 tomorrow',
    timestamp: '1 day ago',
    read: true,
  },
];

export const mockResults = [
  {
    course: 'Mathematics 101',
    exam: 'Mid Term',
    score: 88,
    total: 100,
    grade: 'A-',
  },
  {
    course: 'English Literature',
    exam: 'Quiz 2',
    score: 76,
    total: 100,
    grade: 'B+',
  },
  {
    course: 'Physics Fundamentals',
    exam: 'Quiz 1',
    score: 92,
    total: 100,
    grade: 'A',
  },
  {
    course: 'History & Culture',
    exam: 'Mid Term',
    score: 82,
    total: 100,
    grade: 'A-',
  },
];

export const mockAttendance = [
  {
    course: 'Mathematics 101',
    present: 18,
    absent: 2,
    percentage: 90,
  },
  {
    course: 'English Literature',
    present: 20,
    absent: 1,
    percentage: 95,
  },
  {
    course: 'Physics Fundamentals',
    present: 19,
    absent: 1,
    percentage: 95,
  },
  {
    course: 'History & Culture',
    present: 17,
    absent: 3,
    percentage: 85,
  },
];

export const mockProfile = {
  id: 'student-001',
  firstName: 'Ahmed',
  lastName: 'Hassan',
  email: 'ahmed.hassan@school.edu',
  rollNumber: 'SH-2024-001',
  class: '12-A',
  section: 'Science',
  batch: '2024',
  joinDate: '2023-08-15',
  phone: '+92-300-1234567',
  address: 'Karachi, Pakistan',
  motherName: 'Ayesha Hassan',
  fatherName: 'Hassan Ahmed',
  bloodGroup: 'O+',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed',
};

export const mockStudentProfile = mockProfile;

export const mockUserSettings = {
  theme: 'dark',
  language: 'en',
  notifications: {
    email: true,
    push: true,
    sms: false,
  },
  privacy: {
    profilePublic: false,
    showActivity: true,
  },
};

export const mockInitialChatMessages = [
  {
    id: '1',
    role: 'assistant',
    content: 'Hello! How can I help you today?',
    timestamp: '2024-01-20T10:00:00Z',
  },
];

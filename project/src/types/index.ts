export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'faculty' | 'admin';
  roll_number?: string;
}

export interface AuthResponse {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'faculty' | 'admin';
  roll_number?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, role: string) => Promise<AuthResponse>;
  register: (name: string, email: string, password: string, role: string) => Promise<AuthResponse>;
  logout: () => void;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  description: string;
  credits: number;
  instructor: string;
  department: string;
}

export interface Complaint {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: 'IT' | 'Service' | 'Other';
  status: 'Pending' | 'In Progress' | 'Resolved';
  createdAt: string;
  resolvedAt?: string;
  response?: string;
}

export interface IdCardRequest {
  id: string;
  userId: string;
  studentName: string;
  cardType: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
  updatedAt: string;
}

export interface LeaveRequest {
  id: string;
  userId: string;
  facultyName: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  roll_number?: string;
  enrollmentNumber?: string;
  department?: string;
  semester?: number;
  enrollment_date?: string;
}

export interface Attendance {
  id: string;
  studentId: string;
  courseId: string;
  date: string;
  status: 'Present' | 'Absent' | 'Late';
}
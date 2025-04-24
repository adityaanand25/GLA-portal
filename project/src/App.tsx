import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LoadingSpinner from './components/ui/LoadingSpinner';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const LandingPage = lazy(() => import('./pages/LandingPage'));

// Student Pages
const StudentDashboard = lazy(() => import('./pages/student/Dashboard'));
const CourseEnrollment = lazy(() => import('./pages/student/CourseEnrollment'));
const ComplaintSubmission = lazy(() => import('./pages/student/ComplaintSubmission'));
const IdCardRequest = lazy(() => import('./pages/student/IdCardRequest'));
const RequestStatus = lazy(() => import('./pages/student/RequestStatus'));

// Faculty Pages
const FacultyDashboard = lazy(() => import('./pages/faculty/Dashboard'));
const EnrolledStudents = lazy(() => import('./pages/faculty/EnrolledStudents'));
const LeaveRequest = lazy(() => import('./pages/faculty/LeaveRequest'));
const AttendanceReport = lazy(() => import('./pages/faculty/AttendanceReport'));

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const IdCardApproval = lazy(() => import('./pages/admin/IdCardApproval'));
const FacultyAssignment = lazy(() => import('./pages/admin/FacultyAssignment'));
const ComplaintResolution = lazy(() => import('./pages/admin/ComplaintResolution'));

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Protected Student Routes */}
        <Route 
          path="/student/*" 
          element={user && user.role === 'student' ? <DashboardLayout /> : <Navigate to="/login" />}
        >
          <Route index element={<StudentDashboard />} />
          <Route path="courses" element={<CourseEnrollment />} />
          <Route path="complaints" element={<ComplaintSubmission />} />
          <Route path="id-card" element={<IdCardRequest />} />
          <Route path="status" element={<RequestStatus />} />
        </Route>

        {/* Protected Faculty Routes */}
        <Route 
          path="/faculty/*" 
          element={user && user.role === 'faculty' ? <DashboardLayout /> : <Navigate to="/login" />}
        >
          <Route index element={<FacultyDashboard />} />
          <Route path="students" element={<EnrolledStudents />} />
          <Route path="leave" element={<LeaveRequest />} />
          <Route path="attendance" element={<AttendanceReport />} />
        </Route>

        {/* Protected Admin Routes */}
        <Route 
          path="/admin/*" 
          element={user && user.role === 'admin' ? <DashboardLayout /> : <Navigate to="/login" />}
        >
          <Route index element={<AdminDashboard />} />
          <Route path="id-cards" element={<IdCardApproval />} />
          <Route path="faculty-assignment" element={<FacultyAssignment />} />
          <Route path="complaints" element={<ComplaintResolution />} />
        </Route>

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LoadingSpinner from './components/ui/LoadingSpinner';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const LandingPage = lazy(() => import('./pages/LandingPage'));

// Student pages
const StudentDashboard = lazy(() => import('./pages/student/Dashboard'));
const IdCardRequest = lazy(() => import('./pages/student/IdCardRequest'));
const RequestStatus = lazy(() => import('./pages/student/RequestStatus'));
const ComplaintSubmission = lazy(() => import('./pages/student/ComplaintSubmission'));
const CourseEnrollment = lazy(() => import('./pages/student/CourseEnrollment'));

// Faculty pages
const FacultyDashboard = lazy(() => import('./pages/faculty/Dashboard'));
const LeaveRequest = lazy(() => import('./pages/faculty/LeaveRequest'));
const AttendanceReport = lazy(() => import('./pages/faculty/AttendanceReport'));
const EnrolledStudents = lazy(() => import('./pages/faculty/EnrolledStudents'));

// Admin pages
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const IdCardApproval = lazy(() => import('./pages/admin/IdCardApproval'));
const ComplaintResolution = lazy(() => import('./pages/admin/ComplaintResolution'));
const FacultyAssignment = lazy(() => import('./pages/admin/FacultyAssignment'));

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Protected Routes */}
        {user && (
          <Route element={<DashboardLayout />}>
            {user.role === 'student' && (
              <>
                <Route path="/student" element={<StudentDashboard />} />
                <Route path="/student/id-card" element={<IdCardRequest />} />
                <Route path="/student/request-status" element={<RequestStatus />} />
                <Route path="/student/complaints" element={<ComplaintSubmission />} />
                <Route path="/student/courses" element={<CourseEnrollment />} />
              </>
            )}

            {user.role === 'faculty' && (
              <>
                <Route path="/faculty" element={<FacultyDashboard />} />
                <Route path="/faculty/leave" element={<LeaveRequest />} />
                <Route path="/faculty/attendance" element={<AttendanceReport />} />
                <Route path="/faculty/students" element={<EnrolledStudents />} />
              </>
            )}

            {user.role === 'admin' && (
              <>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/id-cards" element={<IdCardApproval />} />
                <Route path="/admin/complaints" element={<ComplaintResolution />} />
                <Route path="/admin/faculty" element={<FacultyAssignment />} />
              </>
            )}
          </Route>
        )}

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
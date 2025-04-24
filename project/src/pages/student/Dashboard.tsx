import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, BookOpen, FileText, CreditCard, ClipboardList, ExternalLink } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    pendingComplaints: 0,
    idCardRequests: 0,
  });

  useEffect(() => {
    // In a real app, fetch this data from API
    // Simulating API call
    setTimeout(() => {
      setStats({
        enrolledCourses: 5,
        pendingComplaints: 1,
        idCardRequests: 0,
      });
    }, 500);
  }, []);

  const recentActivity = [
    { 
      id: 1, 
      action: 'Enrolled in Web Development', 
      date: '2025-04-15', 
      status: 'Completed' 
    },
    { 
      id: 2, 
      action: 'Submitted IT complaint #1234', 
      date: '2025-04-14', 
      status: 'Pending' 
    },
    { 
      id: 3, 
      action: 'Enrolled in Database Design', 
      date: '2025-04-10', 
      status: 'Completed' 
    },
  ];

  const upcomingDeadlines = [
    { 
      id: 1, 
      title: 'Assignment Submission', 
      course: 'Web Development', 
      dueDate: '2025-04-20' 
    },
    { 
      id: 2, 
      title: 'Midterm Exam', 
      course: 'Database Design', 
      dueDate: '2025-04-25' 
    },
    { 
      id: 3, 
      title: 'Group Project', 
      course: 'Software Engineering', 
      dueDate: '2025-05-05' 
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
        <p className="text-sm text-gray-500">Welcome back, {user?.name}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-blue-50 border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Enrolled Courses</p>
              <p className="text-3xl font-bold text-blue-800">{stats.enrolledCourses}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <Button 
              size="sm" 
              variant="outline" 
              className="text-blue-600 border-blue-300 hover:bg-blue-50"
              onClick={() => navigate('/student/courses')}
            >
              View Courses
            </Button>
          </div>
        </Card>

        <Card className="bg-amber-50 border-amber-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-600">Pending Complaints</p>
              <p className="text-3xl font-bold text-amber-800">{stats.pendingComplaints}</p>
            </div>
            <div className="p-3 bg-amber-100 rounded-full">
              <FileText className="h-6 w-6 text-amber-600" />
            </div>
          </div>
          <div className="mt-4">
            <Button 
              size="sm" 
              variant="outline" 
              className="text-amber-600 border-amber-300 hover:bg-amber-50"
              onClick={() => navigate('/student/complaints')}
            >
              Submit Complaint
            </Button>
          </div>
        </Card>

        <Card className="bg-teal-50 border-teal-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-teal-600">ID Card Requests</p>
              <p className="text-3xl font-bold text-teal-800">{stats.idCardRequests}</p>
            </div>
            <div className="p-3 bg-teal-100 rounded-full">
              <CreditCard className="h-6 w-6 text-teal-600" />
            </div>
          </div>
          <div className="mt-4">
            <Button 
              size="sm" 
              variant="outline" 
              className="text-teal-600 border-teal-300 hover:bg-teal-50"
              onClick={() => navigate('/student/id-card')}
            >
              Request ID Card
            </Button>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card title="Recent Activity">
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.date}</p>
                </div>
                <div>
                  <span 
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${activity.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
                  >
                    {activity.status}
                  </span>
                </div>
              </div>
            ))}
            {recentActivity.length === 0 && (
              <p className="text-gray-500 text-center py-4">No recent activity</p>
            )}
          </div>
          <div className="mt-4 text-right">
            <Button size="sm" variant="outline" onClick={() => navigate('/student/status')}>
              View All Activity
            </Button>
          </div>
        </Card>

        {/* Upcoming Deadlines */}
        <Card title="Upcoming Deadlines">
          <div className="space-y-4">
            {upcomingDeadlines.map((deadline) => (
              <div key={deadline.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{deadline.title}</p>
                  <p className="text-xs text-gray-500">{deadline.course}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{deadline.dueDate}</p>
                  <a href="#" className="text-xs text-blue-600 flex items-center">
                    Details <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </div>
              </div>
            ))}
            {upcomingDeadlines.length === 0 && (
              <p className="text-gray-500 text-center py-4">No upcoming deadlines</p>
            )}
          </div>
        </Card>
      </div>

      {/* Performance Overview */}
      <Card title="Performance Overview">
        <div className="h-64 flex items-center justify-center border border-gray-200 rounded-md bg-gray-50">
          <div className="text-center">
            <BarChart3 className="h-10 w-10 text-gray-400 mx-auto" />
            <p className="mt-2 text-sm text-gray-600">Performance metrics will be visible here after midterm examinations</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default StudentDashboard;
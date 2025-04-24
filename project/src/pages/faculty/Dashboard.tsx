import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, ClipboardList, BarChart3, ExternalLink } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';

const FacultyDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    enrolledStudents: 0,
    pendingLeaveRequests: 0,
    coursesTeaching: 0,
  });

  useEffect(() => {
    // In a real app, fetch this data from API
    // Simulating API call
    setTimeout(() => {
      setStats({
        enrolledStudents: 78,
        pendingLeaveRequests: 1,
        coursesTeaching: 3,
      });
    }, 500);
  }, []);

  const recentActivity = [
    { 
      id: 1, 
      action: 'Attendance marked for CS101', 
      date: '2025-04-15', 
      students: 25 
    },
    { 
      id: 2, 
      action: 'Leave request submitted', 
      date: '2025-04-14', 
      status: 'Pending' 
    },
    { 
      id: 3, 
      action: 'New student enrolled in CS201', 
      date: '2025-04-10', 
      student: 'Alex Johnson' 
    },
  ];

  const upcomingClasses = [
    { 
      id: 1, 
      course: 'CS101: Introduction to Computer Science', 
      time: '09:00 AM - 10:30 AM', 
      day: 'Monday',
      room: 'Building A, Room 205',
      students: 30,
    },
    { 
      id: 2, 
      course: 'CS201: Data Structures and Algorithms', 
      time: '01:00 PM - 02:30 PM', 
      day: 'Tuesday',
      room: 'Building B, Room 112',
      students: 25,
    },
    { 
      id: 3, 
      course: 'CS301: Database Systems', 
      time: '11:00 AM - 12:30 PM', 
      day: 'Wednesday',
      room: 'Building A, Room 304',
      students: 23,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Faculty Dashboard</h1>
        <p className="text-sm text-gray-500">Welcome back, {user?.name}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-indigo-50 border-indigo-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-indigo-600">Enrolled Students</p>
              <p className="text-3xl font-bold text-indigo-800">{stats.enrolledStudents}</p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-full">
              <Users className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
          <div className="mt-4">
            <Button 
              size="sm" 
              variant="outline" 
              className="text-indigo-600 border-indigo-300 hover:bg-indigo-50"
              onClick={() => navigate('/faculty/students')}
            >
              View Students
            </Button>
          </div>
        </Card>

        <Card className="bg-green-50 border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Courses Teaching</p>
              <p className="text-3xl font-bold text-green-800">{stats.coursesTeaching}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <ClipboardList className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <Button 
              size="sm" 
              variant="outline" 
              className="text-green-600 border-green-300 hover:bg-green-50"
              onClick={() => navigate('/faculty/attendance')}
            >
              Attendance Reports
            </Button>
          </div>
        </Card>

        <Card className="bg-amber-50 border-amber-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-600">Leave Requests</p>
              <p className="text-3xl font-bold text-amber-800">{stats.pendingLeaveRequests}</p>
            </div>
            <div className="p-3 bg-amber-100 rounded-full">
              <Calendar className="h-6 w-6 text-amber-600" />
            </div>
          </div>
          <div className="mt-4">
            <Button 
              size="sm" 
              variant="outline" 
              className="text-amber-600 border-amber-300 hover:bg-amber-50"
              onClick={() => navigate('/faculty/leave')}
            >
              Request Leave
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
                  {activity.status && (
                    <span 
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
                    >
                      {activity.status}
                    </span>
                  )}
                  {activity.students && (
                    <span className="text-sm text-gray-600">{activity.students} students</span>
                  )}
                  {activity.student && (
                    <span className="text-sm text-gray-600">{activity.student}</span>
                  )}
                </div>
              </div>
            ))}
            {recentActivity.length === 0 && (
              <p className="text-gray-500 text-center py-4">No recent activity</p>
            )}
          </div>
        </Card>

        {/* Upcoming Classes */}
        <Card title="Upcoming Classes">
          <div className="space-y-4">
            {upcomingClasses.map((course) => (
              <div key={course.id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{course.course}</h3>
                    <p className="text-xs text-gray-500">
                      {course.day}, {course.time} • {course.room}
                    </p>
                  </div>
                  <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                    {course.students} students
                  </span>
                </div>
                <div className="mt-2 flex justify-end">
                  <a href="#" className="text-xs text-blue-600 flex items-center hover:underline">
                    View Syllabus <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </div>
              </div>
            ))}
            {upcomingClasses.length === 0 && (
              <p className="text-gray-500 text-center py-4">No upcoming classes</p>
            )}
          </div>
        </Card>
      </div>

      {/* Performance Overview */}
      <Card title="Student Performance Overview">
        <div className="h-64 flex items-center justify-center border border-gray-200 rounded-md bg-gray-50">
          <div className="text-center">
            <BarChart3 className="h-10 w-10 text-gray-400 mx-auto" />
            <p className="mt-2 text-sm text-gray-600">Student performance metrics will be visible here</p>
            <Button variant="outline" size="sm" className="mt-4">
              Generate Reports
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default FacultyDashboard;
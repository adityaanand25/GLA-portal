import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  CheckCircle, Users2, MessageSquare, 
  TrendingUp, TrendingDown, FileText, CreditCard, Calendar, Users
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    pendingIdCards: 0,
    facultyAssignments: 0,
    unresolvedComplaints: 0,
  });

  useEffect(() => {
    // In a real app, fetch this data from API
    // Simulating API call
    setTimeout(() => {
      setStats({
        pendingIdCards: 3,
        facultyAssignments: 2,
        unresolvedComplaints: 5,
      });
    }, 500);
  }, []);

  const recentActivity = [
    { 
      id: 1, 
      action: 'Approved ID card request', 
      date: '2025-04-15', 
      student: 'Alex Johnson' 
    },
    { 
      id: 2, 
      action: 'Assigned faculty to CS301', 
      date: '2025-04-14', 
      faculty: 'Dr. Sarah Wilson' 
    },
    { 
      id: 3, 
      action: 'Resolved IT complaint #1234', 
      date: '2025-04-10', 
      student: 'Michael Brown' 
    },
  ];

  const pendingApprovals = [
    { 
      id: 1, 
      type: 'ID Card', 
      requestor: 'Jessica Davis', 
      date: '2025-04-15' 
    },
    { 
      id: 2, 
      type: 'IT Complaint', 
      requestor: 'David Miller', 
      date: '2025-04-14' 
    },
    { 
      id: 3, 
      type: 'Faculty Assignment', 
      requestor: 'Department Head', 
      date: '2025-04-13' 
    },
  ];

  const menuItems = [
    {
      title: 'Complaint Resolution',
      description: 'View and respond to student complaints',
      icon: <FileText className="h-6 w-6" />,
      href: '/admin/complaints',
    },
    {
      title: 'ID Card Requests',
      description: 'Process student ID card requests',
      icon: <CreditCard className="h-6 w-6" />,
      href: '/admin/id-cards',
    },
    {
      title: 'Faculty Management',
      description: 'Manage faculty assignments and roles',
      icon: <Users className="h-6 w-6" />,
      href: '/admin/faculty-assignment',
    },
    {
      title: 'Leave Requests',
      description: 'Review and manage faculty leave requests',
      icon: <Calendar className="h-6 w-6" />,
      href: '/admin/leave-requests',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-sm text-gray-500">Welcome back, {user?.name}</p>
      </div>

      {/* Navigation Menu */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => (
          <Link key={item.href} to={item.href}>
            <Card className="h-full hover:bg-gray-50 transition-colors">
              <div className="p-6">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="text-lg font-medium text-gray-900">{item.title}</h3>
                <p className="mt-2 text-sm text-gray-500">{item.description}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-purple-50 border-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Pending ID Cards</p>
              <p className="text-3xl font-bold text-purple-800">{stats.pendingIdCards}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <CreditCard className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <Button 
              size="sm" 
              variant="outline" 
              className="text-purple-600 border-purple-300 hover:bg-purple-50"
              onClick={() => navigate('/admin/id-cards')}
            >
              Review Requests
            </Button>
          </div>
        </Card>

        <Card className="bg-teal-50 border-teal-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-teal-600">Faculty Assignments</p>
              <p className="text-3xl font-bold text-teal-800">{stats.facultyAssignments}</p>
            </div>
            <div className="p-3 bg-teal-100 rounded-full">
              <Users2 className="h-6 w-6 text-teal-600" />
            </div>
          </div>
          <div className="mt-4">
            <Button 
              size="sm" 
              variant="outline" 
              className="text-teal-600 border-teal-300 hover:bg-teal-50"
              onClick={() => navigate('/admin/faculty-assignment')}
            >
              Assign Faculty
            </Button>
          </div>
        </Card>

        <Card className="bg-red-50 border-red-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Unresolved Complaints</p>
              <p className="text-3xl font-bold text-red-800">{stats.unresolvedComplaints}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <MessageSquare className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <div className="mt-4">
            <Button 
              size="sm" 
              variant="outline" 
              className="text-red-600 border-red-300 hover:bg-red-50"
              onClick={() => navigate('/admin/complaints')}
            >
              Resolve Complaints
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
                  {activity.student && (
                    <span className="text-sm text-gray-600">Student: {activity.student}</span>
                  )}
                  {activity.faculty && (
                    <span className="text-sm text-gray-600">Faculty: {activity.faculty}</span>
                  )}
                </div>
              </div>
            ))}
            {recentActivity.length === 0 && (
              <p className="text-gray-500 text-center py-4">No recent activity</p>
            )}
          </div>
        </Card>

        {/* Pending Approvals */}
        <Card title="Pending Approvals">
          <div className="space-y-4">
            {pendingApprovals.map((approval) => (
              <div key={approval.id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{approval.type} Request</h3>
                    <p className="text-xs text-gray-500">
                      From: {approval.requestor} • Submitted: {approval.date}
                    </p>
                  </div>
                  <span 
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
                  >
                    Pending
                  </span>
                </div>
                <div className="mt-2 flex justify-end space-x-2">
                  <Button size="sm" variant="outline" className="text-xs py-1">
                    View Details
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs py-1 text-green-600 border-green-300">
                    Approve
                  </Button>
                </div>
              </div>
            ))}
            {pendingApprovals.length === 0 && (
              <p className="text-gray-500 text-center py-4">No pending approvals</p>
            )}
          </div>
        </Card>
      </div>

      {/* System Statistics */}
      <Card title="System Statistics">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Students</p>
                <p className="text-xl font-bold text-gray-900">1,245</p>
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div className="mt-2 text-xs text-green-600">+5% from last month</div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Faculty</p>
                <p className="text-xl font-bold text-gray-900">78</p>
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div className="mt-2 text-xs text-green-600">+2% from last month</div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Courses</p>
                <p className="text-xl font-bold text-gray-900">142</p>
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div className="mt-2 text-xs text-green-600">+10% from last semester</div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Resolved Issues</p>
                <p className="text-xl font-bold text-gray-900">87%</p>
              </div>
              <TrendingDown className="h-5 w-5 text-red-500" />
            </div>
            <div className="mt-2 text-xs text-red-600">-3% from last month</div>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card title="Quick Actions">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            variant="outline" 
            className="justify-start py-3"
            icon={<FileText className="h-5 w-5 text-gray-600" />}
          >
            Generate Reports
          </Button>
          <Button 
            variant="outline" 
            className="justify-start py-3"
            icon={<CheckCircle className="h-5 w-5 text-gray-600" />}
          >
            Batch Approve Requests
          </Button>
          <Button 
            variant="outline" 
            className="justify-start py-3"
            icon={<Users2 className="h-5 w-5 text-gray-600" />}
          >
            Manage User Accounts
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;
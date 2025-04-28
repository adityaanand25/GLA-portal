import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu, X, GraduationCap, Book, FileText, CreditCard, 
  ClipboardList, Users, Calendar, PieChart, CheckCircle, 
  Users2, MessageSquare, Bell, LogOut
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Close mobile menu when route changes
    setIsMobileMenuOpen(false);
  }, [location]);

  useEffect(() => {
    console.log('DashboardLayout loaded with user:', user);
    console.log('Current location:', location.pathname);
  }, [user, location]);

  if (!user) {
    return null;
  }

  const getNavItems = () => {
    switch (user.role) {
      case 'student':
        return [
          { name: 'Dashboard', path: '/student', icon: <PieChart className="w-5 h-5" /> },
          { name: 'Course Enrollment', path: '/student/courses', icon: <Book className="w-5 h-5" /> },
          { name: 'Submit Complaint', path: '/student/complaints', icon: <FileText className="w-5 h-5" /> },
          { name: 'ID Card Request', path: '/student/id-card', icon: <CreditCard className="w-5 h-5" /> },
          { name: 'Request Status', path: '/student/status', icon: <ClipboardList className="w-5 h-5" /> },
        ];
      case 'faculty':
        return [
          { name: 'Dashboard', path: '/faculty', icon: <PieChart className="w-5 h-5" /> },
          { name: 'Enrolled Students', path: '/faculty/students', icon: <Users className="w-5 h-5" /> },
          { name: 'Leave Request', path: '/faculty/leave', icon: <Calendar className="w-5 h-5" /> },
          { name: 'Attendance Report', path: '/faculty/attendance', icon: <ClipboardList className="w-5 h-5" /> },
        ];
      case 'admin':
        return [
          { name: 'Dashboard', path: '/admin', icon: <PieChart className="w-5 h-5" /> },
          { name: 'ID Card Approval', path: '/admin/id-cards', icon: <CheckCircle className="w-5 h-5" /> },
          { name: 'Faculty Assignment', path: '/admin/faculty-assignment', icon: <Users2 className="w-5 h-5" /> },
          { name: 'Complaints', path: '/admin/complaints', icon: <MessageSquare className="w-5 h-5" /> },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();
  const roleTitle = user.role.charAt(0).toUpperCase() + user.role.slice(1);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 focus:outline-none"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
              <div className="flex items-center ml-2 md:ml-0">
                <GraduationCap className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-semibold text-gray-900">GLA</span>
                <span className="hidden md:inline-block ml-2 text-sm font-medium text-gray-600 bg-gray-100 py-1 px-2 rounded">
                  {roleTitle} Portal
                </span>
              </div>
            </div>
            <div className="flex items-center">
              <div className="relative">
                <button className="p-1 rounded-full text-gray-500 hover:text-gray-700 focus:outline-none">
                  <Bell className="h-6 w-6" />
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                </button>
              </div>
              <div className="ml-4 flex items-center">
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="ml-2 hidden md:block">
                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                </div>
                <button 
                  onClick={logout}
                  className="ml-4 p-1 rounded-full text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Mobile Sidebar */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-40 md:hidden"
            >
              <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setIsMobileMenuOpen(false)}></div>
              <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
                <div className="px-4 pt-5 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <GraduationCap className="h-8 w-8 text-blue-600" />
                      <span className="ml-2 text-xl font-semibold text-gray-900">GLA</span>
                    </div>
                    <button
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="rounded-md text-gray-500 hover:text-gray-900 focus:outline-none"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                  <nav className="mt-5">
                    <div className="px-2 space-y-1">
                      {navItems.map((item) => (
                        <a
                          key={item.path}
                          href={item.path}
                          onClick={(e) => {
                            e.preventDefault();
                            navigate(item.path);
                          }}
                          className={`${
                            location.pathname === item.path
                              ? 'bg-blue-50 text-blue-700'
                              : 'text-gray-600 hover:bg-gray-100'
                          } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                        >
                          {item.icon}
                          <span className="ml-3">{item.name}</span>
                        </a>
                      ))}
                    </div>
                  </nav>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop Sidebar */}
        <div className="hidden md:flex md:flex-shrink-0">
          <div className="flex flex-col w-64 border-r border-gray-200 bg-white">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex-1 px-3 bg-white">
                <div className="pt-2 pb-4 border-b border-gray-200">
                  <div className="px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-sm font-medium">
                    {roleTitle} Portal
                  </div>
                </div>
                <nav className="mt-5 flex-1">
                  <div className="space-y-1">
                    {navItems.map((item) => (
                      <a
                        key={item.path}
                        href={item.path}
                        onClick={(e) => {
                          e.preventDefault();
                          navigate(item.path);
                        }}
                        className={`${
                          location.pathname === item.path
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-600 hover:bg-gray-50'
                        } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                      >
                        {item.icon}
                        <span className="ml-3">{item.name}</span>
                      </a>
                    ))}
                  </div>
                </nav>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <main className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
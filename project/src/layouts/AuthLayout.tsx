import { Outlet } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Side - Branding */}
      <div className="bg-blue-700 text-white md:w-1/2 p-8 flex flex-col justify-center items-center">
        <div className="max-w-md text-center">
          <GraduationCap className="w-16 h-16 mb-6 mx-auto" />
          <h1 className="text-4xl font-bold mb-4">GLA University</h1>
          <p className="text-xl mb-8">Centralized Service Management System</p>
          <div className="space-y-4 text-left">
            <div className="bg-blue-600 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">For Students</h3>
              <p className="opacity-85">Course enrollment, service requests, and ID card management</p>
            </div>
            <div className="bg-blue-600 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">For Faculty</h3>
              <p className="opacity-85">Manage students, request leave, and view attendance reports</p>
            </div>
            <div className="bg-blue-600 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">For Administrators</h3>
              <p className="opacity-85">Approve requests, assign faculty, and resolve complaints</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Side - Auth Form */}
      <div className="md:w-1/2 p-8 flex items-center justify-center bg-gray-50">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
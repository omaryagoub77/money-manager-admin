import React from 'react';

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600 mb-8">Welcome to the secure admin panel</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">User Management</h3>
                <p className="text-blue-600">Manage user accounts and permissions</p>
              </div>
              
              <div className="bg-green-50 rounded-lg p-6 border border-green-100">
                <h3 className="text-lg font-semibold text-green-800 mb-2">System Settings</h3>
                <p className="text-green-600">Configure application settings</p>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-6 border border-purple-100">
                <h3 className="text-lg font-semibold text-purple-800 mb-2">Reports</h3>
                <p className="text-purple-600">View system analytics and reports</p>
              </div>
            </div>
            
            <div className="mt-12">
              <div className="inline-flex items-center px-4 py-2 bg-indigo-100 text-indigo-800 rounded-full">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span>Secure Admin Access Granted</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
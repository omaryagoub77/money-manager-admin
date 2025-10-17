import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

const Home = () => {
  const routes = [
    { name: 'Dashboard', path: '/dashboard', description: 'View overall statistics and metrics' },
    { name: 'Deposits', path: '/deposits', description: 'Manage customer deposits and transactions (Admin)' },
    { name: 'My Deposits', path: '/my-deposits', description: 'View your deposit history and status' },
    { name: 'Cash Outs', path: '/cashouts', description: 'Manage customer cash out requests (Admin)' },
    { name: 'My Cash Outs', path: '/my-cashouts', description: 'View your cash out history and status' },
    { name: 'Chat', path: '/chat', description: 'Interact with customers in real-time' },
    { name: 'Profile', path: '/profile', description: 'Manage your profile information' },
    { name: 'Debug', path: '/debug', description: 'Debug Firestore data issues', adminOnly: true },
  ];

  return (
    <Layout>
      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold leading-tight text-gray-900">Money Box Admin Portal</h1>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="px-4 py-8 sm:px-0">
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h2 className="text-lg leading-6 font-medium text-gray-900">Available Sections</h2>
                  <p className="mt-1 text-sm text-gray-500">Navigate to different parts of the admin portal</p>
                </div>
                <div className="border-t border-gray-200">
                  <ul className="divide-y divide-gray-200">
                    {routes.map((route) => (
                      <li key={route.path}>
                        <Link to={route.path} className="block hover:bg-gray-50">
                          <div className="px-4 py-4 flex items-center sm:px-6">
                            <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                              <div className="truncate">
                                <div className="flex text-sm font-medium text-indigo-600 truncate">
                                  {route.name}
                                </div>
                                <div className="mt-2 flex">
                                  <div className="flex items-center text-sm text-gray-500">
                                    {route.description}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="ml-5 flex-shrink-0">
                              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default Home;
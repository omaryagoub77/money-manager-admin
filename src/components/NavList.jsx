// import React from 'react';
// import { Link, useLocation, useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';

// const NavList = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const { currentUser, logout } = useAuth();

//   const navItems = [
//     { name: 'Dashboard', path: '/dashboard' },
//     { name: 'Deposits', path: '/deposits' },
//     { name: 'Cash Outs', path: '/cashouts' },
//     { name: 'Chat', path: '/chat' },
//     { name: 'Profile', path: '/profile' },
//   ];

//   // Only show debug link when on the debug page
//   const debugItem = { name: 'Debug', path: '/debug' };

//   const getLinkClass = (path) => {
//     return location.pathname === path
//       ? "bg-indigo-50 border-indigo-600 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700"
//       : "border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900";
//   };

//   const handleLogout = async () => {
//     try {
//       await logout();
//       navigate('/');
//     } catch (error) {
//       console.error('Failed to log out', error);
//     }
//   };

//   return (
//     <div className="bg-white shadow">
//       <div className="px-4 py-5 sm:px-6">
//         <h3 className="text-lg leading-6 font-medium text-gray-900">Navigation</h3>
//         <p className="mt-1 text-sm text-gray-500">Quick links to all sections</p>
//       </div>
//       <nav className="border-t border-gray-200">
//         <div className="px-2 py-3 space-y-1">
//           {navItems.map((item) => (
//             <Link
//               key={item.name}
//               to={item.path}
//               className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${getLinkClass(item.path)}`}
//             >
//               {item.name}
//             </Link>
//           ))}
//           {currentUser && (
//             <button
//               onClick={handleLogout}
//               className="block w-full text-left pl-3 pr-4 py-2 border-l-4 text-base font-medium border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900"
//             >
//               Logout
//             </button>
//           )}
//         </div>
//       </nav>
//     </div>
//   );
// };

// export default NavList;
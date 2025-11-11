import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { sendPasswordResetEmail } from 'firebase/auth';

const AdminGate = ({ onAccessGranted }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Handle error message timeout
  useEffect(() => {
    if (error) {
      setShowError(true);
      const timer = setTimeout(() => {
        setShowError(false);
        setError('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Handle success message timeout
  useEffect(() => {
    if (success) {
      setShowSuccess(true);
      const timer = setTimeout(() => {
        setShowSuccess(false);
        setSuccess('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Fetch the admin password from Firestore
      const docRef = doc(db, 'adminSettings', 'security');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const { password: storedPassword } = docSnap.data();
        
        if (password === storedPassword) {
          // Correct password
          onAccessGranted();
        } else {
          // Incorrect password
          setError('Incorrect password. Please try again.');
        }
      } else {
        setError('Admin settings not found. Please contact support.');
      }
    } catch (err) {
      console.error('Error fetching admin password:', err);
      setError('Failed to verify password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setSuccess('Password reset email sent! Check your inbox.');
      // Hide the modal after success
      setTimeout(() => {
        setShowForgotPassword(false);
        setResetEmail('');
      }, 3000);
    } catch (err) {
      console.error('Error sending password reset email:', err);
      setError('Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-96">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Admin Access</h2>
        <form onSubmit={handlePasswordSubmit}>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 w-full"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md w-full mt-4 transition disabled:opacity-50"
          >
            {isLoading ? 'Verifying...' : 'Access Admin Dashboard'}
          </button>
        </form>
        
        {error && (
          <div className={`text-red-500 mt-2 transition-opacity duration-500 ${showError ? 'opacity-100' : 'opacity-0'}`}>
            {error}
          </div>
        )}
        
        {success && (
          <div className={`text-green-500 mt-2 transition-opacity duration-500 ${showSuccess ? 'opacity-100' : 'opacity-0'}`}>
            {success}
          </div>
        )}
        
        <div 
          className="text-blue-600 text-sm mt-3 hover:underline cursor-pointer"
          onClick={() => setShowForgotPassword(true)}
        >
          Forgot password?
        </div>
      </div>
      
      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white shadow-lg rounded-2xl p-8 w-96">
            <h2 className="text-xl font-bold text-center mb-4 text-gray-800">Reset Password</h2>
            <p className="text-gray-600 text-sm mb-4">
              Enter your admin email to receive a password reset link.
            </p>
            
            <form onSubmit={handleResetPassword}>
              <div className="mb-4">
                <label htmlFor="resetEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="resetEmail"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 w-full"
                  required
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-md w-1/2 transition"
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md w-1/2 transition disabled:opacity-50"
                >
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </form>
            
            {error && (
              <div className={`text-red-500 mt-2 transition-opacity duration-500 ${showError ? 'opacity-100' : 'opacity-0'}`}>
                {error}
              </div>
            )}
            
            {success && (
              <div className={`text-green-500 mt-2 transition-opacity duration-500 ${showSuccess ? 'opacity-100' : 'opacity-0'}`}>
                {success}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGate;
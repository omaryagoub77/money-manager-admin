import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const ReplyBox = ({ onSend }) => {
  const [message, setMessage] = useState('');
  const { currentUser } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Only send message if user is logged in and message is not empty
    if (currentUser && message.trim()) {
      onSend(message);
      setMessage('');
    }
  };

  // If user is not logged in, show a message instead of the input
  if (!currentUser) {
    return (
      <div className="reply-box p-4 bg-gray-100 text-center text-gray-500 rounded-b-lg">
        Please log in to send replies
      </div>
    );
  }

  return (
    <div className="reply-box p-4 bg-gray-100">
      <form onSubmit={handleSubmit}>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your reply here..."
          rows="3"
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="mt-2 flex justify-end">
          <button 
            type="submit" 
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!message.trim()}
          >
            Send Reply
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReplyBox;
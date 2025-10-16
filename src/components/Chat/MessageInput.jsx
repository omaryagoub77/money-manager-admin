import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const MessageInput = ({ onSend }) => {
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
      <div className="message-input p-4 bg-gray-100 text-center text-gray-500">
        Please log in to send messages
      </div>
    );
  }

  return (
    <div className="message-input p-4 bg-gray-100">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button 
          type="submit" 
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!message.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../firebaseConfig';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';

export default function ChatBox() {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef();

  useEffect(() => {
    const q = query(collection(db, 'messages'), orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(q, snapshot => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, []);

  const sendMessage = async e => {
    e.preventDefault();
    if (!newMessage) return;
    await addDoc(collection(db, 'messages'), {
      text: newMessage,
      userId: currentUser.uid,
      userName: currentUser.email.split('@')[0],
      timestamp: serverTimestamp()
    });
    setNewMessage('');
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-gray-200">
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.userId === currentUser.uid ? 'justify-start' : 'justify-end'} mb-2`}>
            {msg.userId !== currentUser.uid && (
              <div className="w-8 h-8 rounded-full bg-[#075e54] text-white flex items-center justify-center mr-2">
                {msg.userName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className={`p-2 rounded-lg max-w-[70%] ${msg.userId === currentUser.uid ? 'bg-green-200 rounded-tr-none' : 'bg-white rounded-tl-none'}`}>
              <div className="text-sm text-gray-600 mb-1 text-right">
                {msg.timestamp?.toDate ? new Date(msg.timestamp.toDate()).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) : ''}
              </div>
              <div>{msg.text}</div>
            </div>
            {msg.userId === currentUser.uid && (
              <div className="w-8 h-8 rounded-full bg-[#075e54] text-white flex items-center justify-center ml-2">
                {msg.userName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage} className="flex p-2 bg-gray-300">
        <input 
          type="text" 
          className="flex-1 p-2 rounded-l border border-gray-400 focus:outline-none" 
          placeholder="Type a message..." 
          value={newMessage} 
          onChange={e => setNewMessage(e.target.value)}
        />
        <button className="bg-[#075e54] text-white p-2 rounded-r">Send</button>
      </form>
    </div>
  );
}

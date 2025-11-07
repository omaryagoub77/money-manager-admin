import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../firebaseConfig';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';

export default function ChatBox() {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [users, setUsers] = useState({});
  const messagesEndRef = useRef();
  const lastActiveIntervalRef = useRef();
  
  // Set user online status when component mounts
  useEffect(() => {
    if (!currentUser) return;
    
    const setUserOnline = async () => {
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, {
          isOnline: true,
          lastActive: serverTimestamp()
        });
      } catch (error) {
        console.error('Error setting user online:', error);
      }
    };
    
    setUserOnline();
    
    // Set up periodic lastActive updates (every 30 seconds)
    lastActiveIntervalRef.current = setInterval(async () => {
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, {
          lastActive: serverTimestamp()
        });
      } catch (error) {
        console.error('Error updating lastActive:', error);
      }
    }, 30000);
    
    // Handle page unload - set user offline
    const handleBeforeUnload = async () => {
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, {
          isOnline: false,
          lastActive: serverTimestamp()
        });
      } catch (error) {
        console.error('Error setting user offline:', error);
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      // Clean up interval and event listener
      clearInterval(lastActiveIntervalRef.current);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      // Set user offline when component unmounts
      if (currentUser) {
        const setUserOffline = async () => {
          try {
            const userRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userRef, {
              isOnline: false,
              lastActive: serverTimestamp()
            });
          } catch (error) {
            console.error('Error setting user offline:', error);
          }
        };
        
        setUserOffline();
      }
    };
  }, [currentUser]);
  
  // Fetch messages
  useEffect(() => {
    // Only subscribe to messages if user is logged in
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'messages'), orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(q, snapshot => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return unsubscribe;
  }, [currentUser]);
  
  // Fetch users and their online status
  useEffect(() => {
    if (!currentUser) return;
    
    const unsubscribe = onSnapshot(collection(db, 'users'), snapshot => {
      const usersData = {};
      const onlineUsersSet = new Set();
      
      snapshot.forEach(doc => {
        const userData = doc.data();
        usersData[doc.id] = userData;
        
        // Check if user is online (active in the last 2 minutes)
        if (userData.isOnline && userData.lastActive) {
          const lastActiveTime = userData.lastActive.toDate();
          const currentTime = new Date();
          const timeDiff = (currentTime - lastActiveTime) / (1000 * 60); // in minutes
          
          // Consider user online if they were active in the last 2 minutes
          if (timeDiff < 2) {
            onlineUsersSet.add(doc.id);
          } else {
            // If user was marked online but hasn't been active recently, update their status
            updateDoc(doc(db, 'users', doc.id), {
              isOnline: false
            });
          }
        }
      });
      
      setUsers(usersData);
      setOnlineUsers(onlineUsersSet);
    });
    
    return unsubscribe;
  }, [currentUser]);

  const sendMessage = async e => {
    e.preventDefault();
    // Don't send message if user is not logged in or message is empty
    if (!currentUser || !newMessage.trim()) return;
    
    try {
      await addDoc(collection(db, 'messages'), {
        text: newMessage,
        userId: currentUser.uid,
        userName: currentUser.email ? currentUser.email.split('@')[0] : 'Anonymous',
        timestamp: serverTimestamp()
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Format timestamp for display
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate();
    return date.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
  };

  // Show a message if user is not logged in
  if (!currentUser) {
    return (
      <div className="flex flex-col h-screen bg-gradient-to-b from-gray-50 to-gray-100 items-center justify-center font-sans text-gray-800">
        <div className="text-center p-6 bg-white rounded-2xl shadow-lg max-w-md">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Please log in to use chat</h3>
          <p className="text-gray-600">You need to be logged in to send and receive messages.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-gray-50 to-gray-100 font-sans text-gray-800 max-w-4xl mx-auto w-full">
      {/* Chat Header */}
      <div className="sticky top-4 z-30 flex items-center gap-3 p-4 m-4 bg-white/70 backdrop-blur-md rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl">
        <div className="relative">
          <div className="w-11 h-11 rounded-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-indigo-600 text-white font-bold shadow-md">
            {currentUser?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          {/* Online status indicator for current user */}
          <div 
            className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"
            title="Online"
          ></div>
        </div>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-gray-900">Chat Room</h1>
          <p className="text-sm text-gray-500">{messages.length} Messages</p>
        </div>
        {/* Online users count */}
        <div className="flex items-center gap-1 bg-white/80 px-3 py-1 rounded-full">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-xs text-gray-600">{onlineUsers.size} online</span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 max-w-full">
        {loading ? (
          <div className="flex justify-center p-6">
            <div className="flex gap-2">
              <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce"></div>
              <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0.16s'}}></div>
              <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0.32s'}}></div>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-gray-500 p-10 bg-white rounded-2xl shadow-lg m-5">
            <div className="text-4xl mb-3 opacity-70">💬</div>
            <div className="text-sm text-center max-w-xs">No messages yet. Start a conversation!</div>
          </div>
        ) : (
          messages.map(msg => (
            <div 
              key={msg.id} 
              className={`flex ${msg.userId === currentUser.uid ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              {msg.userId !== currentUser.uid && (
                <div className="relative">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center bg-white text-indigo-600 font-bold flex-shrink-0 shadow-sm mr-2">
                    {msg.userName ? msg.userName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  {/* Online status indicator for message sender */}
                  {onlineUsers.has(msg.userId) && (
                    <div 
                      className="absolute  bottom-[60px] right-7 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"
                      title="Online"
                    ></div>
                  )}
                </div>
              )}
              <div className={`max-w-[72%] p-3 rounded-2xl relative shadow-md transition-all duration-300 hover:shadow-lg ${
                msg.userId === currentUser.uid 
                  ? 'bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-100 rounded-br-md' 
                  : 'bg-white border border-gray-200 rounded-bl-md'
              }`}>
                <div className="text-sm text-gray-800 leading-relaxed">{msg.text}</div>
                <div className="text-xs text-gray-400 text-right mt-2">
                  {formatTime(msg.timestamp)}
                </div>
              </div>
              {msg.userId === currentUser.uid && (
                <div className="relative">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-indigo-600 text-white font-bold flex-shrink-0 shadow-sm ml-2">
                    {msg.userName ? msg.userName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  {/* Online status indicator for current user */}
                  <div 
                    className="absolute bottom-[60px] right-6 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"
                    title="Online"
                  ></div>
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={sendMessage} className="flex items-center p-4 gap-3 sticky bottom-0 bg-white/70 backdrop-blur-md border-t border-gray-200">
        <div className="flex-1 flex items-center bg-white p-2 pl-4 rounded-full shadow-md transition-all duration-300 focus-within:shadow-lg focus-within:border focus-within:border-indigo-500">
          <input 
            type="text" 
            className="flex-1 border-0 outline-none p-2 bg-transparent text-sm text-gray-800" 
            placeholder="Type a message..." 
            value={newMessage} 
            onChange={e => setNewMessage(e.target.value)}
          />
        </div>
        <button 
          type="submit"
          className="w-11 h-11 rounded-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-none cursor-pointer shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          disabled={!newMessage.trim()}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4.5 h-4.5">
            <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
          </svg>
        </button>
      </form>
    </div>
  );
}
import React from 'react';
import ChatBox from '../components/Chat/ChatBox';
import MessageInput from '../components/Chat/MessageInput';
import Layout from '../components/Layout';

const ChatPage = () => {
  return (
    <Layout>
      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold leading-tight text-gray-900">Customer Support Chat</h1>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="px-4 py-8 sm:px-0">
              <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
                <ChatBox />
                <MessageInput />
              </div>
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default ChatPage;
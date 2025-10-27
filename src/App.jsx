import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import Login from './pages/Login';
import SignIn from './components/Chat/SignIn';
import SignUP from './components/Chat/SignUp';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import DepositsPage from './pages/DepositsPage';
import ChatPage from './pages/ChatPage';
import Home from './pages/Home';
import CashOut from './pages/CashOut';
import Users from './pages/Users';
import Layout from './components/Layout';

import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public routes that shouldn't show the main layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUP />} />

          {/* Protected / main app routes wrapped by Layout so sidebar/header stay fixed */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="deposits" element={<DepositsPage />} />
            <Route path="cashouts" element={<CashOut />} />
            <Route path="users" element={<Users />} />
            <Route path="chat" element={<ChatPage />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
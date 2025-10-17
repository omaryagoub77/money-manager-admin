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

import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUP />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/deposits" element={<DepositsPage />} />
          <Route path="/cashouts" element={<CashOut />} />
          <Route path="/chat" element={<ChatPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
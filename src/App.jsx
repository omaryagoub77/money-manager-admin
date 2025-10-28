import { Routes, Route } from 'react-router-dom';
import SignIn from './components/Chat/SignIn';
import SignUP from './components/Chat/SignUp';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import Paybackloans from './pages/Paybackloans';
import DepositsPage from './pages/DepositsPage';
import ChatPage from './pages/ChatPage';
import Home from './pages/Home';
import Loans from './pages/Loans';
import Users from './pages/Users';
import Layout from './components/Layout';

function App() {
  return (
    <Routes>
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUP />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="deposits" element={<DepositsPage />} />
        <Route path="loans" element={<Loans />} />
        <Route path="payback" element={<Paybackloans />} />
        <Route path="users" element={<Users />} />
        <Route path="chat" element={<ChatPage />} />
      </Route>
    </Routes>
  );
}

export default App;

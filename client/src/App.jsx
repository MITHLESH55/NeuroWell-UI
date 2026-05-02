import { Routes, Route } from 'react-router-dom';
import MainLayout from './layout/MainLayout';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Assessment from './pages/Assessment';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/assessment" element={<Assessment />} />
      
      {/* Dashboard Routes with Sidebar Layout */}
      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        {/* We can add more nested routes here later like /goals, /community */}
      </Route>
    </Routes>
  );
}

export default App;

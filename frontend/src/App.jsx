import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ChatSupport from './pages/ChatSupport';
import ChatSupportNew from './pages/ChatSupportNew';
import ChatHistory from './pages/ChatHistory';
import Profile from './pages/Profile';
import BookAppointment from './pages/BookAppointment';
import Resources from './pages/Resources';
import PeerSupport from './pages/PeerSupport';
import Assessment from './pages/Assessment';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import AdminRoute from './components/AdminRoute';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import RegisterTest from './pages/RegisterTest';
import DiagnosticPage from './pages/DiagnosticPage';
import ChatTest from './pages/ChatTest';
import MoodTracker from './components/MoodTracker';
import PHQ9Assessment from './components/assessments/PHQ9Assessment';
import GAD7Assessment from './components/assessments/GAD7Assessment';
import GHQAssessment from './components/assessments/GHQAssessment';
import Settings from './pages/Settings';
import SettingsTest from './pages/SettingsTest';
import SettingsSimple from './pages/SettingsSimple';
import CallPage from './pages/CallPage';
import CounselorSupport from './pages/CounselorSupport';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { ThemeProvider } from './context/ThemeContext';
import { CallProvider } from './context/CallContext';

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <ThemeProvider>
          <Router>
            <CallProvider>
              <Layout>
            <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/register-test" element={<RegisterTest />} />
            <Route path="/diagnostic" element={<DiagnosticPage />} />
            
            {/* Protected Routes */}
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><ChatSupportNew /></ProtectedRoute>} />
            <Route path="/chat-old" element={<ProtectedRoute><ChatSupport /></ProtectedRoute>} />
            <Route path="/chat-test" element={<ProtectedRoute><ChatTest /></ProtectedRoute>} />
            <Route path="/chat-history" element={<ProtectedRoute><ChatHistory /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/book-appointment" element={<ProtectedRoute><BookAppointment /></ProtectedRoute>} />
            <Route path="/resources" element={<ProtectedRoute><Resources /></ProtectedRoute>} />
            <Route path="/peer-support" element={<ProtectedRoute><PeerSupport /></ProtectedRoute>} />
            <Route path="/assessment" element={<ProtectedRoute><Assessment /></ProtectedRoute>} />
            <Route path="/mood-tracker" element={<ProtectedRoute><MoodTracker /></ProtectedRoute>} />
            <Route path="/assessment/phq9" element={<ProtectedRoute><PHQ9Assessment /></ProtectedRoute>} />
            <Route path="/assessment/gad7" element={<ProtectedRoute><GAD7Assessment /></ProtectedRoute>} />
            <Route path="/assessment/ghq" element={<ProtectedRoute><GHQAssessment /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/counselor-support" element={<ProtectedRoute><CounselorSupport /></ProtectedRoute>} />
            <Route path="/call/:callType/:roomId" element={<ProtectedRoute><CallPage /></ProtectedRoute>} />
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } />
            </Routes>
              </Layout>
            </CallProvider>
          </Router>
        </ThemeProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;

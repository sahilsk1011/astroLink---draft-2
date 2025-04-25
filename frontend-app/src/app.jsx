// src/App.jsx (update with new routes)
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import ClientDashboard from './pages/client/Dashboard';
import AstrologerDashboard from './pages/astrologer/Dashboard';
import RequestDetails from './pages/astrologer/RequestDetails';
import ChatPage from './pages/chat/ChatPage';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Client routes */}
          <Route 
            path="/client/dashboard" 
            element={
              <ProtectedRoute requiredRole="client">
                <ClientDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Astrologer routes */}
          <Route 
            path="/astrologer/dashboard" 
            element={
              <ProtectedRoute requiredRole="astrologer">
                <AstrologerDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/astrologer/request/:requestId" 
            element={
              <ProtectedRoute requiredRole="astrologer">
                <RequestDetails />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/astrologer/chat/:channelId" 
            element={
              <ProtectedRoute requiredRole="astrologer">
                <ChatPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Redirect root to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* 404 route */}
          <Route path="*" element={<div className="text-center p-5">Page not found</div>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
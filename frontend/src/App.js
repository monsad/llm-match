import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@chakra-ui/react';
import { useAuth } from './contexts/AuthContext';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import RecommendationPage from './pages/RecommendationPage';
import RecommendationHistoryPage from './pages/RecommendationHistoryPage';
import ModelListPage from './pages/ModelListPage';
import ModelDetailPage from './pages/ModelDetailPage';
import AdminModelsPage from './pages/admin/AdminModelsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import NotFoundPage from './pages/NotFoundPage';
import ProfilePage from './pages/ProfilePage';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <Box p={8}>Loading...</Box>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

// Admin route component
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  
  if (isLoading) {
    return <Box p={8}>Loading...</Box>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (!isAdmin) {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

function App() {
  return (
    <Routes>
      {/* Auth routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>
      
      {/* Main layout routes */}
      <Route element={<MainLayout />}>
        {/* Public routes */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Protected routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />
        
        <Route path="/recommendations/new" element={
          <ProtectedRoute>
            <RecommendationPage />
          </ProtectedRoute>
        } />
        
        <Route path="/recommendations/history" element={
          <ProtectedRoute>
            <RecommendationHistoryPage />
          </ProtectedRoute>
        } />
        
        <Route path="/models" element={
          <ProtectedRoute>
            <ModelListPage />
          </ProtectedRoute>
        } />
        
        <Route path="/models/:id" element={
          <ProtectedRoute>
            <ModelDetailPage />
          </ProtectedRoute>
        } />
        
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        
        {/* Admin routes */}
        <Route path="/admin/models" element={
          <AdminRoute>
            <AdminModelsPage />
          </AdminRoute>
        } />
        
        <Route path="/admin/users" element={
          <AdminRoute>
            <AdminUsersPage />
          </AdminRoute>
        } />
      </Route>
      
      {/* 404 route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;

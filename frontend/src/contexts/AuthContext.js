import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@chakra-ui/react';
import api from '../services/api';

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          // Set token in API headers
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Fetch current user
          const response = await api.get('/api/v1/users/me');
          setUser(response.data);
        } catch (error) {
          console.error('Authentication error:', error);
          // Clear invalid token
          localStorage.removeItem('token');
          setToken(null);
          delete api.defaults.headers.common['Authorization'];
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [token]);

  // Login function
  const login = async (email, password) => {
    try {
      setIsLoading(true);
      
      // Create form data
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);
      
      // Make login request
      const response = await api.post('/api/v1/auth/login', formData);
      const { access_token } = response.data;
      
      // Save token
      localStorage.setItem('token', access_token);
      setToken(access_token);
      
      // Set API headers
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      // Fetch user data
      const userResponse = await api.get('/api/v1/users/me');
      setUser(userResponse.data);
      
      // Success message
      toast({
        title: 'Login successful',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      
      // Error message
      toast({
        title: 'Login failed',
        description: error.response?.data?.detail || 'Invalid credentials',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setIsLoading(true);
      
      // Make register request
      await api.post('/api/v1/auth/register', userData);
      
      // Success message
      toast({
        title: 'Registration successful',
        description: 'You can now login with your credentials',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Redirect to login
      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error);
      
      // Error message
      toast({
        title: 'Registration failed',
        description: error.response?.data?.detail || 'Please check your information',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    // Clear token and user
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
    
    // Success message
    toast({
      title: 'Logged out',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
    
    // Redirect to login
    navigate('/login');
  };

  // Context value
  const value = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.is_admin || false,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Auth hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;

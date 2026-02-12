import {
  useState,
  useEffect,
  createContext,
  useContext,
  useCallback,
} from 'react';
import { apiService } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const logout = useCallback(() => {
    localStorage.removeItem(
      process.env.REACT_APP_AUTH_TOKEN_KEY || 'access_token'
    );
    localStorage.removeItem(
      process.env.REACT_APP_REFRESH_TOKEN_KEY || 'refresh_token'
    );
    setUser(null);
    setError(null);
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem(
        process.env.REACT_APP_AUTH_TOKEN_KEY || 'access_token'
      );
      if (token) {
        // Skip the /auth/me call since this endpoint doesn't exist
        // Just set a basic user object if token exists
        setUser({ username: 'authenticated_user' });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async credentials => {
    try {
      setLoading(true);
      setError(null);

      // Make API call to the login endpoint
      const response = await apiService.post('/auth/login', {
        username: credentials.username,
        password: credentials.password,
      });

      const { token, teacherId } = response.data;

      // Decode JWT token to get user information
      const decodeJWT = token => {
        try {
          const payload = token.split('.')[1];
          const decodedPayload = JSON.parse(atob(payload));
          return decodedPayload;
        } catch (error) {
          console.error('Error decoding JWT:', error);
          return null;
        }
      };

      const decodedToken = decodeJWT(token);
      const userInfo = decodedToken;

      // Store token in localStorage
      localStorage.setItem(
        process.env.REACT_APP_AUTH_TOKEN_KEY || 'access_token',
        token
      );

      // Store teacher_id
      localStorage.setItem('teacherId', teacherId);
      console.log('Stored teacherId:', teacherId);

      setUser(userInfo);
      return { success: true };
    } catch (error) {
      console.log('Login error:', error);
      console.log('Error response:', error.response);
      console.log('Error response data:', error.response?.data);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.response?.data?.detail ||
        'Login failed';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async userData => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.post('/auth/register', userData);
      const { token, user: newUser } = response.data;

      // Decode JWT token to get user information if not provided
      const decodeJWT = token => {
        try {
          const payload = token.split('.')[1];
          const decodedPayload = JSON.parse(atob(payload));
          return decodedPayload;
        } catch (error) {
          console.error('Error decoding JWT:', error);
          return null;
        }
      };

      const decodedToken = decodeJWT(token);
      const userInfo = newUser || decodedToken;

      localStorage.setItem(
        process.env.REACT_APP_AUTH_TOKEN_KEY || 'access_token',
        token
      );

      setUser(userInfo);
      return { success: true };
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed',
      };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async profileData => {
    try {
      setLoading(true);
      const response = await apiService.put('/auth/profile', profileData);
      setUser(response.data);
      return { success: true };
    } catch (error) {
      setError(error.response?.data?.message || 'Profile update failed');
      return {
        success: false,
        error: error.response?.data?.message || 'Profile update failed',
      };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

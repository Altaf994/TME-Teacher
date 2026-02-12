import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './hooks/useAuth';
import ErrorBoundary from './components/common/ErrorBoundary';
import ProtectedRoute from './components/common/ProtectedRoute';
import NotFound from './components/common/NotFound';
import LoginForm from './components/auth/LoginForm';
import ForgetPassword from './components/auth/ForgetPassword';
import SignUpForm from './components/auth/SignUpForm';
import Dashboard from './components/Dashboard';
import FlashNumberGame from './pages/FlashNumberGame';
import DynamicActivity from './pages/DynamicActivity';
import AssignFlash from './pages/AssignFlash';
import NotificationSent from './pages/NotificationSent';
import Reports from './pages/Reports';
import Worksheets from './pages/Worksheets';
import WorksheetAssign from './pages/WorksheetAssign';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import './App.css';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <Router>
              <div className="App">
                <Routes>
                  {/* Redirect root to login */}
                  <Route path="/" element={<LoginForm />} />

                  {/* Auth routes */}
                  <Route
                    path="/login"
                    element={
                      <ProtectedRoute requireAuth={false}>
                        <LoginForm />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/forgot-password"
                    element={
                      <ProtectedRoute requireAuth={false}>
                        <ForgetPassword />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/register"
                    element={
                      <ProtectedRoute requireAuth={false}>
                        <SignUpForm />
                      </ProtectedRoute>
                    }
                  />

                  {/* Dashboard route */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute requireAuth={true}>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* Flash Number Game route */}
                  <Route
                    path="/flash-number-game"
                    element={
                      <ProtectedRoute requireAuth={true}>
                        <FlashNumberGame />
                      </ProtectedRoute>
                    }
                  />

                  {/* Dynamic Activity route */}
                  <Route
                    path="/activity/:activityId"
                    element={
                      <ProtectedRoute requireAuth={true}>
                        <DynamicActivity />
                      </ProtectedRoute>
                    }
                  />

                  {/* Assign Flash route */}
                  <Route
                    path="/assign"
                    element={
                      <ProtectedRoute requireAuth={true}>
                        <AssignFlash />
                      </ProtectedRoute>
                    }
                  />

                  {/* Notification Sent route */}
                  <Route
                    path="/notification-sent"
                    element={
                      <ProtectedRoute requireAuth={true}>
                        <NotificationSent />
                      </ProtectedRoute>
                    }
                  />

                  {/* Reports route */}
                  <Route
                    path="/reports"
                    element={
                      <ProtectedRoute requireAuth={true}>
                        <Reports />
                      </ProtectedRoute>
                    }
                  />

                  {/* Worksheets route */}
                  <Route
                    path="/worksheets"
                    element={
                      <ProtectedRoute requireAuth={true}>
                        <Worksheets />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/worksheets/assign"
                    element={
                      <ProtectedRoute requireAuth={true}>
                        <WorksheetAssign />
                      </ProtectedRoute>
                    }
                  />

                  {/* Profile route */}
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute requireAuth={true}>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />

                  {/* Notifications route */}
                  <Route
                    path="/notifications"
                    element={
                      <ProtectedRoute requireAuth={true}>
                        <Notifications />
                      </ProtectedRoute>
                    }
                  />

                  {/* 404 route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>

                {/* Toast notifications */}
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: '#363636',
                      color: '#fff',
                    },
                    success: {
                      duration: 3000,
                      iconTheme: {
                        primary: '#10b981',
                        secondary: '#fff',
                      },
                    },
                    error: {
                      duration: 5000,
                      iconTheme: {
                        primary: '#ef4444',
                        secondary: '#fff',
                      },
                    },
                  }}
                />
              </div>
            </Router>
          </AuthProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;

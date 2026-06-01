import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import LoginPage        from './pages/LoginPage';
import SignupPage       from './pages/SignupPage';
import HomePage         from './pages/HomePage';
import OnboardingPage   from './pages/OnboardingPage';

// Smart guard: authenticated but profile not completed → go to /onboarding
function HomeGuard() {
  const { user } = useAuth();
  if (user && !user.profile_completed) {
    return <Navigate to="/onboarding" replace />;
  }
  return (
    <PrivateRoute>
      <HomePage />
    </PrivateRoute>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login"  element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Profile setup (requires auth) */}
          <Route
            path="/onboarding"
            element={
              <PrivateRoute>
                <OnboardingPage />
              </PrivateRoute>
            }
          />

          {/* Protected dashboard */}
          <Route path="/home" element={<HomeGuard />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

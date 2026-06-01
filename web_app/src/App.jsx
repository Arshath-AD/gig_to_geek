import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import LoginPage        from './features/auth/LoginPage';
import SignupPage       from './features/auth/SignupPage';
import DashboardPage    from './features/dashboard/DashboardPage';
import OnboardingPage   from './features/onboarding/OnboardingPage';
import ProfilePage      from './features/profile/ProfilePage';
import TransactionsPage from './features/transactions/TransactionsPage';

// Smart guard: authenticated but profile not completed → go to /onboarding
function HomeGuard() {
  const { user } = useAuth();
  if (user && !user.profile_completed) {
    return <Navigate to="/onboarding" replace />;
  }
  return (
    <PrivateRoute>
      <DashboardPage />
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

          {/* Profile management */}
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            }
          />

          {/* Transactions */}
          <Route
            path="/transactions"
            element={
              <PrivateRoute>
                <TransactionsPage />
              </PrivateRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

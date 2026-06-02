import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import LoginPage        from './features/auth/LoginPage';
import SignupPage       from './features/auth/SignupPage';
import DashboardPage    from './features/dashboard/DashboardPage';
import OnboardingPage   from './features/onboarding/OnboardingPage';
import ProfilePage      from './features/profile/ProfilePage';
import TransactionsPage from './features/transactions/TransactionsPage';
import IncomePage       from './features/income/IncomePage';
import AdminDashboardPage from './features/admin/AdminDashboardPage';
import AdminProfilePage from './features/admin/AdminProfilePage';
import AiAdvisorPage from './features/chat/AiAdvisorPage';

// Smart guard: authenticated but profile not completed → go to /onboarding
function HomeGuard() {
  const { user } = useAuth();
  if (user?.is_superuser) {
    return <Navigate to="/admin" replace />;
  }
  if (user && !user.profile_completed) {
    return <Navigate to="/onboarding" replace />;
  }
  return (
    <PrivateRoute>
      <DashboardPage />
    </PrivateRoute>
  );
}

// Bounces admins away from standard user routes like Profile or Transactions
function UserGuard({ children }) {
  const { user } = useAuth();
  if (user?.is_superuser) {
    return <Navigate to="/admin" replace />;
  }
  return <PrivateRoute>{children}</PrivateRoute>;
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
              <UserGuard>
                <ProfilePage />
              </UserGuard>
            }
          />

          {/* Transactions */}
          <Route
            path="/transactions"
            element={
              <UserGuard>
                <TransactionsPage />
              </UserGuard>
            }
          />

          {/* Income */}
          <Route
            path="/income"
            element={
              <UserGuard>
                <IncomePage />
              </UserGuard>
            }
          />

          {/* AI Advisor (only rendered when has_ai_access=true, guard still protects from admins) */}
          <Route
            path="/ai-advisor"
            element={
              <UserGuard>
                <AiAdvisorPage />
              </UserGuard>
            }
          />

          {/* Admin Dashboard */}
          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <AdminDashboardPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/profile"
            element={
              <PrivateRoute>
                <AdminProfilePage />
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

import { lazy, Suspense } from 'react';
import { Routes, Route, Router } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
function ProtectedRoute({ children }: any) {
  const isAuthenticated = !!localStorage.getItem('token'); // Or use context

  return isAuthenticated ? children : <Navigate to="/login" />;
}
export function PublicRoute({ children }: any) {
  const isAuthenticated = !!localStorage.getItem('token'); // Or use context

  return !isAuthenticated ? children : <Navigate to="/" />;
}
const LoginPage = lazy(() => import('../features/auth/pages/LoginPage').then(module => ({ default: module.LoginPage })));
const SignupPage = lazy(() => import('../features/auth/pages/SignupPage').then(module => ({ default: module.SignupPage })));
const Homepage = lazy(() => import('../features/Home/pages').then(module => ({ default: module.Homepage })));
const BookingPage = lazy(() => import('../features/bookings/pages').then(module => ({ default: module.BookingPage })));
export default function AppRouter() {
  return (
    <>
      <Suspense fallback={<div>Loading ....</div>} />
      <Routes>
        <Route path="/" element={
          <PublicRoute><Homepage /></PublicRoute>

        } />
        <Route path="/signup" element={
          <PublicRoute><SignupPage /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/bookings" element={
          <PublicRoute><BookingPage /></PublicRoute>} />
        {/* Add more routes here as needed */}

      </Routes>
    </>
  );
}
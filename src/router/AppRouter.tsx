import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import {useAuth} from '../hooks/useAuth.tsx';
function ProtectedRoute({ children }: any) {
   const { session } = useAuth()
  const isAuthenticated = !!session; // Or use context
  return isAuthenticated ? children : <Navigate to="/login" />;
}
export function PublicRoute({ children }: any) {
   const {  loading } = useAuth()
 if (loading) return <div>Loading...</div>

  

  // 3️⃣ Otherwise, render the public page
  return children
}
const LoginPage = lazy(() => import('../features/auth/pages/LoginPage').then(module => ({ default: module.LoginPage })));
const SignupPage = lazy(() => import('../features/auth/pages/SignupPage').then(module => ({ default: module.SignupPage })));
const Homepage = lazy(() => import('../features/Home/pages').then(module => ({ default: module.Homepage })));
const BookingPage = lazy(() => import('../features/bookings/pages').then(module => ({ default: module.BookingPage })));
const PaymentConfirmation = lazy(() => import('../features/bookings/pages/PaymentConfirmation').then(module => ({ default: module.PaymentConfirmation })));
const Checkout = lazy(() => import('../features/bookings/pages/Checkout').then(module => ({ default: module.Checkout })));
const ForgotPasswordPage = lazy(() => import('../features/auth/pages/ForgotPassword').then(module => ({ default: module.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('../features/auth/pages/ResetPassword').then(module => ({ default: module.ResetPasswordPage })));
export default function AppRouter() {
  return (
    <>
      <Suspense fallback={<div>Loading ....</div>} >
      <Routes>
        <Route path="/" element={
          <PublicRoute><Homepage /></PublicRoute>

        } />
        <Route path="/signup" element={
          <PublicRoute><SignupPage /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
        <Route path="/reset-password" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />
        <Route path="/bookings/:id" element={
          <PublicRoute><BookingPage /></PublicRoute>} />
        <Route path="/payment-confirmation" element={
          <ProtectedRoute><PaymentConfirmation /></ProtectedRoute>} />
        <Route path="/checkout" element={
          <ProtectedRoute><Checkout /></ProtectedRoute>} />
        {/* Add more routes here as needed */}

        <Route path="*" element={<Navigate to="/" />} />
        {/* Add more routes here as needed */}

      </Routes>
      </Suspense>
     
    </>
  );
}
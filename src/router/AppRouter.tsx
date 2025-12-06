import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { useAuth } from "../hooks/useAuth";

type ProtectedRouteProps = {
  children: React.ReactElement;
};
function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { session, loading } = useAuth();
  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "50vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }
  const isAuthenticated = !!session;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}
export function PublicRoute({ children }: any) {
  const { loading } = useAuth();

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 2,
          backgroundColor: "#f5f5f5",
        }}
      >
        <CircularProgress />
        <Box sx={{ textAlign: "center" }}>
          <h3 style={{ margin: 0, color: "#666" }}>Loading TravelGuru...</h3>
          <p style={{ margin: "8px 0 0 0", color: "#888" }}>Please wait</p>
        </Box>
      </Box>
    );
  }

  // Otherwise, render the public page
  return children;
}
const LoginPage = lazy(() =>
  import("../features/auth/pages/LoginPage").then((module) => ({
    default: module.LoginPage,
  }))
);
const SignupPage = lazy(() =>
  import("../features/auth/pages/SignupPage").then((module) => ({
    default: module.SignupPage,
  }))
);
const PasswordResetPage = lazy(() =>
  import("../features/auth/pages/PasswordResetPage").then((module) => ({
    default: module.PasswordResetPage,
  }))
);
const UpdatePasswordPage = lazy(() =>
  import("../features/auth/pages/UpdatePasswordPage").then((module) => ({
    default: module.UpdatePasswordPage,
  }))
);
const Homepage = lazy(() =>
  import("../features/Home/pages").then((module) => ({
    default: module.Homepage,
  }))
);
const BookingPage = lazy(() =>
  import("../features/bookings/pages").then((module) => ({
    default: module.BookingPage,
  }))
);
const PaymentConfirmation = lazy(() =>
  import("../features/bookings/pages/PaymentConfirmation").then((module) => ({
    default: module.PaymentConfirmation,
  }))
);
const Checkout = lazy(() =>
  import("../features/bookings/pages/Checkout").then((module) => ({
    default: module.Checkout,
  }))
);
const ProfilePage = lazy(() =>
  import("../features/account/pages").then((module) => ({
    default: module.ProfilePage,
  }))
);
const FAQPage = lazy(() =>
  import("../features/FAQ").then((module) => ({
    default: module.FAQPage,
  }))
);
export default function AppRouter() {
  return (
    <>
      <Suspense fallback={<div>Loading ....</div>}>
        <Routes>
          <Route
            path="/"
            element={
              <PublicRoute>
                <Homepage />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <SignupPage />
              </PublicRoute>
            }
          />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/password-reset"
            element={
              <PublicRoute>
                <PasswordResetPage />
              </PublicRoute>
            }
          />
          <Route
            path="/reset-password"
            element={
              <PublicRoute>
                <UpdatePasswordPage />
              </PublicRoute>
            }
          />
          <Route
            path="/bookings/:id"
            element={
              <PublicRoute>
                <BookingPage />
              </PublicRoute>
            }
          />
          <Route
            path="/payment-confirmation"
            element={
              <ProtectedRoute>
                <PaymentConfirmation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faq"
            element={
              <PublicRoute>
                <FAQPage />
              </PublicRoute>
            }
          />
          {/* Add more routes here as needed */}

          <Route path="*" element={<Navigate to="/" />} />
          {/* Add more routes here as needed */}
        </Routes>
      </Suspense>
    </>
  );
}

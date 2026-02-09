import * as React from "react";
import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { useAuth } from "../hooks/useAuth.tsx";
import { Elements } from "@stripe/react-stripe-js";
import { stripePromise } from "../features/stripe/stripe.ts";

type ProtectedRouteProps = {
  children: React.ReactNode;
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
type PublicRouteProps = {
  children: React.ReactElement;
};
export function PublicRoute({ children }: PublicRouteProps) {
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

  return children;
}
const LoginPage = lazy(() =>
  import("../features/auth/pages/LoginPage/index.tsx").then((module) => ({
    default: module.LoginPage,
  })),
);
const SignupPage = lazy(() =>
  import("../features/auth/pages/SignupPage/index.tsx").then((module) => ({
    default: module.SignupPage,
  })),
);
const PasswordResetPage = lazy(() =>
  import("../features/auth/pages/PasswordResetPage/index.tsx").then(
    (module) => ({
      default: module.PasswordResetPage,
    }),
  ),
);
const UpdatePasswordPage = lazy(() =>
  import("../features/auth/pages/UpdatePasswordPage/index.tsx").then(
    (module) => ({
      default: module.UpdatePasswordPage,
    }),
  ),
);
const Homepage = lazy(() =>
  import("../features/Home/pages/index.tsx").then((module) => ({
    default: module.Homepage,
  })),
);
const BookingPage = lazy(() =>
  import("../features/bookings/pages/index.tsx").then((module) => ({
    default: module.BookingPage,
  })),
);
const Checkout = lazy(() =>
  import("../features/bookings/pages/Checkout/index.tsx").then((module) => ({
    default: module.Checkout,
  })),
);
const ProfilePage = lazy(() =>
  import("../features/account/pages/index.tsx").then((module) => ({
    default: module.ProfilePage,
  })),
);
const FAQPage = lazy(() =>
  import("../features/FAQ/pages/index.tsx").then((module) => ({
    // FAQ page exports a default component, not a named export
    default: module.default,
  })),
);
const AboutPage = lazy(() =>
  import("../features/About/pages/index.tsx").then((module) => ({
    default: module.default,
  })),
);
const ContactPage = lazy(() =>
  import("../features/Contact/pages/index.ts").then((module) => ({
    // Contact pages barrel exports default
    default: module.default,
  })),
);
const SearchPage = lazy(() =>
  import("../features/Search/pages/index.tsx").then((module) => ({
    default: module.SearchPage,
  })),
);
const ServicesPage = lazy(() =>
  import("../features/Services/pages/index.tsx").then((module) => ({
    default: module.ServicesPage,
  })),
);
const UserBookingsPage = lazy(() =>
  import("../features/bookings/pages/UserBookings/index.tsx").then(
    (module) => ({
      default: module.UserBookingsPage,
    }),
  ),
);
const CartPage = lazy(() =>
  import("../features/bookings/pages/Cart/index.tsx").then((module) => ({
    default: module.CartPage,
  })),
);
const TermsPage = lazy(() =>
  import("../features/legal/pages/TermsPage.tsx").then((module) => ({
    default: module.default,
  })),
);
const PrivacyPage = lazy(() =>
  import("../features/legal/pages/PrivacyPage.tsx").then((module) => ({
    default: module.default,
  })),
);
const CancellationPage = lazy(() =>
  import("../features/legal/pages/CancellationPage.tsx").then((module) => ({
    default: module.default,
  })),
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
            path="/checkout"
            element={
              <ProtectedRoute>
                <Elements stripe={stripePromise}>
                  <Checkout />
                </Elements>
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
          <Route
            path="/about"
            element={
              <PublicRoute>
                <AboutPage />
              </PublicRoute>
            }
          />
          <Route
            path="/contact"
            element={
              <PublicRoute>
                <ContactPage />
              </PublicRoute>
            }
          />
          <Route
            path="/search"
            element={
              <PublicRoute>
                <SearchPage />
              </PublicRoute>
            }
          />
          <Route
            path="/services"
            element={
              <PublicRoute>
                <ServicesPage />
              </PublicRoute>
            }
          />
          <Route
            path="/bookings"
            element={
              <ProtectedRoute>
                <UserBookingsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <CartPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/terms"
            element={
              <PublicRoute>
                <TermsPage />
              </PublicRoute>
            }
          />
          <Route
            path="/privacy"
            element={
              <PublicRoute>
                <PrivacyPage />
              </PublicRoute>
            }
          />
          <Route
            path="/cancellation-policy"
            element={
              <PublicRoute>
                <CancellationPage />
              </PublicRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>
    </>
  );
}

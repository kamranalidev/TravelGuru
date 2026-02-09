import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ConfigProvider, theme } from "antd";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./components/Layout/AdminLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Bookings from "./pages/Bookings";
import Services from "./pages/Services";
import Packages from "./pages/Packages";
import Users from "./pages/Users";
import Carts from "./pages/Carts";
import Reviews from "./pages/Reviews";
import Settings from "./pages/Settings";
import VoucherVerification from "./pages/VoucherVerification";
import "./App.css";

function App() {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: "#6366f1",
          borderRadius: 8,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial',
        },
        components: {
          Layout: {
            siderBg: "#ffffff",
          },
          Menu: {
            itemBg: "transparent",
            itemSelectedBg: "#f0f0ff",
            itemSelectedColor: "#6366f1",
          },
        },
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="services" element={<Services />} />
            <Route path="packages" element={<Packages />} />
            <Route path="users" element={<Users />} />
            <Route path="carts" element={<Carts />} />
            <Route path="reviews" element={<Reviews />} />
            <Route path="settings" element={<Settings />} />
            <Route
              path="voucher-verification"
              element={<VoucherVerification />}
            />
          </Route>
          <Route path="/" element={<Navigate to="/admin" replace />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;

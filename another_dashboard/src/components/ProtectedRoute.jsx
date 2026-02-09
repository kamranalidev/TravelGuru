import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { Spin, Result, Button } from "antd";

const ProtectedRoute = ({ children }) => {
  const { user, loading, initialized, error } = useAuthStore();

  // Show loading only while initializing, with a max timeout already handled in store
  if (!initialized || loading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <Spin size="large" />
        <span style={{ color: "#666" }}>Loading...</span>
      </div>
    );
  }

  // Show error state if auth failed
  if (error && !user) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Result
          status="error"
          title="Authentication Error"
          subTitle={error}
          extra={[
            <Button
              type="primary"
              key="retry"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>,
            <Button
              key="login"
              onClick={() => (window.location.href = "/login")}
            >
              Go to Login
            </Button>,
          ]}
        />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;

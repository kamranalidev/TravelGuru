import { useState, useEffect } from "react";
import { Form, Input, Button, Card, message, Typography, Spin } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import travelGuruLogo from "../assets/Travel-Guru-Logo-Final.png";

const { Title, Text } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const {
    signIn,
    user,
    initialized,
    clearError,
  } = useAuthStore();

  // Redirect if already logged in
  useEffect(() => {
    if (initialized && user) {
      navigate("/admin");
    }
  }, [user, initialized, navigate]);

  // Clear any previous auth errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const { error } = await signIn(values.email, values.password);
      if (error) throw error;
      message.success("Login successful!");
      navigate("/admin");
    } catch (error) {
      message.error(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // Show loading only during initial auth check, not forever
  if (!initialized) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: 24,
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: 400,
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          borderRadius: 16,
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <img
            src={travelGuruLogo}
            alt="Travel Guru"
            style={{ height: 80, marginBottom: 16, objectFit: "contain" }}
          />
          <Title level={2} style={{ marginBottom: 8 }}>
            Admin Dashboard
          </Title>
          <Text type="secondary">Sign in to continue</Text>
        </div>
        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Please input your email!" },
              { type: "email", message: "Please enter a valid email!" },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Email" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Sign In
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;

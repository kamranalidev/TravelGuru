import { useState } from "react";
import { Layout, Menu, Avatar, Dropdown, Button, theme } from "antd";
import {
  DashboardOutlined,
  ShoppingCartOutlined,
  CalendarOutlined,
  UserOutlined,
  AppstoreOutlined,
  StarOutlined,
  GiftOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  SettingOutlined,
  QrcodeOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import travelGuruLogo from "../../assets/Travel-Guru-Logo-Final.png";

const { Header, Sider, Content } = Layout;

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { userProfile, signOut } = useAuthStore();
  const { token } = theme.useToken();

  const menuItems = [
    {
      key: "/admin",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "/admin/bookings",
      icon: <CalendarOutlined />,
      label: "Bookings",
    },
    {
      key: "/admin/voucher-verification",
      icon: <QrcodeOutlined />,
      label: "Verify Voucher",
    },
    {
      key: "/admin/services",
      icon: <AppstoreOutlined />,
      label: "Services",
    },
    {
      key: "/admin/packages",
      icon: <GiftOutlined />,
      label: "Packages",
    },
    {
      key: "/admin/users",
      icon: <UserOutlined />,
      label: "Users",
    },
    {
      key: "/admin/carts",
      icon: <ShoppingCartOutlined />,
      label: "Carts",
    },
    {
      key: "/admin/reviews",
      icon: <StarOutlined />,
      label: "Reviews",
    },
    {
      type: "divider",
    },
    {
      key: "/admin/settings",
      icon: <SettingOutlined />,
      label: "Settings",
    },
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profile",
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Settings",
      onClick: () => navigate("/admin/settings"),
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      onClick: handleSignOut,
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={240}
        collapsedWidth={80}
        style={{
          overflow: "auto",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          background: token.colorBgContainer,
          borderRight: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 16px",
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          {collapsed ? (
            <img
              src={travelGuruLogo}
              alt="TG"
              style={{ height: 40, width: 40, objectFit: "contain" }}
            />
          ) : (
            <img
              src={travelGuruLogo}
              alt="Travel Guru"
              style={{ height: 50, width: "100%", objectFit: "contain" }}
            />
          )}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ borderRight: 0 }}
        />
      </Sider>
      <Layout
        style={{
          marginLeft: collapsed ? 80 : 240,
          transition: "margin-left 0.2s",
        }}
      >
        <Header
          style={{
            padding: "0 24px",
            background: token.colorBgContainer,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
            position: "sticky",
            top: 0,
            zIndex: 100,
            width: "100%",
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: "16px", width: 64, height: 64 }}
          />
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div
              style={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Avatar
                src={userProfile?.profile_picture}
                icon={<UserOutlined />}
                style={{ backgroundColor: token.colorPrimary }}
              />
              <span>{userProfile?.full_name || "Admin"}</span>
            </div>
          </Dropdown>
        </Header>
        <Content
          style={{
            padding: "24px",
            minHeight: 280,
            maxWidth: "1600px",
            margin: "0 auto",
            width: "100%",
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;

import { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Statistic,
  Table,
  Tag,
  Typography,
  Spin,
  DatePicker,
} from "antd";
import {
  CalendarOutlined,
  DollarOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import dayjs from "dayjs";
import { supabase } from "../lib/supabase";

const { Title } = Typography;
const { RangePicker } = DatePicker;

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    totalUsers: 0,
    activeCarts: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [bookingsByService, setBookingsByService] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [paymentStatusData, setPaymentStatusData] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch total bookings
      const { count: bookingsCount } = await supabase
        .from("bookings")
        .select("*", { count: "exact", head: true });

      // Fetch total revenue
      const { data: revenueResult } = await supabase
        .from("bookings")
        .select("amount")
        .eq("payment_status", "succeeded");

      const totalRevenue =
        revenueResult?.reduce((sum, b) => sum + (b.amount || 0), 0) || 0;

      // Fetch total users
      const { count: usersCount } = await supabase
        .from("user_profiles")
        .select("*", { count: "exact", head: true });

      // Fetch active carts
      const { count: cartsCount } = await supabase
        .from("carts")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      setStats({
        totalBookings: bookingsCount || 0,
        totalRevenue: totalRevenue / 100, // Convert from cents
        totalUsers: usersCount || 0,
        activeCarts: cartsCount || 0,
      });

      // Fetch recent bookings
      const { data: bookings } = await supabase
        .from("bookings")
        .select(
          `
          *,
          services:service_id(service_name),
          user_profiles:user_id(full_name, email)
        `,
        )
        .order("created_at", { ascending: false })
        .limit(5);

      // Rename `children` → `children_count` to avoid conflict with antd Table's
      // reserved `children` prop (used for tree/expandable rows).
      setRecentBookings(
        (bookings || []).map(({ children, ...rest }) => ({
          ...rest,
          children_count: children ?? 0,
        })),
      );

      // Fetch bookings by service for pie chart
      const { data: serviceBookings } = await supabase.from("bookings").select(`
          service_id,
          services:service_id(service_name)
        `);

      const serviceCount = {};
      serviceBookings?.forEach((b) => {
        const name = b.services?.service_name || "Unknown";
        serviceCount[name] = (serviceCount[name] || 0) + 1;
      });

      setBookingsByService(
        Object.entries(serviceCount).map(([name, value]) => ({ name, value })),
      );

      // Fetch payment status distribution
      const { data: paymentData } = await supabase
        .from("bookings")
        .select("payment_status");

      const statusCount = {};
      paymentData?.forEach((b) => {
        const status = b.payment_status || "pending";
        statusCount[status] = (statusCount[status] || 0) + 1;
      });

      setPaymentStatusData(
        Object.entries(statusCount).map(([name, value]) => ({ name, value })),
      );

      // Generate revenue data for the last 7 days
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = dayjs().subtract(i, "day").format("YYYY-MM-DD");
        last7Days.push({ date, revenue: 0, bookings: 0 });
      }

      const { data: weeklyBookings } = await supabase
        .from("bookings")
        .select("created_at, amount")
        .gte("created_at", dayjs().subtract(7, "day").toISOString())
        .eq("payment_status", "succeeded");

      weeklyBookings?.forEach((booking) => {
        const date = dayjs(booking.created_at).format("YYYY-MM-DD");
        const dayData = last7Days.find((d) => d.date === date);
        if (dayData) {
          dayData.revenue += (booking.amount || 0) / 100;
          dayData.bookings += 1;
        }
      });

      setRevenueData(last7Days);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const bookingColumns = [
    {
      title: "Customer",
      dataIndex: ["user_profiles", "full_name"],
      key: "customer",
      render: (text) => text || "Guest",
    },
    {
      title: "Service",
      dataIndex: ["services", "service_name"],
      key: "service",
    },
    {
      title: "Date",
      dataIndex: "booking_date",
      key: "date",
      render: (date) => dayjs(date).format("MMM DD, YYYY"),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount, record) =>
        `${(amount / 100).toFixed(2)} ${record.currency?.toUpperCase() || "AED"}`,
    },
    {
      title: "Guests",
      key: "guests",
      render: (_, record) => {
        const adults = record.adults || 0;
        const children = record.children_count || 0;
        const infants = record.infants || 0;
        const total = adults + children + infants;
        if (total === 0) return "-";
        const parts = [];
        if (adults > 0) parts.push(`${adults}A`);
        if (children > 0) parts.push(`${children}C`);
        if (infants > 0) parts.push(`${infants}I`);
        return parts.join(" · ");
      },
    },
    {
      title: "Status",
      dataIndex: "payment_status",
      key: "status",
      render: (status) => {
        const colors = {
          succeeded: "green",
          pending: "orange",
          failed: "red",
        };
        return (
          <Tag color={colors[status] || "default"}>{status || "pending"}</Tag>
        );
      },
    },
  ];

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "60vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ width: "100%" }}>
      <div
        style={{
          marginBottom: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <Title level={2} style={{ margin: 0 }}>
          Dashboard
        </Title>
        <RangePicker />
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Bookings"
              value={stats.totalBookings}
              prefix={<CalendarOutlined style={{ color: "#1890ff" }} />}
              styles={{ content: { color: "#1890ff" } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Revenue"
              value={stats.totalRevenue}
              precision={2}
              prefix={<DollarOutlined style={{ color: "#52c41a" }} />}
              suffix="AED"
              styles={{ content: { color: "#52c41a" } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={stats.totalUsers}
              prefix={<UserOutlined style={{ color: "#722ed1" }} />}
              styles={{ content: { color: "#722ed1" } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Carts"
              value={stats.activeCarts}
              prefix={<ShoppingCartOutlined style={{ color: "#fa8c16" }} />}
              styles={{ content: { color: "#fa8c16" } }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={16}>
          <Card
            title="Revenue & Bookings (Last 7 Days)"
            style={{ height: "100%" }}
          >
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => dayjs(date).format("MMM DD")}
                />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.3}
                  name="Revenue (AED)"
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="bookings"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                  fillOpacity={0.3}
                  name="Bookings"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Bookings by Service" style={{ height: "100%" }}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={bookingsByService}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} (${(percent * 100).toFixed(0)}%)`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {bookingsByService.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card title="Payment Status Distribution" style={{ height: "100%" }}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={paymentStatusData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8">
                  {paymentStatusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.name === "succeeded"
                          ? "#52c41a"
                          : entry.name === "pending"
                            ? "#faad14"
                            : "#f5222d"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={16}>
          <Card title="Recent Bookings" style={{ height: "100%" }}>
            <Table
              columns={bookingColumns}
              dataSource={recentBookings}
              rowKey="id"
              pagination={false}
              size="small"
              scroll={{ x: 800 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;

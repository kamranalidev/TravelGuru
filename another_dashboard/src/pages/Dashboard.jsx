import { summarizeCountryBookings } from "../utils/countryReports";
import { useCountry } from "../context/CountryContext";
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
  Select,
  Alert,
  Space,
  Empty,
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

const COLORS = ["#d74712", "#557d70", "#8f9f98", "#bd8865", "#596f83"];

const Dashboard = () => {
  const { countryCode, error: countryError } = useCountry();
  const [range, setRange] = useState(null);
  const [tripType, setTripType] = useState("all");
  const [currency, setCurrency] = useState("AED");
  const [currencies, setCurrencies] = useState(["AED"]);
  const [error, setError] = useState("");
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
    let active = true;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        // Page through results so analytics are not truncated by Supabase's row limit.
        const bookings = [];
        for (let offset = 0; ; offset += 1000) {
          let query = supabase.from("bookings").select(`*,
            services:service_id${countryCode ? "!inner" : ""}(service_name, country_code),
            user_profiles:user_id(full_name, email)`)
            .order("created_at", { ascending: false }).order("id", { ascending: false });
          if (countryCode) query = query.eq("services.country_code", countryCode);
          if (tripType === "multi") query = query.gt("duration_days", 1);
          if (tripType === "single") query = query.eq("duration_days", 1);
          if (range?.[0] && range?.[1]) query = query.gte("created_at", range[0].startOf("day").toISOString()).lte("created_at", range[1].endOf("day").toISOString());
          const { data, error } = await query.range(offset, offset + 999);
          if (!active) return;
          if (error) throw error;
          bookings.push(...(data || []));
          if (!data || data.length < 1000) break;
        }
        const [users, carts] = await Promise.all([
          supabase.from("user_profiles").select("*", { count: "exact", head: true }),
          supabase.from("carts").select("*", { count: "exact", head: true }).eq("status", "active"),
        ]);
        if (users.error) throw users.error;
        if (carts.error) throw carts.error;
        if (!active) return;
        const report = summarizeCountryBookings(bookings, currency, range?.[1] || dayjs());
        setCurrencies([...new Set(["AED", currency, ...bookings.map(b => (b.currency || "AED").toUpperCase())])].sort());
        setStats({ totalBookings: bookings.length, totalRevenue: report.totalRevenue,
          totalUsers: users.count || 0, activeCarts: carts.count || 0 });
        setRecentBookings(bookings.slice(0, 5));
        setBookingsByService(report.bookingsByService);
        setPaymentStatusData(report.paymentStatuses);
        setRevenueData(report.days);
      } catch (e) {
        if (active) {
          setError(`Unable to load dashboard: ${e.message}`);
          setStats({ totalBookings: 0, totalRevenue: 0, totalUsers: 0, activeCarts: 0 });
          setRecentBookings([]); setBookingsByService([]); setPaymentStatusData([]); setRevenueData([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => { active = false; };
  }, [countryCode, range, currency, tripType]);

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
      render: (date, record) => record.booking_end_date && record.booking_end_date !== date
        ? `${dayjs(date).format("MMM DD")} – ${dayjs(record.booking_end_date).format("MMM DD, YYYY")} (${record.duration_days} days)`
        : dayjs(date).format("MMM DD, YYYY"),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount, record) =>
        `${(amount / 100).toFixed(2)} ${record.currency?.toUpperCase() || "AED"}`,
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
          Overview
        </Title>
        <Space wrap><Select aria-label="Trip type" value={tripType} onChange={setTripType} options={[{ value: "all", label: "All trip lengths" }, { value: "single", label: "Single day" }, { value: "multi", label: "Multi-day trips" }]} /><Select aria-label="Revenue currency" value={currency} onChange={setCurrency} options={currencies.map(value => ({ value, label: value }))} /><RangePicker value={range} onChange={setRange} /></Space>
      </div>

      {(error || countryError) && <Alert type="error" showIcon message={error || countryError} style={{ marginBottom: 16 }} />}
      <Typography.Paragraph type="secondary" style={{ marginBottom: 24 }}>Bookings count trips. Revenue includes successful payments in {currency}. Date filters use booking creation dates.</Typography.Paragraph>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Bookings"
              value={stats.totalBookings}
              prefix={<CalendarOutlined style={{ color: "#53645f" }} />}
              valueStyle={{ color: "#53645f" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Revenue"
              value={stats.totalRevenue}
              precision={2}
              prefix={<DollarOutlined style={{ color: "#337462" }} />}
              suffix={currency}
              valueStyle={{ color: "#337462" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Users (All Countries)"
              value={stats.totalUsers}
              prefix={<UserOutlined style={{ color: "#53645f" }} />}
              valueStyle={{ color: "#53645f" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Carts (All Countries)"
              value={stats.activeCarts}
              prefix={<ShoppingCartOutlined style={{ color: "#c44516" }} />}
              valueStyle={{ color: "#c44516" }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={16}>
          <Card
            title="Revenue & bookings · last 7 days"
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
                  stroke="#d74712"
                  fill="#d74712"
                  fillOpacity={0.3}
                  name={`Revenue (${currency})`}
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="bookings"
                  stroke="#557d70"
                  fill="#557d70"
                  fillOpacity={0.3}
                  name="Bookings"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Bookings by Service" style={{ height: "100%" }}>
            {bookingsByService.length ? (
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
                  fill="#d74712"
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
            ) : <div style={{ height: 300, display: "grid", placeItems: "center" }}><Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No bookings in this view" /></div>}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card title="Payment Status Distribution" style={{ height: "100%" }}>
            {paymentStatusData.length ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={paymentStatusData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} />
                <Tooltip />
                <Bar dataKey="value" fill="#d74712">
                  {paymentStatusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.name === "succeeded"
                          ? "#337462"
                          : entry.name === "pending"
                            ? "#faad14"
                            : "#f5222d"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            ) : <div style={{ height: 300, display: "grid", placeItems: "center" }}><Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No bookings in this view" /></div>}
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

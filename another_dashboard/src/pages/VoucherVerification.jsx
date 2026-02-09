import { useState, useEffect, useCallback } from "react";
import {
  Card,
  Input,
  Button,
  Space,
  Typography,
  Descriptions,
  Tag,
  Alert,
  Spin,
  Result,
  Modal,
  message,
  Divider,
  Badge,
  Statistic,
  Row,
  Col,
} from "antd";
import {
  SearchOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  QrcodeOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
  CalendarOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { supabase } from "../lib/supabase";

const { Title, Text, Paragraph } = Typography;

const VoucherVerification = () => {
  const [voucherCode, setVoucherCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [stats, setStats] = useState({
    totalActive: 0,
    totalUsed: 0,
    totalExpired: 0,
  });

  // Fetch voucher statistics
  const fetchStats = useCallback(async () => {
    try {
      const { count: activeCount } = await supabase
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .eq("voucher_status", "active");

      const { count: usedCount } = await supabase
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .eq("voucher_status", "used");

      const { count: expiredCount } = await supabase
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .eq("voucher_status", "expired");

      setStats({
        totalActive: activeCount || 0,
        totalUsed: usedCount || 0,
        totalExpired: expiredCount || 0,
      });
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Check if voucher is expired based on booking date
  const isVoucherExpired = (bookingDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const bDate = new Date(bookingDate);
    bDate.setHours(0, 0, 0, 0);
    return bDate < today;
  };

  // Search for voucher
  const handleSearch = async () => {
    if (!voucherCode.trim()) {
      message.warning("Please enter a voucher code");
      return;
    }

    setLoading(true);
    setError(null);
    setBooking(null);

    try {
      const { data, error: searchError } = await supabase
        .from("bookings")
        .select(
          `
          *,
          services:service_id(id, service_name, location),
          packages:package_id(id, name, duration),
          user_profiles:user_id(user_id, full_name, email, phone_number)
        `,
        )
        .eq("voucher_code", voucherCode.trim().toUpperCase())
        .maybeSingle();

      if (searchError) throw searchError;

      if (!data) {
        setError("Voucher not found. Please check the code and try again.");
        return;
      }

      // Auto-update expired vouchers
      if (
        data.voucher_status === "active" &&
        isVoucherExpired(data.booking_date)
      ) {
        await supabase
          .from("bookings")
          .update({ voucher_status: "expired" })
          .eq("id", data.id);
        data.voucher_status = "expired";
      }

      setBooking(data);
    } catch (err) {
      console.error("Search error:", err);
      setError("Failed to search voucher. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Verify (redeem) voucher
  const handleVerify = async () => {
    if (!booking) return;

    // Check if already used
    if (booking.voucher_status === "used") {
      message.error("This voucher has already been used!");
      return;
    }

    // Check if expired
    if (
      booking.voucher_status === "expired" ||
      isVoucherExpired(booking.booking_date)
    ) {
      message.error("This voucher has expired!");
      return;
    }

    // Check if cancelled
    if (booking.voucher_status === "cancelled") {
      message.error("This voucher has been cancelled!");
      return;
    }

    Modal.confirm({
      title: "Verify Voucher",
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>
            Are you sure you want to verify this voucher? This action marks the
            voucher as <strong>USED</strong> and cannot be undone.
          </p>
          <Divider />
          <p>
            <strong>Service:</strong> {booking.services?.service_name}
          </p>
          <p>
            <strong>Customer:</strong>{" "}
            {booking.user_profiles?.full_name || "Guest"}
          </p>
          <p>
            <strong>Booking Date:</strong>{" "}
            {dayjs(booking.booking_date).format("MMMM DD, YYYY")}
          </p>
        </div>
      ),
      okText: "Verify & Redeem",
      okType: "primary",
      cancelText: "Cancel",
      onOk: async () => {
        setVerifying(true);
        try {
          // Get current admin user
          const {
            data: { user },
          } = await supabase.auth.getUser();

          const { error: updateError } = await supabase
            .from("bookings")
            .update({
              voucher_status: "used",
              voucher_verified_at: new Date().toISOString(),
              voucher_verified_by: user?.id || null,
              redemption_status: "redeemed",
              redeemed_at: new Date().toISOString(),
            })
            .eq("id", booking.id)
            .eq("voucher_status", "active"); // Only update if still active

          if (updateError) throw updateError;

          // Update local state
          setBooking({
            ...booking,
            voucher_status: "used",
            voucher_verified_at: new Date().toISOString(),
            redemption_status: "redeemed",
            redeemed_at: new Date().toISOString(),
          });

          message.success(
            "Voucher verified successfully! Customer can proceed.",
          );
          fetchStats();
        } catch (err) {
          console.error("Verification error:", err);
          message.error("Failed to verify voucher. Please try again.");
        } finally {
          setVerifying(false);
        }
      },
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "green";
      case "used":
        return "blue";
      case "expired":
        return "orange";
      case "cancelled":
        return "red";
      default:
        return "default";
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return <CheckCircleOutlined />;
      case "used":
        return <SafetyCertificateOutlined />;
      case "expired":
        return <ExclamationCircleOutlined />;
      case "cancelled":
        return <CloseCircleOutlined />;
      default:
        return null;
    }
  };

  // Reset search
  const handleReset = () => {
    setVoucherCode("");
    setBooking(null);
    setError(null);
  };

  return (
    <div style={{ padding: "0" }}>
      <div
        style={{
          marginBottom: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <Title level={2} style={{ margin: 0 }}>
            <QrcodeOutlined style={{ marginRight: 12 }} />
            Voucher Verification
          </Title>
          <Text type="secondary">
            Verify customer vouchers for service redemption
          </Text>
        </div>
      </div>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Active Vouchers"
              value={stats.totalActive}
              valueStyle={{ color: "#52c41a" }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Used Vouchers"
              value={stats.totalUsed}
              valueStyle={{ color: "#1890ff" }}
              prefix={<SafetyCertificateOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Expired Vouchers"
              value={stats.totalExpired}
              valueStyle={{ color: "#faad14" }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Search Section */}
      <Card style={{ marginBottom: 24 }}>
        <Space direction="vertical" style={{ width: "100%" }} size="large">
          <div>
            <Text strong style={{ fontSize: 16 }}>
              Enter Voucher Code
            </Text>
            <Paragraph type="secondary" style={{ marginBottom: 12 }}>
              Enter the customer's voucher code to verify and redeem their
              booking
            </Paragraph>
          </div>

          <Space.Compact style={{ width: "100%", maxWidth: 500 }}>
            <Input
              size="large"
              placeholder="e.g., TG-ABCD1234"
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
              onPressEnter={handleSearch}
              prefix={<QrcodeOutlined style={{ color: "#bfbfbf" }} />}
              style={{
                fontFamily: "monospace",
                fontSize: 18,
                letterSpacing: 2,
              }}
            />
            <Button
              type="primary"
              size="large"
              icon={<SearchOutlined />}
              loading={loading}
              onClick={handleSearch}
            >
              Search
            </Button>
            {(booking || error) && (
              <Button
                size="large"
                icon={<ReloadOutlined />}
                onClick={handleReset}
              >
                Reset
              </Button>
            )}
          </Space.Compact>
        </Space>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert
          message="Voucher Not Found"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      {/* Loading */}
      {loading && (
        <Card style={{ textAlign: "center", padding: 40 }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>
            <Text type="secondary">Searching for voucher...</Text>
          </div>
        </Card>
      )}

      {/* Voucher Details */}
      {booking && !loading && (
        <Card
          title={
            <Space>
              <span>Voucher Details</span>
              <Tag
                icon={getStatusIcon(booking.voucher_status)}
                color={getStatusColor(booking.voucher_status)}
                style={{ fontSize: 14, padding: "4px 12px" }}
              >
                {booking.voucher_status?.toUpperCase()}
              </Tag>
            </Space>
          }
          extra={
            booking.voucher_status === "active" && (
              <Button
                type="primary"
                size="large"
                icon={<CheckCircleOutlined />}
                loading={verifying}
                onClick={handleVerify}
                style={{
                  background: "#52c41a",
                  borderColor: "#52c41a",
                }}
              >
                Verify & Redeem
              </Button>
            )
          }
        >
          {/* Status Alerts */}
          {booking.voucher_status === "used" && (
            <Alert
              message="Voucher Already Used"
              description={
                <span>
                  This voucher was verified on{" "}
                  <strong>
                    {dayjs(booking.voucher_verified_at).format(
                      "MMMM DD, YYYY [at] HH:mm",
                    )}
                  </strong>
                </span>
              }
              type="info"
              showIcon
              icon={<SafetyCertificateOutlined />}
              style={{ marginBottom: 24 }}
            />
          )}

          {booking.voucher_status === "expired" && (
            <Alert
              message="Voucher Expired"
              description={`This voucher expired on ${dayjs(
                booking.booking_date,
              ).format("MMMM DD, YYYY")}. The booking date has passed.`}
              type="warning"
              showIcon
              style={{ marginBottom: 24 }}
            />
          )}

          {booking.voucher_status === "cancelled" && (
            <Alert
              message="Voucher Cancelled"
              description="This voucher has been cancelled and cannot be used."
              type="error"
              showIcon
              style={{ marginBottom: 24 }}
            />
          )}

          {booking.voucher_status === "active" && (
            <Alert
              message="Valid Voucher"
              description="This voucher is active and ready to be verified. Click 'Verify & Redeem' to mark it as used."
              type="success"
              showIcon
              style={{ marginBottom: 24 }}
            />
          )}

          <Descriptions bordered column={{ xs: 1, sm: 2 }}>
            <Descriptions.Item
              label={
                <Space>
                  <QrcodeOutlined /> Voucher Code
                </Space>
              }
              span={2}
            >
              <Text
                strong
                copyable
                style={{
                  fontFamily: "monospace",
                  fontSize: 20,
                  letterSpacing: 2,
                  color: "#FF621F",
                }}
              >
                {booking.voucher_code}
              </Text>
            </Descriptions.Item>

            <Descriptions.Item label="Booking ID">
              #{booking.id}
            </Descriptions.Item>

            <Descriptions.Item label="Payment Status">
              <Tag
                color={
                  booking.payment_status === "succeeded" ? "green" : "orange"
                }
              >
                {booking.payment_status || "pending"}
              </Tag>
            </Descriptions.Item>

            <Descriptions.Item
              label={
                <Space>
                  <UserOutlined /> Customer Name
                </Space>
              }
            >
              {booking.user_profiles?.full_name || "Guest"}
            </Descriptions.Item>

            <Descriptions.Item label="Customer Email">
              {booking.user_profiles?.email || booking.customer_email || "-"}
            </Descriptions.Item>

            <Descriptions.Item label="Customer Phone">
              {booking.user_profiles?.phone_number ||
                booking.customer_phone ||
                "-"}
            </Descriptions.Item>

            <Descriptions.Item label="Service">
              <Text strong>{booking.services?.service_name || "-"}</Text>
            </Descriptions.Item>

            <Descriptions.Item label="Package">
              {booking.packages?.name || "-"}
            </Descriptions.Item>

            <Descriptions.Item label="Location">
              {booking.services?.location || "-"}
            </Descriptions.Item>

            <Descriptions.Item
              label={
                <Space>
                  <CalendarOutlined /> Booking Date
                </Space>
              }
            >
              <Text strong>
                {dayjs(booking.booking_date).format("MMMM DD, YYYY")}
              </Text>
            </Descriptions.Item>

            <Descriptions.Item label="Time">
              {booking.departure_arrival_time || "Not specified"}
            </Descriptions.Item>

            <Descriptions.Item
              label={
                <Space>
                  <DollarOutlined /> Amount Paid
                </Space>
              }
            >
              <Text strong style={{ color: "#52c41a", fontSize: 16 }}>
                {booking.amount
                  ? `${(booking.amount / 100).toFixed(2)} ${booking.currency?.toUpperCase() || "AED"}`
                  : "-"}
              </Text>
            </Descriptions.Item>

            <Descriptions.Item label="Booking Type">
              {booking.type || "-"}
            </Descriptions.Item>

            {booking.address && (
              <Descriptions.Item label="Address" span={2}>
                {booking.address}
              </Descriptions.Item>
            )}

            {booking.special_requests && (
              <Descriptions.Item label="Special Requests" span={2}>
                {booking.special_requests}
              </Descriptions.Item>
            )}

            <Descriptions.Item label="Created At">
              {dayjs(booking.created_at).format("MMM DD, YYYY HH:mm")}
            </Descriptions.Item>

            {booking.voucher_verified_at && (
              <Descriptions.Item label="Verified At">
                {dayjs(booking.voucher_verified_at).format(
                  "MMM DD, YYYY HH:mm",
                )}
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>
      )}

      {/* Initial State */}
      {!booking && !error && !loading && (
        <Card style={{ textAlign: "center", padding: 60 }}>
          <Result
            icon={<QrcodeOutlined style={{ fontSize: 72, color: "#d9d9d9" }} />}
            title="Ready to Verify"
            subTitle="Enter a voucher code above to view booking details and verify the customer's voucher"
          />
        </Card>
      )}
    </div>
  );
};

export default VoucherVerification;

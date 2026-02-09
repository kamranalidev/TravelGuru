import { useState, useEffect } from "react";
import {
  Table,
  Button,
  Space,
  Tag,
  Typography,
  Drawer,
  Descriptions,
  message,
  Input,
  Popconfirm,
  Badge,
  Statistic,
  Row,
  Col,
} from "antd";
import {
  EyeOutlined,
  DeleteOutlined,
  SearchOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  ClockCircleOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { supabase } from "../lib/supabase";

dayjs.extend(relativeTime);
import PageHeader from "../components/common/PageHeader";
import PageCard from "../components/common/PageCard";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
} from "../utils/formatters";
import { colors } from "../config/theme";

const { Title, Text } = Typography;

const Carts = () => {
  const [loading, setLoading] = useState(false);
  const [carts, setCarts] = useState([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedCart, setSelectedCart] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    fetchCarts();
  }, []);

  const fetchCarts = async () => {
    setLoading(true);
    try {
      // First fetch carts
      const { data: cartsData, error: cartsError } = await supabase
        .from("carts")
        .select("*")
        .order("created_at", { ascending: false });

      if (cartsError) throw cartsError;

      // Fetch user profiles separately and cart items count
      const cartsWithDetails = await Promise.all(
        (cartsData || []).map(async (cart) => {
          // Fetch user profile if user_id exists
          let userProfile = null;
          if (cart.user_id) {
            const { data: profileData } = await supabase
              .from("user_profiles")
              .select("user_id, full_name, email")
              .eq("user_id", cart.user_id)
              .maybeSingle();
            userProfile = profileData;
          }

          // Fetch cart items count
          const { count } = await supabase
            .from("cart_items")
            .select("*", { count: "exact", head: true })
            .eq("cart_id", cart.id);

          return {
            ...cart,
            user_profiles: userProfile,
            items_count: count || 0,
          };
        }),
      );

      setCarts(cartsWithDetails);
    } catch (error) {
      message.error("Failed to fetch carts");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCartItems = async (cartId) => {
    try {
      const { data, error } = await supabase
        .from("cart_items")
        .select(
          `
          *,
          services:service_id(service_name),
          packages:package_id(name)
        `,
        )
        .eq("cart_id", cartId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCartItems(data || []);
    } catch (error) {
      message.error("Failed to fetch cart items");
      console.error(error);
    }
  };

  const handleView = async (record) => {
    setSelectedCart(record);
    await fetchCartItems(record.id);
    setDrawerVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      // First delete cart items
      await supabase.from("cart_items").delete().eq("cart_id", id);
      // Then delete cart
      const { error } = await supabase.from("carts").delete().eq("id", id);
      if (error) throw error;
      message.success("Cart deleted successfully");
      fetchCarts();
    } catch (error) {
      message.error("Failed to delete cart");
      console.error(error);
    }
  };

  const handleUpdateStatus = async (cartId, status) => {
    try {
      const { error } = await supabase
        .from("carts")
        .update({ status })
        .eq("id", cartId);
      if (error) throw error;
      message.success("Cart status updated");
      fetchCarts();
      if (selectedCart?.id === cartId) {
        setSelectedCart({ ...selectedCart, status });
      }
    } catch (error) {
      message.error("Failed to update cart status");
      console.error(error);
    }
  };

  const filteredCarts = carts.filter((cart) => {
    const searchLower = searchText.toLowerCase();
    return (
      cart.user_profiles?.full_name?.toLowerCase().includes(searchLower) ||
      cart.user_profiles?.email?.toLowerCase().includes(searchLower) ||
      cart.status?.toLowerCase().includes(searchLower)
    );
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return colors.success;
      case "checked_out":
        return colors.info;
      case "abandoned":
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const columns = [
    {
      title: "Cart ID",
      dataIndex: "id",
      key: "id",
      render: (id) => (
        <Text code copyable style={{ fontSize: 12 }}>
          {id.substring(0, 8)}...
        </Text>
      ),
    },
    {
      title: "User",
      key: "user",
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500, color: colors.text }}>
            {record.user_profiles?.full_name || "Guest"}
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.user_profiles?.email}
          </Text>
        </div>
      ),
    },
    {
      title: "Items",
      dataIndex: "items_count",
      key: "items_count",
      render: (count) => (
        <Badge
          count={count}
          showZero
          style={{
            backgroundColor: count > 0 ? colors.primary : colors.textSecondary,
          }}
        />
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={getStatusColor(status)} style={{ borderRadius: 12 }}>
          {status?.toUpperCase() || "ACTIVE"}
        </Tag>
      ),
      filters: [
        { text: "Active", value: "active" },
        { text: "Checked Out", value: "checked_out" },
        { text: "Abandoned", value: "abandoned" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      render: (date) => (
        <div>
          <div style={{ fontSize: 13, color: colors.text }}>
            {formatDate(date)}
          </div>
          <Text type="secondary" style={{ fontSize: 11 }}>
            {dayjs(date).fromNow()}
          </Text>
        </div>
      ),
      sorter: (a, b) => dayjs(a.created_at).unix() - dayjs(b.created_at).unix(),
    },
    {
      title: "Updated At",
      dataIndex: "updated_at",
      key: "updated_at",
      render: (date) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {formatDateTime(date)}
        </Text>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
            style={{ color: colors.primary }}
          />
          <Popconfirm
            title="Delete this cart?"
            description="This will also delete all cart items."
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const itemColumns = [
    {
      title: "Service",
      dataIndex: ["services", "service_name"],
      key: "service",
      render: (text) => (
        <Text strong style={{ color: colors.text }}>
          {text}
        </Text>
      ),
    },
    {
      title: "Package",
      dataIndex: ["packages", "name"],
      key: "package",
      render: (text) => (
        <Tag color={colors.primary} style={{ borderRadius: 8 }}>
          {text || "Standard"}
        </Tag>
      ),
    },
    {
      title: "Booking Date",
      dataIndex: "booking_date",
      key: "booking_date",
      render: (date) => (
        <Text style={{ color: colors.text }}>{formatDate(date)}</Text>
      ),
    },
    {
      title: "Time",
      dataIndex: "departure_arrival_time",
      key: "time",
      render: (time) => <Text type="secondary">{time || "-"}</Text>,
    },
    {
      title: "Price",
      key: "price",
      render: (_, record) => (
        <Text strong style={{ color: colors.success }}>
          {formatCurrency(record.unit_price_micros / 1000000)}{" "}
          {record.currency?.toUpperCase()}
        </Text>
      ),
    },
  ];

  return (
    <div style={{ width: "100%" }}>
      <PageHeader
        title="Cart Management"
        subtitle="Monitor and manage customer shopping carts"
        icon={<ShoppingCartOutlined />}
        extra={
          <Badge
            count={carts.length}
            showZero
            style={{
              backgroundColor: colors.success,
              boxShadow: `0 0 0 2px ${colors.background}`,
            }}
          >
            <ShoppingCartOutlined
              style={{ fontSize: 28, color: colors.primary }}
            />
          </Badge>
        }
      />

      {/* Statistics Section */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <PageCard>
            <Statistic
              title="Total Carts"
              value={carts.length}
              prefix={
                <ShoppingCartOutlined style={{ color: colors.primary }} />
              }
              valueStyle={{ color: colors.primary }}
            />
          </PageCard>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <PageCard>
            <Statistic
              title="Total Value"
              value={carts.reduce(
                (sum, cart) => sum + (cart.total_price || 0),
                0,
              )}
              prefix={<DollarOutlined style={{ color: colors.success }} />}
              valueStyle={{ color: colors.success }}
              formatter={(value) => formatCurrency(value)}
            />
          </PageCard>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <PageCard>
            <Statistic
              title="Active Users"
              value={new Set(carts.map((c) => c.user_id)).size}
              prefix={<UserOutlined style={{ color: colors.info }} />}
              valueStyle={{ color: colors.info }}
            />
          </PageCard>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <PageCard>
            <Statistic
              title="Recent (24h)"
              value={
                carts.filter((c) =>
                  dayjs(c.created_at).isAfter(dayjs().subtract(24, "hours")),
                ).length
              }
              prefix={<ClockCircleOutlined style={{ color: colors.warning }} />}
              valueStyle={{ color: colors.warning }}
            />
          </PageCard>
        </Col>
      </Row>

      <PageCard>
        <div style={{ marginBottom: 16 }}>
          <Input
            placeholder="Search by user email or cart ID..."
            prefix={<SearchOutlined style={{ color: colors.textSecondary }} />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{
              maxWidth: 400,
              borderRadius: 8,
            }}
            size="large"
          />
        </div>
        <Table
          columns={columns}
          dataSource={filteredCarts}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1000 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} carts`,
          }}
        />
      </PageCard>

      <Drawer
        title={
          <Space>
            <ShoppingCartOutlined style={{ color: colors.primary }} />
            <span>Cart Details</span>
          </Space>
        }
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        width={720}
      >
        {selectedCart && (
          <div>
            <Descriptions
              column={2}
              bordered
              style={{ marginBottom: 24 }}
              labelStyle={{
                fontWeight: 500,
                backgroundColor: colors.background,
                color: colors.textSecondary,
              }}
              contentStyle={{
                backgroundColor: "#fff",
                color: colors.text,
              }}
            >
              <Descriptions.Item label="Cart ID" span={2}>
                <Text code copyable>
                  {selectedCart.id}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="User">
                <Space>
                  <UserOutlined style={{ color: colors.primary }} />
                  <Text strong>
                    {selectedCart.user_profiles?.full_name || "Guest"}
                  </Text>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                <Text copyable type="secondary">
                  {selectedCart.user_profiles?.email || "-"}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag
                  color={getStatusColor(selectedCart.status)}
                  style={{ borderRadius: 12 }}
                >
                  {selectedCart.status?.toUpperCase() || "ACTIVE"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Items Count">
                <Badge
                  count={selectedCart.items_count}
                  showZero
                  style={{ backgroundColor: colors.primary }}
                />
              </Descriptions.Item>
              <Descriptions.Item label="Created At">
                <Text>{formatDateTime(selectedCart.created_at)}</Text>
                <br />
                <Text type="secondary" style={{ fontSize: 11 }}>
                  {dayjs(selectedCart.created_at).fromNow()}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Updated At">
                <Text>{formatDateTime(selectedCart.updated_at)}</Text>
                <br />
                <Text type="secondary" style={{ fontSize: 11 }}>
                  {dayjs(selectedCart.updated_at).fromNow()}
                </Text>
              </Descriptions.Item>
            </Descriptions>

            <div
              style={{
                marginBottom: 24,
                padding: 16,
                backgroundColor: colors.background,
                borderRadius: 8,
              }}
            >
              <Text strong style={{ marginRight: 16, color: colors.text }}>
                Update Status:
              </Text>
              <Space wrap>
                <Button
                  type={
                    selectedCart.status === "active" ? "primary" : "default"
                  }
                  onClick={() => handleUpdateStatus(selectedCart.id, "active")}
                  style={
                    selectedCart.status === "active"
                      ? {}
                      : {
                          borderColor: colors.success,
                          color: colors.success,
                        }
                  }
                >
                  Active
                </Button>
                <Button
                  type={
                    selectedCart.status === "checked_out"
                      ? "primary"
                      : "default"
                  }
                  onClick={() =>
                    handleUpdateStatus(selectedCart.id, "checked_out")
                  }
                  style={
                    selectedCart.status === "checked_out"
                      ? {}
                      : {
                          borderColor: colors.info,
                          color: colors.info,
                        }
                  }
                >
                  Checked Out
                </Button>
                <Button
                  type={
                    selectedCart.status === "abandoned" ? "primary" : "default"
                  }
                  danger={selectedCart.status !== "abandoned"}
                  onClick={() =>
                    handleUpdateStatus(selectedCart.id, "abandoned")
                  }
                >
                  Abandoned
                </Button>
              </Space>
            </div>

            <div
              style={{
                marginBottom: 12,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <ShoppingCartOutlined
                style={{ fontSize: 18, color: colors.primary }}
              />
              <Title level={5} style={{ margin: 0 }}>
                Cart Items
              </Title>
            </div>
            <Table
              columns={itemColumns}
              dataSource={cartItems}
              rowKey="id"
              size="middle"
              pagination={false}
              bordered
              style={{ marginBottom: 16 }}
            />

            {cartItems.length > 0 && (
              <div
                style={{
                  padding: 16,
                  backgroundColor: colors.successLight,
                  borderRadius: 8,
                  textAlign: "right",
                  border: `1px solid ${colors.success}`,
                }}
              >
                <Text type="secondary" style={{ marginRight: 8 }}>
                  Total Amount:
                </Text>
                <Text strong style={{ fontSize: 18, color: colors.success }}>
                  {formatCurrency(
                    cartItems.reduce(
                      (sum, item) => sum + item.unit_price_micros / 1000000,
                      0,
                    ),
                  )}{" "}
                  {cartItems[0]?.currency?.toUpperCase()}
                </Text>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default Carts;

import { useState, useEffect } from "react";
import {
  Table,
  Card,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  TimePicker,
  InputNumber,
  message,
  Popconfirm,
  Typography,
  Descriptions,
  Drawer,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { supabase } from "../lib/supabase";
const { Title } = Typography;
const { Option } = Select;
const Bookings = () => {
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [packages, setPackages] = useState([]);
  const [users, setUsers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [editingBooking, setEditingBooking] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [form] = Form.useForm();
  useEffect(() => {
    fetchBookings();
    fetchServices();
    fetchPackages();
    fetchUsers();
  }, []);
  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(
          `
          *,
          services:service_id(id, service_name),
          packages:package_id(id, name),
          user_profiles:user_id(user_id, full_name, email, phone_number)
        `,
        )
        .order("created_at", { ascending: false });
      if (error) throw error;

      const sanitized = (data || []).map(({ children, ...rest }) => ({
        ...rest,
        children_count: children ?? 0,
      }));
      setBookings(sanitized);
    } catch (error) {
      message.error("Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };
  const fetchServices = async () => {
    const { data } = await supabase.from("services").select("id, service_name");
    setServices(data || []);
  };
  const fetchPackages = async () => {
    const { data } = await supabase
      .from("packages")
      .select("id, name, service_id");
    setPackages(data || []);
  };
  const fetchUsers = async () => {
    const { data } = await supabase
      .from("user_profiles")
      .select("user_id, full_name, email");
    setUsers(data || []);
  };
  const handleCreate = () => {
    setEditingBooking(null);
    form.resetFields();
    setModalVisible(true);
  };
  const handleEdit = (record) => {
    setEditingBooking(record);
    form.setFieldsValue({
      ...record,
      booking_date: record.booking_date ? dayjs(record.booking_date) : null,
      departure_arrival_time: record.departure_arrival_time
        ? dayjs(record.departure_arrival_time, "HH:mm:ss")
        : null,
    });
    setModalVisible(true);
  };
  const handleView = (record) => {
    setSelectedBooking(record);
    setDrawerVisible(true);
  };
  const handleDelete = async (id) => {
    try {
      const { error } = await supabase.from("bookings").delete().eq("id", id);
      if (error) throw error;
      message.success("Booking deleted successfully");
      fetchBookings();
    } catch (error) {
      message.error("Failed to delete booking");
    }
  };
  const handleSubmit = async (values) => {
    try {
      const bookingData = {
        ...values,
        booking_date: values.booking_date?.format("YYYY-MM-DD"),
        departure_arrival_time:
          values.departure_arrival_time?.format("HH:mm:ss"),
      };
      if (editingBooking) {
        const { error } = await supabase
          .from("bookings")
          .update(bookingData)
          .eq("id", editingBooking.id);
        if (error) throw error;
        message.success("Booking updated successfully");
      } else {
        const { error } = await supabase.from("bookings").insert([bookingData]);
        if (error) throw error;
        message.success("Booking created successfully");
      }
      setModalVisible(false);
      form.resetFields();
      fetchBookings();
    } catch (error) {
      message.error("Failed to save booking");
    }
  };
  const filteredBookings = bookings.filter((booking) => {
    const searchLower = searchText.toLowerCase();
    return (
      booking.user_profiles?.full_name?.toLowerCase().includes(searchLower) ||
      booking.user_profiles?.email?.toLowerCase().includes(searchLower) ||
      booking.services?.service_name?.toLowerCase().includes(searchLower) ||
      booking.payment_status?.toLowerCase().includes(searchLower)
    );
  });
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "Customer",
      key: "customer",
      render: (_, record) => (
        <div>
          <div>{record.user_profiles?.full_name || "Guest"}</div>
          <small style={{ color: "#888" }}>{record.user_profiles?.email}</small>
        </div>
      ),
    },
    {
      title: "Service",
      dataIndex: ["services", "service_name"],
      key: "service",
    },
    {
      title: "Package",
      dataIndex: ["packages", "name"],
      key: "package",
      render: (text) => text || "-",
    },
    {
      title: "Booking Date",
      dataIndex: "booking_date",
      key: "booking_date",
      render: (date) => (date ? dayjs(date).format("MMM DD, YYYY") : "-"),
      sorter: (a, b) =>
        dayjs(a.booking_date).unix() - dayjs(b.booking_date).unix(),
    },
    {
      title: "Amount",
      key: "amount",
      render: (_, record) =>
        record.amount
          ? `${(record.amount / 100).toFixed(2)} ${record.currency?.toUpperCase() || "AED"}`
          : "-",
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
        if (adults > 0) parts.push(`${adults} Adult${adults !== 1 ? "s" : ""}`);
        if (children > 0)
          parts.push(`${children} Child${children !== 1 ? "ren" : ""}`);
        if (infants > 0)
          parts.push(`${infants} Infant${infants !== 1 ? "s" : ""}`);
        return (
          <div>
            {parts.map((p, i) => (
              <div key={i} style={{ fontSize: 13 }}>
                {p}
              </div>
            ))}
            {total > 1 && (
              <small style={{ color: "#888" }}>({total} total)</small>
            )}
          </div>
        );
      },
    },
    {
      title: "Payment Status",
      dataIndex: "payment_status",
      key: "payment_status",
      render: (status) => {
        const colors = {
          succeeded: "green",
          pending: "orange",
          failed: "red",
          refunded: "blue",
        };
        return (
          <Tag color={colors[status] || "default"}>{status || "pending"}</Tag>
        );
      },
      filters: [
        { text: "Succeeded", value: "succeeded" },
        { text: "Pending", value: "pending" },
        { text: "Failed", value: "failed" },
        { text: "Refunded", value: "refunded" },
      ],
      onFilter: (value, record) => record.payment_status === value,
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (type) => <Tag>{type || "N/A"}</Tag>,
    },
    {
      title: "Extras",
      key: "extras",
      width: 140,
      render: (_, record) => (
        <div>
          {record.selected_time && (
            <Tag color="purple" style={{ marginBottom: 4 }}>
              🕐 {record.selected_time}
            </Tag>
          )}
          {record.transfer_type && record.transfer_type !== "none" && (
            <Tag color="cyan">
              🚗{" "}
              {record.transfer_type === "round_trip" ? "Round trip" : "One way"}
              {record.transfer_price ? ` (${record.transfer_price} AED)` : ""}
            </Tag>
          )}
          {!record.selected_time &&
            (!record.transfer_type || record.transfer_type === "none") &&
            "-"}
        </div>
      ),
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      render: (date) => dayjs(date).format("MMM DD, YYYY HH:mm"),
      sorter: (a, b) => dayjs(a.created_at).unix() - dayjs(b.created_at).unix(),
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Delete this booking?"
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
  return (
    <div style={{ width: "100%" }}>
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <Title level={2} style={{ margin: 0 }}>
          Bookings
        </Title>
        <Space wrap>
          <Input
            placeholder="Search bookings..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            Add Booking
          </Button>
        </Space>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={filteredBookings}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} bookings`,
          }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingBooking ? "Edit Booking" : "Create Booking"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="user_id" label="Customer">
            <Select
              placeholder="Select customer"
              allowClear
              showSearch
              optionFilterProp="children"
            >
              {users.map((user) => (
                <Option key={user.user_id} value={user.user_id}>
                  {user.full_name} ({user.email})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="service_id"
            label="Service"
            rules={[{ required: true }]}
          >
            <Select placeholder="Select service">
              {services.map((service) => (
                <Option key={service.id} value={service.id}>
                  {service.service_name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="package_id" label="Package">
            <Select placeholder="Select package" allowClear>
              {packages.map((pkg) => (
                <Option key={pkg.id} value={pkg.id}>
                  {pkg.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="booking_date"
            label="Booking Date"
            rules={[{ required: true }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="departure_arrival_time"
            label="Departure/Arrival Time"
          >
            <TimePicker style={{ width: "100%" }} format="HH:mm" />
          </Form.Item>

          <Form.Item name="type" label="Type">
            <Select placeholder="Select type">
              <Option value="tour">Tour</Option>
              <Option value="transfer">Transfer</Option>
              <Option value="activity">Activity</Option>
            </Select>
          </Form.Item>

          <Form.Item name="address" label="Address">
            <Input.TextArea rows={2} />
          </Form.Item>

          <Form.Item name="amount" label="Amount (in cents)">
            <InputNumber style={{ width: "100%" }} min={0} />
          </Form.Item>

          <Form.Item name="currency" label="Currency" initialValue="aed">
            <Select>
              <Option value="aed">AED</Option>
              <Option value="usd">USD</Option>
              <Option value="eur">EUR</Option>
            </Select>
          </Form.Item>

          <Form.Item name="payment_status" label="Payment Status">
            <Select placeholder="Select status">
              <Option value="pending">Pending</Option>
              <Option value="succeeded">Succeeded</Option>
              <Option value="failed">Failed</Option>
              <Option value="refunded">Refunded</Option>
            </Select>
          </Form.Item>

          <Form.Item name="payment_intent_id" label="Payment Intent ID">
            <Input />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button onClick={() => setModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                {editingBooking ? "Update" : "Create"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* View Drawer */}
      <Drawer
        title="Booking Details"
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        size="default"
      >
        {selectedBooking && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="ID">
              {selectedBooking.id}
            </Descriptions.Item>
            <Descriptions.Item label="Customer">
              {selectedBooking.user_profiles?.full_name || "Guest"}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {selectedBooking.user_profiles?.email || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Phone">
              {selectedBooking.user_profiles?.phone_number || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Service">
              {selectedBooking.services?.service_name}
            </Descriptions.Item>
            <Descriptions.Item label="Package">
              {selectedBooking.packages?.name || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Booking Date">
              {selectedBooking.booking_date
                ? dayjs(selectedBooking.booking_date).format("MMMM DD, YYYY")
                : "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Time">
              {selectedBooking.departure_arrival_time || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Type">
              {selectedBooking.type || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Address">
              {selectedBooking.address || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Amount">
              {selectedBooking.amount
                ? `${(selectedBooking.amount / 100).toFixed(2)} ${selectedBooking.currency?.toUpperCase()}`
                : "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Guests">
              {(() => {
                const adults = selectedBooking.adults || 0;
                const children = selectedBooking.children_count || 0;
                const infants = selectedBooking.infants || 0;
                const total = adults + children + infants;
                if (total === 0) return "-";
                const parts = [];
                if (adults > 0)
                  parts.push(`👤 ${adults} Adult${adults !== 1 ? "s" : ""}`);
                if (children > 0)
                  parts.push(
                    `👦 ${children} Child${children !== 1 ? "ren" : ""}`,
                  );
                if (infants > 0)
                  parts.push(`👶 ${infants} Infant${infants !== 1 ? "s" : ""}`);
                return (
                  <div>
                    {parts.map((p, i) => (
                      <div key={i}>{p}</div>
                    ))}
                    {total > 1 && (
                      <div style={{ fontWeight: 600, marginTop: 4 }}>
                        Total: {total} guest{total !== 1 ? "s" : ""}
                      </div>
                    )}
                  </div>
                );
              })()}
            </Descriptions.Item>
            <Descriptions.Item label="Payment Status">
              <Tag
                color={
                  selectedBooking.payment_status === "succeeded"
                    ? "green"
                    : selectedBooking.payment_status === "pending"
                      ? "orange"
                      : "red"
                }
              >
                {selectedBooking.payment_status || "pending"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Payment Intent">
              {selectedBooking.payment_intent_id || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Created At">
              {dayjs(selectedBooking.created_at).format("MMMM DD, YYYY HH:mm")}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
};
export default Bookings;

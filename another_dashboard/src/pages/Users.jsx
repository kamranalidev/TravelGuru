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
  message,
  Popconfirm,
  Typography,
  Avatar,
  Descriptions,
  Drawer,
  Tabs,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  UserOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { supabase } from "../lib/supabase";

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const Users = () => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userBookings, setUserBookings] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [form] = Form.useForm();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      message.error("Failed to fetch users");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserBookings = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(
          `
          *,
          services:service_id(service_name)
        `,
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUserBookings(data || []);
    } catch (error) {
      console.error("Error fetching user bookings:", error);
    }
  };

  const handleEdit = (record) => {
    setEditingUser(record);
    form.setFieldsValue({
      ...record,
      date_of_birth: record.date_of_birth ? dayjs(record.date_of_birth) : null,
    });
    setModalVisible(true);
  };

  const handleView = async (record) => {
    setSelectedUser(record);
    await fetchUserBookings(record.user_id);
    setDrawerVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase
        .from("user_profiles")
        .delete()
        .eq("id", id);
      if (error) throw error;
      message.success("User deleted successfully");
      fetchUsers();
    } catch (error) {
      message.error("Failed to delete user");
      console.error(error);
    }
  };

  const handleSubmit = async (values) => {
    try {
      const userData = {
        ...values,
        date_of_birth: values.date_of_birth?.format("YYYY-MM-DD"),
      };

      if (editingUser) {
        const { error } = await supabase
          .from("user_profiles")
          .update(userData)
          .eq("id", editingUser.id);
        if (error) throw error;
        message.success("User updated successfully");
      }

      setModalVisible(false);
      form.resetFields();
      fetchUsers();
    } catch (error) {
      message.error("Failed to save user");
      console.error(error);
    }
  };

  const filteredUsers = users.filter((user) => {
    const searchLower = searchText.toLowerCase();
    return (
      user.full_name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.phone_number?.includes(searchText) ||
      user.nationality?.toLowerCase().includes(searchLower)
    );
  });

  const columns = [
    {
      title: "User",
      key: "user",
      render: (_, record) => (
        <Space>
          <Avatar
            src={record.profile_picture}
            icon={<UserOutlined />}
            size={40}
          />
          <div>
            <div style={{ fontWeight: 500 }}>{record.full_name || "N/A"}</div>
            <small style={{ color: "#888" }}>{record.email}</small>
          </div>
        </Space>
      ),
    },
    {
      title: "Phone",
      dataIndex: "phone_number",
      key: "phone_number",
      render: (phone) => phone || "-",
    },
    {
      title: "Nationality",
      dataIndex: "nationality",
      key: "nationality",
      render: (nationality) => nationality || "-",
    },
    {
      title: "Role",
      dataIndex: "user_role",
      key: "user_role",
      render: (role) => (
        <Tag color={role === 1 ? "red" : "blue"}>
          {role === 1 ? "Admin" : "User"}
        </Tag>
      ),
      filters: [
        { text: "Admin", value: 1 },
        { text: "User", value: 0 },
      ],
      onFilter: (value, record) => record.user_role === value,
    },
    {
      title: "Date of Birth",
      dataIndex: "date_of_birth",
      key: "date_of_birth",
      render: (date) => (date ? dayjs(date).format("MMM DD, YYYY") : "-"),
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      render: (date) => dayjs(date).format("MMM DD, YYYY"),
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
            title="Delete this user?"
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

  const bookingColumns = [
    {
      title: "Service",
      dataIndex: ["services", "service_name"],
      key: "service",
    },
    {
      title: "Date",
      dataIndex: "booking_date",
      key: "date",
      render: (date) => (date ? dayjs(date).format("MMM DD, YYYY") : "-"),
    },
    {
      title: "Amount",
      key: "amount",
      render: (_, record) =>
        record.amount
          ? `${(record.amount / 100).toFixed(2)} ${record.currency?.toUpperCase()}`
          : "-",
    },
    {
      title: "Status",
      dataIndex: "payment_status",
      key: "status",
      render: (status) => (
        <Tag
          color={
            status === "succeeded"
              ? "green"
              : status === "pending"
                ? "orange"
                : "red"
          }
        >
          {status || "pending"}
        </Tag>
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
          Users
        </Title>
        <Space wrap>
          <Input
            placeholder="Search users..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
          />
        </Space>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1000 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} users`,
          }}
        />
      </Card>

      {/* Edit Modal */}
      <Modal
        title="Edit User"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="full_name" label="Full Name">
            <Input />
          </Form.Item>

          <Form.Item name="email" label="Email">
            <Input disabled />
          </Form.Item>

          <Space style={{ width: "100%" }} size="large">
            <Form.Item name="phone_number" label="Phone Number">
              <Input style={{ width: 200 }} />
            </Form.Item>

            <Form.Item name="nationality" label="Nationality">
              <Input style={{ width: 200 }} />
            </Form.Item>

            <Form.Item name="date_of_birth" label="Date of Birth">
              <DatePicker style={{ width: 200 }} />
            </Form.Item>
          </Space>

          <Form.Item name="address" label="Address">
            <TextArea rows={2} />
          </Form.Item>

          <Form.Item name="bio" label="Bio">
            <TextArea rows={2} />
          </Form.Item>

          <Space style={{ width: "100%" }} size="large">
            <Form.Item name="passport_number" label="Passport Number">
              <Input style={{ width: 200 }} />
            </Form.Item>

            <Form.Item name="user_role" label="Role">
              <Select style={{ width: 200 }}>
                <Option value={0}>User</Option>
                <Option value={1}>Admin</Option>
              </Select>
            </Form.Item>
          </Space>

          <Form.Item
            name="emergency_contact_name"
            label="Emergency Contact Name"
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="emergency_contact_phone"
            label="Emergency Contact Phone"
          >
            <Input />
          </Form.Item>

          <Form.Item name="travel_preferences" label="Travel Preferences">
            <TextArea rows={2} />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button onClick={() => setModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                Update
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* View Drawer */}
      <Drawer
        title="User Details"
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        size="large"
      >
        {selectedUser && (
          <Tabs
            items={[
              {
                key: "profile",
                label: "Profile",
                children: (
                  <Descriptions column={1} bordered>
                    <Descriptions.Item label="Full Name">
                      {selectedUser.full_name || "-"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Email">
                      {selectedUser.email || "-"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Phone">
                      {selectedUser.phone_number || "-"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Nationality">
                      {selectedUser.nationality || "-"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Date of Birth">
                      {selectedUser.date_of_birth
                        ? dayjs(selectedUser.date_of_birth).format(
                            "MMMM DD, YYYY",
                          )
                        : "-"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Address">
                      {selectedUser.address || "-"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Bio">
                      {selectedUser.bio || "-"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Passport Number">
                      {selectedUser.passport_number || "-"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Emergency Contact">
                      {selectedUser.emergency_contact_name
                        ? `${selectedUser.emergency_contact_name} (${selectedUser.emergency_contact_phone})`
                        : "-"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Travel Preferences">
                      {selectedUser.travel_preferences || "-"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Role">
                      <Tag
                        color={selectedUser.user_role === 1 ? "red" : "blue"}
                      >
                        {selectedUser.user_role === 1 ? "Admin" : "User"}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Member Since">
                      {dayjs(selectedUser.created_at).format("MMMM DD, YYYY")}
                    </Descriptions.Item>
                  </Descriptions>
                ),
              },
              {
                key: "bookings",
                label: `Bookings (${userBookings.length})`,
                children: (
                  <Table
                    columns={bookingColumns}
                    dataSource={userBookings}
                    rowKey="id"
                    size="small"
                    pagination={{ pageSize: 5 }}
                  />
                ),
              },
            ]}
          />
        )}
      </Drawer>
    </div>
  );
};

export default Users;

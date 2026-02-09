import { useState, useEffect } from "react";
import {
  Table,
  Card,
  Button,
  Space,
  Tag,
  Typography,
  message,
  Input,
  Popconfirm,
  Rate,
  Avatar,
  Drawer,
  Descriptions,
} from "antd";
import {
  EyeOutlined,
  DeleteOutlined,
  SearchOutlined,
  UserOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { supabase } from "../lib/supabase";

const { Title, Paragraph } = Typography;

const Reviews = () => {
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select(
          `
          *,
          user_profiles:user_id(user_id, full_name, email, profile_picture),
          bookings:booking_id(
            id,
            booking_date,
            services:service_id(service_name)
          )
        `,
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      message.error("Failed to fetch reviews");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (record) => {
    setSelectedReview(record);
    setDrawerVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase.from("reviews").delete().eq("id", id);
      if (error) throw error;
      message.success("Review deleted successfully");
      fetchReviews();
    } catch (error) {
      message.error("Failed to delete review");
      console.error(error);
    }
  };

  const filteredReviews = reviews.filter((review) => {
    const searchLower = searchText.toLowerCase();
    return (
      review.user_profiles?.full_name?.toLowerCase().includes(searchLower) ||
      review.review?.toLowerCase().includes(searchLower) ||
      review.bookings?.services?.service_name
        ?.toLowerCase()
        .includes(searchLower)
    );
  });

  const getRatingColor = (rating) => {
    const numRating = parseFloat(rating) || 0;
    if (numRating >= 4) return "green";
    if (numRating >= 3) return "orange";
    return "red";
  };

  const columns = [
    {
      title: "User",
      key: "user",
      render: (_, record) => (
        <Space>
          <Avatar
            src={record.user_profiles?.profile_picture}
            icon={<UserOutlined />}
            size={40}
          />
          <div>
            <div style={{ fontWeight: 500 }}>
              {record.user_profiles?.full_name || "Anonymous"}
            </div>
            <small style={{ color: "#888" }}>
              {record.user_profiles?.email}
            </small>
          </div>
        </Space>
      ),
    },
    {
      title: "Service",
      key: "service",
      render: (_, record) => record.bookings?.services?.service_name || "-",
    },
    {
      title: "Rating",
      dataIndex: "rating",
      key: "rating",
      render: (rating) => (
        <Space>
          <Rate disabled defaultValue={parseFloat(rating) || 0} allowHalf />
          <Tag color={getRatingColor(rating)}>{rating || "0"}</Tag>
        </Space>
      ),
      sorter: (a, b) =>
        (parseFloat(a.rating) || 0) - (parseFloat(b.rating) || 0),
      filters: [
        { text: "5 Stars", value: "5" },
        { text: "4 Stars", value: "4" },
        { text: "3 Stars", value: "3" },
        { text: "2 Stars", value: "2" },
        { text: "1 Star", value: "1" },
      ],
      onFilter: (value, record) =>
        Math.floor(parseFloat(record.rating) || 0) === parseInt(value),
    },
    {
      title: "Review",
      dataIndex: "review",
      key: "review",
      width: 300,
      ellipsis: true,
      render: (text) => text || "-",
    },
    {
      title: "Booking Date",
      key: "booking_date",
      render: (_, record) =>
        record.bookings?.booking_date
          ? dayjs(record.bookings.booking_date).format("MMM DD, YYYY")
          : "-",
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
      width: 100,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          />
          <Popconfirm
            title="Delete this review?"
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

  // Calculate stats
  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? (
          reviews.reduce((sum, r) => sum + (parseFloat(r.rating) || 0), 0) /
          totalReviews
        ).toFixed(1)
      : 0;
  const fiveStarCount = reviews.filter(
    (r) => parseFloat(r.rating) >= 4.5,
  ).length;

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
          Reviews
        </Title>
        <Space wrap>
          <Input
            placeholder="Search reviews..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
          />
        </Space>
      </div>

      <Space
        style={{ marginBottom: 16, width: "100%", flexWrap: "wrap" }}
        size="large"
      >
        <Card size="small">
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: "bold", color: "#1890ff" }}>
              {totalReviews}
            </div>
            <div style={{ color: "#888" }}>Total Reviews</div>
          </div>
        </Card>
        <Card size="small">
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: "bold", color: "#52c41a" }}>
              {averageRating}
            </div>
            <div style={{ color: "#888" }}>Average Rating</div>
          </div>
        </Card>
        <Card size="small">
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: "bold", color: "#faad14" }}>
              {fiveStarCount}
            </div>
            <div style={{ color: "#888" }}>5-Star Reviews</div>
          </div>
        </Card>
      </Space>

      <Card>
        <Table
          columns={columns}
          dataSource={filteredReviews}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} reviews`,
          }}
        />
      </Card>

      <Drawer
        title="Review Details"
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        size="default"
      >
        {selectedReview && (
          <>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <Avatar
                src={selectedReview.user_profiles?.profile_picture}
                icon={<UserOutlined />}
                size={80}
              />
              <Title level={4} style={{ marginTop: 12, marginBottom: 0 }}>
                {selectedReview.user_profiles?.full_name || "Anonymous"}
              </Title>
              <div style={{ color: "#888" }}>
                {selectedReview.user_profiles?.email}
              </div>
            </div>

            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <Rate
                disabled
                defaultValue={parseFloat(selectedReview.rating) || 0}
                allowHalf
                style={{ fontSize: 32 }}
              />
              <div style={{ marginTop: 8 }}>
                <Tag
                  color={getRatingColor(selectedReview.rating)}
                  style={{ fontSize: 16 }}
                >
                  {selectedReview.rating || "0"} / 5
                </Tag>
              </div>
            </div>

            <Card style={{ marginBottom: 16, background: "#f9f9f9" }}>
              <Paragraph style={{ margin: 0, fontStyle: "italic" }}>
                "{selectedReview.review || "No review text provided."}"
              </Paragraph>
            </Card>

            <Descriptions column={1} bordered>
              <Descriptions.Item label="Service">
                {selectedReview.bookings?.services?.service_name || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Booking ID">
                {selectedReview.booking_id || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Booking Date">
                {selectedReview.bookings?.booking_date
                  ? dayjs(selectedReview.bookings.booking_date).format(
                      "MMMM DD, YYYY",
                    )
                  : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Review Date">
                {dayjs(selectedReview.created_at).format("MMMM DD, YYYY HH:mm")}
              </Descriptions.Item>
            </Descriptions>
          </>
        )}
      </Drawer>
    </div>
  );
};

export default Reviews;

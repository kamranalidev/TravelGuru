import { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  message,
  Popconfirm,
  Tag,
  Switch,
  Select,
  TimePicker,
  Checkbox,
  Divider,
  Row,
  Col,
  Upload,
  Image,
  Tabs,
  Typography,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  MinusCircleOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  supabase,
  uploadImage,
  getImageUrl,
  STORAGE_BUCKET,
} from "../lib/supabase";

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

const ALL_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const SERVICE_TYPES = [
  { value: "tour", label: "Tour" },
  { value: "activity", label: "Activity" },
  { value: "transport", label: "Transport" },
  { value: "experience", label: "Experience" },
  { value: "cruise", label: "Cruise" },
  { value: "safari", label: "Safari" },
  { value: "water_sport", label: "Water Sport" },
  { value: "theme_park", label: "Theme Park" },
];

const CATEGORIES = [
  { value: "tour", label: "Tour" },
  { value: "activity", label: "Activity" },
  { value: "transport", label: "Transport" },
  { value: "adventure", label: "Adventure" },
  { value: "luxury", label: "Luxury" },
  { value: "cultural", label: "Cultural" },
  { value: "water", label: "Water" },
  { value: "desert", label: "Desert" },
];

// Helper: get first image URL from service_image jsonb
const getFirstImage = (serviceImage) => {
  if (!serviceImage) return null;
  try {
    const val =
      typeof serviceImage === "string"
        ? JSON.parse(serviceImage)
        : serviceImage;
    if (Array.isArray(val)) {
      const first = val[0];
      return typeof first === "string" ? first : first?.url || null;
    }
    if (typeof val?.url === "string") return val.url;
    if (Array.isArray(val?.url)) return val.url[0] || null;
  } catch {}
  return null;
};

function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [detailDrawer, setDetailDrawer] = useState(null);
  const [serviceImageList, setServiceImageList] = useState([]);
  const [galleryImageList, setGalleryImageList] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Auto-calculate duration when start_time or end_time changes
  const handleTimeChange = () => {
    const startTime = form.getFieldValue("start_time");
    const endTime = form.getFieldValue("end_time");
    if (startTime && endTime) {
      const start = dayjs(startTime);
      const end = dayjs(endTime);
      let diffHours = end.diff(start, "minute") / 60;
      // Handle overnight (e.g., 22:00 → 02:00)
      if (diffHours <= 0) diffHours += 24;
      form.setFieldValue("duration", Math.round(diffHours * 100) / 100);
    }
  };

  // Upload a file to Supabase Storage and return its public URL
  const handleImageUpload = async (file, folder = "services") => {
    try {
      setUploading(true);
      const path = await uploadImage(file, folder);
      const publicUrl = getImageUrl(path);
      return { url: publicUrl, path };
    } catch (error) {
      console.error("Upload error:", error);
      message.error(`Failed to upload ${file.name}`);
      return null;
    } finally {
      setUploading(false);
    }
  };

  // Custom upload handler for service images
  const serviceImageUploadProps = {
    beforeUpload: async (file) => {
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        message.error("You can only upload image files!");
        return Upload.LIST_IGNORE;
      }
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error("Image must be smaller than 5MB!");
        return Upload.LIST_IGNORE;
      }
      const result = await handleImageUpload(file, "services");
      if (result) {
        setServiceImageList((prev) => [
          ...prev,
          {
            uid: file.uid || Date.now().toString(),
            name: file.name,
            status: "done",
            url: result.url,
            storagePath: result.path,
          },
        ]);
      }
      return false; // prevent default upload
    },
    onRemove: async (file) => {
      if (file.storagePath) {
        try {
          await supabase.storage
            .from(STORAGE_BUCKET)
            .remove([file.storagePath]);
        } catch (e) {
          console.warn("Could not delete from storage:", e);
        }
      }
      setServiceImageList((prev) => prev.filter((f) => f.uid !== file.uid));
    },
    fileList: serviceImageList,
    listType: "picture-card",
    accept: "image/*",
    multiple: true,
  };

  // Custom upload handler for gallery images
  const galleryImageUploadProps = {
    beforeUpload: async (file) => {
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        message.error("You can only upload image files!");
        return Upload.LIST_IGNORE;
      }
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error("Image must be smaller than 5MB!");
        return Upload.LIST_IGNORE;
      }
      const result = await handleImageUpload(file, "gallery");
      if (result) {
        setGalleryImageList((prev) => [
          ...prev,
          {
            uid: file.uid || Date.now().toString(),
            name: file.name,
            status: "done",
            url: result.url,
            storagePath: result.path,
          },
        ]);
      }
      return false;
    },
    onRemove: async (file) => {
      if (file.storagePath) {
        try {
          await supabase.storage
            .from(STORAGE_BUCKET)
            .remove([file.storagePath]);
        } catch (e) {
          console.warn("Could not delete from storage:", e);
        }
      }
      setGalleryImageList((prev) => prev.filter((f) => f.uid !== file.uid));
    },
    fileList: galleryImageList,
    listType: "picture-card",
    accept: "image/*",
    multiple: true,
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error("Error fetching services:", error);
      message.error("Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingService(null);
    form.resetFields();
    setServiceImageList([]);
    setGalleryImageList([]);
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingService(record);

    // Parse existing service images into fileList format
    const existingServiceImages = (() => {
      try {
        const val =
          typeof record.service_image === "string"
            ? JSON.parse(record.service_image)
            : record.service_image;
        if (Array.isArray(val)) {
          return val
            .map((x, i) => {
              const url = typeof x === "string" ? x : x?.url;
              return url
                ? {
                    uid: `existing-svc-${i}`,
                    name: `Image ${i + 1}`,
                    status: "done",
                    url,
                    storagePath: x?.path || null,
                  }
                : null;
            })
            .filter(Boolean);
        }
      } catch {}
      return [];
    })();
    setServiceImageList(existingServiceImages);

    // Parse existing gallery images
    const existingGallery = (() => {
      try {
        const val = Array.isArray(record.gallery) ? record.gallery : [];
        return val.map((url, i) => ({
          uid: `existing-gal-${i}`,
          name: `Gallery ${i + 1}`,
          status: "done",
          url: typeof url === "string" ? url : url?.url || "",
          storagePath: null,
        }));
      } catch {}
      return [];
    })();
    setGalleryImageList(existingGallery);

    // Parse values for form
    const formValues = {
      ...record,
      // Convert time strings to dayjs for TimePicker
      start_time: record.start_time
        ? dayjs(record.start_time, "HH:mm:ss")
        : null,
      end_time: record.end_time ? dayjs(record.end_time, "HH:mm:ss") : null,
      // Parse days jsonb to array
      days: Array.isArray(record.days)
        ? record.days
        : typeof record.days === "string"
          ? JSON.parse(record.days || "[]")
          : [],
      // Parse highlights jsonb
      highlights: Array.isArray(record.highlights) ? record.highlights : [],
      // Parse tags jsonb
      tags: Array.isArray(record.tags) ? record.tags : [],
      // Parse gallery jsonb
      gallery: Array.isArray(record.gallery) ? record.gallery : [],
      // Parse languages_offered jsonb
      languages_offered: Array.isArray(record.languages_offered)
        ? record.languages_offered
        : ["English"],
      // Parse service_image jsonb to comma-separated URLs for easy editing
      service_image_urls: (() => {
        try {
          const val =
            typeof record.service_image === "string"
              ? JSON.parse(record.service_image)
              : record.service_image;
          if (Array.isArray(val)) {
            return val
              .map((x) => (typeof x === "string" ? x : x?.url))
              .filter(Boolean)
              .join("\n");
          }
          if (typeof val?.url === "string") return val.url;
          if (Array.isArray(val?.url)) return val.url.join("\n");
        } catch {}
        return "";
      })(),
      // Parse cancellation_policy jsonb
      cancellation_policy_type:
        typeof record.cancellation_policy === "object"
          ? record.cancellation_policy?.type || "no_cancellation"
          : "no_cancellation",
      cancellation_policy_details:
        typeof record.cancellation_policy === "object"
          ? record.cancellation_policy?.details || ""
          : "",
    };

    form.setFieldsValue(formValues);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase.from("services").delete().eq("id", id);

      if (error) throw error;
      message.success("Service deleted successfully");
      fetchServices();
    } catch (error) {
      console.error("Error deleting service:", error);
      message.error("Failed to delete service");
    }
  };

  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);

      // Build the payload matching the DB schema
      const payload = {
        service_name: values.service_name,
        service_description: values.service_description,
        location: values.location || null,
        service_type: values.service_type || "tour",
        category: values.category || null,
        subcategory: values.subcategory || null,
        default_price: values.default_price ?? null,
        duration: values.duration ?? null,
        daily_slots: values.daily_slots ?? null,
        start_time: values.start_time
          ? dayjs(values.start_time).format("HH:mm:ss")
          : null,
        end_time: values.end_time
          ? dayjs(values.end_time).format("HH:mm:ss")
          : null,
        days: values.days || [],
        overview: values.overview || null,
        highlights: values.highlights?.filter(Boolean) || [],
        important_info: values.important_info || null,
        meeting_point: values.meeting_point || null,
        cancellation_policy: {
          type: values.cancellation_policy_type || "no_cancellation",
          details:
            values.cancellation_policy_details ||
            "No cancellations, refunds, or changes can be made",
        },
        // Use uploaded images from state instead of parsing textarea
        service_image: serviceImageList.map((f) => ({
          url: f.url,
          ...(f.storagePath ? { path: f.storagePath } : {}),
        })),
        gallery: galleryImageList.map((f) => f.url),
        tags: values.tags || [],
        languages_offered: values.languages_offered || ["English"],
        min_advance_booking: values.min_advance_booking ?? 0,
        max_advance_booking: values.max_advance_booking ?? 365,
        instant_confirmation: values.instant_confirmation ?? true,
        mobile_voucher: values.mobile_voucher ?? true,
        is_active: values.is_active ?? true,
      };

      if (editingService) {
        const { error } = await supabase
          .from("services")
          .update(payload)
          .eq("id", editingService.id);

        if (error) throw error;
        message.success("Service updated successfully");
      } else {
        const { error } = await supabase.from("services").insert([payload]);

        if (error) throw error;
        message.success("Service created successfully");
      }

      setModalVisible(false);
      form.resetFields();
      fetchServices();
    } catch (error) {
      console.error("Error saving service:", error);
      message.error("Failed to save service");
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      title: "Image",
      dataIndex: "service_image",
      key: "service_image",
      width: 70,
      render: (img) => {
        const url = getFirstImage(img);
        return url ? (
          <Image
            src={url}
            alt="Service"
            width={50}
            height={50}
            style={{ objectFit: "cover", borderRadius: 6 }}
            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN88P/BfwAJhAPk3KFb2AAAAABJRU5ErkJggg=="
          />
        ) : (
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: 6,
              background: "#f0f0f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ccc",
              fontSize: 12,
            }}
          >
            No img
          </div>
        );
      },
    },
    {
      title: "Service Name",
      dataIndex: "service_name",
      key: "service_name",
      sorter: (a, b) =>
        (a.service_name || "").localeCompare(b.service_name || ""),
    },
    {
      title: "Type",
      dataIndex: "service_type",
      key: "service_type",
      render: (type) => (
        <Tag color="blue" style={{ textTransform: "capitalize" }}>
          {type || "tour"}
        </Tag>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      filters: CATEGORIES.map((c) => ({ text: c.label, value: c.value })),
      onFilter: (value, record) => record.category === value,
    },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
      ellipsis: true,
    },
    {
      title: "Default Price",
      dataIndex: "default_price",
      key: "default_price",
      render: (price) =>
        price != null
          ? `AED ${Number(price).toLocaleString("en-AE", { minimumFractionDigits: 2 })}`
          : "—",
      sorter: (a, b) => (a.default_price || 0) - (b.default_price || 0),
    },
    {
      title: "Duration",
      dataIndex: "duration",
      key: "duration",
      render: (d) => (d ? `${d} hrs` : "—"),
    },
    {
      title: "Daily Slots",
      dataIndex: "daily_slots",
      key: "daily_slots",
      render: (s) => s ?? "—",
    },
    {
      title: "Status",
      dataIndex: "is_active",
      key: "is_active",
      render: (is_active) => (
        <Tag color={is_active ? "green" : "red"}>
          {is_active ? "Active" : "Inactive"}
        </Tag>
      ),
      filters: [
        { text: "Active", value: true },
        { text: "Inactive", value: false },
      ],
      onFilter: (value, record) => record.is_active === value,
    },
    {
      title: "Actions",
      key: "actions",
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => setDetailDrawer(record)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this service?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Button type="link" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Tabs config for the form modal
  const formTabs = [
    {
      key: "basic",
      label: "Basic Info",
      children: (
        <>
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                name="service_name"
                label="Service Name"
                rules={[
                  { required: true, message: "Please enter service name" },
                ]}
              >
                <Input placeholder="e.g., Desert Safari Adventure" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="service_type"
                label="Service Type"
                rules={[{ required: true, message: "Please select type" }]}
              >
                <Select placeholder="Select type">
                  {SERVICE_TYPES.map((t) => (
                    <Option key={t.value} value={t.value}>
                      {t.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="service_description"
            label="Description"
            rules={[{ required: true, message: "Please enter description" }]}
          >
            <TextArea rows={3} placeholder="Brief description shown on cards" />
          </Form.Item>

          <Form.Item name="overview" label="Overview">
            <TextArea
              rows={4}
              placeholder="Detailed overview shown on booking page"
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="category"
                label="Category"
                rules={[{ required: true, message: "Please select category" }]}
              >
                <Select placeholder="Select category">
                  {CATEGORIES.map((c) => (
                    <Option key={c.value} value={c.value}>
                      {c.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="subcategory" label="Subcategory">
                <Input placeholder="e.g., morning-safari, evening-cruise" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="location" label="Location">
                <Input placeholder="e.g., Dubai, Abu Dhabi" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="default_price"
                label="Default Price (AED)"
                rules={[{ required: true, message: "Please enter price" }]}
              >
                <InputNumber
                  min={0}
                  step={1}
                  style={{ width: "100%" }}
                  placeholder="0"
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="is_active"
                label="Active"
                valuePropName="checked"
              >
                <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="instant_confirmation"
                label="Instant Confirmation"
                valuePropName="checked"
              >
                <Switch checkedChildren="Yes" unCheckedChildren="No" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="mobile_voucher"
                label="Mobile Voucher"
                valuePropName="checked"
              >
                <Switch checkedChildren="Yes" unCheckedChildren="No" />
              </Form.Item>
            </Col>
          </Row>
        </>
      ),
    },
    {
      key: "schedule",
      label: "Schedule & Availability",
      children: (
        <>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item dependencies={["start_time", "end_time"]} noStyle>
                {({ getFieldValue }) => {
                  const hasStartAndEnd =
                    getFieldValue("start_time") && getFieldValue("end_time");
                  return (
                    <Form.Item
                      name="duration"
                      label="Duration (hours)"
                      extra={
                        hasStartAndEnd
                          ? "Auto-calculated from start & end time"
                          : "Set start & end time to auto-calculate, or enter manually"
                      }
                    >
                      <InputNumber
                        min={0}
                        step={0.5}
                        style={{ width: "100%" }}
                        placeholder={
                          hasStartAndEnd ? "Auto-calculated" : "e.g., 3"
                        }
                        disabled={hasStartAndEnd}
                      />
                    </Form.Item>
                  );
                }}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="start_time" label="Start Time">
                <TimePicker
                  format="HH:mm"
                  style={{ width: "100%" }}
                  onChange={handleTimeChange}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="end_time" label="End Time">
                <TimePicker
                  format="HH:mm"
                  style={{ width: "100%" }}
                  onChange={handleTimeChange}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="daily_slots"
            label="Daily Slots (max bookings per day)"
          >
            <InputNumber
              min={0}
              style={{ width: "100%" }}
              placeholder="e.g., 50"
            />
          </Form.Item>

          <Form.Item name="days" label="Available Days">
            <Checkbox.Group>
              <Row>
                {ALL_DAYS.map((day) => (
                  <Col span={8} key={day}>
                    <Checkbox value={day} style={{ marginBottom: 8 }}>
                      {day}
                    </Checkbox>
                  </Col>
                ))}
              </Row>
            </Checkbox.Group>
          </Form.Item>

          <Divider />

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="min_advance_booking"
                label="Min Advance Booking (days)"
              >
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  placeholder="0"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="max_advance_booking"
                label="Max Advance Booking (days)"
              >
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  placeholder="365"
                />
              </Form.Item>
            </Col>
          </Row>
        </>
      ),
    },
    {
      key: "media",
      label: "Images & Media",
      children: (
        <>
          <div style={{ marginBottom: 8 }}>
            <Text strong>
              Service Images{" "}
              <Text type="secondary">(shown on cards &amp; detail page)</Text>
            </Text>
            <div style={{ marginTop: 4, marginBottom: 4 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Upload images directly to Supabase Storage. First image is the
                main thumbnail. Max 5MB per image.
              </Text>
            </div>
          </div>
          <Upload {...serviceImageUploadProps}>
            {serviceImageList.length < 10 && (
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>
                  {uploading ? "Uploading..." : "Upload"}
                </div>
              </div>
            )}
          </Upload>

          <Divider />

          <div style={{ marginBottom: 8 }}>
            <Text strong>
              Gallery Images{" "}
              <Text type="secondary">(additional gallery on detail page)</Text>
            </Text>
          </div>
          <Upload {...galleryImageUploadProps}>
            {galleryImageList.length < 20 && (
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>
                  {uploading ? "Uploading..." : "Upload"}
                </div>
              </div>
            )}
          </Upload>

          <Divider />

          <Form.Item
            name="service_image_urls"
            label="Or paste image URLs manually (one per line)"
            extra="You can mix uploaded images with pasted URLs. Both will be saved."
          >
            <TextArea
              rows={3}
              placeholder={`https://example.com/image1.jpg\nhttps://example.com/image2.jpg`}
            />
          </Form.Item>
        </>
      ),
    },
    {
      key: "details",
      label: "Details & Info",
      children: (
        <>
          <Form.List name="highlights">
            {(fields, { add, remove }) => (
              <>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <Text strong>Highlights</Text>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    icon={<PlusOutlined />}
                    size="small"
                  >
                    Add Highlight
                  </Button>
                </div>
                {fields.map(({ key, name, ...restField }) => (
                  <Row
                    key={key}
                    gutter={8}
                    align="middle"
                    style={{ marginBottom: 4 }}
                  >
                    <Col flex="auto">
                      <Form.Item {...restField} name={name} noStyle>
                        <Input placeholder="e.g., BBQ Dinner included" />
                      </Form.Item>
                    </Col>
                    <Col>
                      <MinusCircleOutlined
                        onClick={() => remove(name)}
                        style={{ color: "#ff4d4f" }}
                      />
                    </Col>
                  </Row>
                ))}
              </>
            )}
          </Form.List>

          <Divider />

          <Form.Item name="important_info" label="Important Information">
            <TextArea
              rows={3}
              placeholder="e.g., Bring sunscreen, comfortable clothing required"
            />
          </Form.Item>

          <Form.Item name="meeting_point" label="Meeting Point">
            <Input placeholder="e.g., Hotel lobby pickup, Marina Gate 1" />
          </Form.Item>

          <Divider />

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="cancellation_policy_type"
                label="Cancellation Policy"
              >
                <Select>
                  <Option value="no_cancellation">No Cancellation</Option>
                  <Option value="free_cancellation">Free Cancellation</Option>
                  <Option value="partial_refund">Partial Refund</Option>
                  <Option value="flexible">Flexible</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="cancellation_policy_details"
                label="Policy Details"
              >
                <Input placeholder="Details about cancellation policy" />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <Form.Item name="languages_offered" label="Languages Offered">
            <Select mode="tags" placeholder="Add languages">
              <Option value="English">English</Option>
              <Option value="Arabic">Arabic</Option>
              <Option value="Hindi">Hindi</Option>
              <Option value="French">French</Option>
              <Option value="German">German</Option>
              <Option value="Spanish">Spanish</Option>
              <Option value="Chinese">Chinese</Option>
              <Option value="Russian">Russian</Option>
            </Select>
          </Form.Item>

          <Form.Item name="tags" label="Tags (for search & filtering)">
            <Select
              mode="tags"
              placeholder="Add tags, e.g., family-friendly, romantic"
            >
              <Option value="family-friendly">Family Friendly</Option>
              <Option value="romantic">Romantic</Option>
              <Option value="adventure">Adventure</Option>
              <Option value="luxury">Luxury</Option>
              <Option value="budget">Budget</Option>
              <Option value="popular">Popular</Option>
            </Select>
          </Form.Item>
        </>
      ),
    },
  ];

  return (
    <div>
      <Card
        title="Services Management"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Add Service
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={services}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} services`,
          }}
        />
      </Card>

      {/* Create / Edit Modal */}
      <Modal
        title={editingService ? "Edit Service" : "Add New Service"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText={editingService ? "Update" : "Create"}
        confirmLoading={submitting}
        width={860}
        styles={{ body: { maxHeight: "70vh", overflowY: "auto" } }}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            is_active: true,
            service_type: "tour",
            instant_confirmation: true,
            mobile_voucher: true,
            min_advance_booking: 0,
            max_advance_booking: 365,
            languages_offered: ["English"],
            cancellation_policy_type: "no_cancellation",
            cancellation_policy_details:
              "No cancellations, refunds, or changes can be made",
            days: ALL_DAYS,
          }}
          preserve={false}
        >
          <Tabs items={formTabs} />
        </Form>
      </Modal>

      {/* Detail Preview Modal */}
      <Modal
        title="Service Details"
        open={!!detailDrawer}
        onCancel={() => setDetailDrawer(null)}
        footer={
          <Space>
            <Button onClick={() => setDetailDrawer(null)}>Close</Button>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => {
                const rec = detailDrawer;
                setDetailDrawer(null);
                handleEdit(rec);
              }}
            >
              Edit
            </Button>
          </Space>
        }
        width={700}
        styles={{ body: { maxHeight: "70vh", overflowY: "auto" } }}
      >
        {detailDrawer && (
          <div>
            {/* Images */}
            {(() => {
              const url = getFirstImage(detailDrawer.service_image);
              return url ? (
                <Image
                  src={url}
                  alt={detailDrawer.service_name}
                  style={{
                    width: "100%",
                    maxHeight: 300,
                    objectFit: "cover",
                    borderRadius: 8,
                    marginBottom: 16,
                  }}
                />
              ) : null;
            })()}

            <Title level={4}>{detailDrawer.service_name}</Title>

            <Space wrap style={{ marginBottom: 12 }}>
              <Tag color="blue" style={{ textTransform: "capitalize" }}>
                {detailDrawer.service_type || "tour"}
              </Tag>
              {detailDrawer.category && (
                <Tag color="purple">{detailDrawer.category}</Tag>
              )}
              <Tag color={detailDrawer.is_active ? "green" : "red"}>
                {detailDrawer.is_active ? "Active" : "Inactive"}
              </Tag>
              {detailDrawer.instant_confirmation && (
                <Tag color="cyan">Instant Confirmation</Tag>
              )}
              {detailDrawer.mobile_voucher && (
                <Tag color="orange">Mobile Voucher</Tag>
              )}
            </Space>

            <Divider style={{ margin: "12px 0" }} />

            <Row gutter={[16, 8]}>
              <Col span={12}>
                <Text type="secondary">Location</Text>
                <div>{detailDrawer.location || "—"}</div>
              </Col>
              <Col span={12}>
                <Text type="secondary">Default Price</Text>
                <div>
                  {detailDrawer.default_price != null
                    ? `AED ${Number(detailDrawer.default_price).toLocaleString("en-AE", { minimumFractionDigits: 2 })}`
                    : "—"}
                </div>
              </Col>
              <Col span={8}>
                <Text type="secondary">Duration</Text>
                <div>
                  {detailDrawer.duration
                    ? `${detailDrawer.duration} hours`
                    : "—"}
                </div>
              </Col>
              <Col span={8}>
                <Text type="secondary">Operating Hours</Text>
                <div>
                  {detailDrawer.start_time || detailDrawer.end_time
                    ? `${detailDrawer.start_time || "—"} – ${detailDrawer.end_time || "—"}`
                    : "—"}
                </div>
              </Col>
              <Col span={8}>
                <Text type="secondary">Daily Slots</Text>
                <div>{detailDrawer.daily_slots ?? "—"}</div>
              </Col>
            </Row>

            {detailDrawer.days && (
              <>
                <Divider style={{ margin: "12px 0" }} />
                <Text type="secondary">Available Days</Text>
                <div style={{ marginTop: 4 }}>
                  {(Array.isArray(detailDrawer.days)
                    ? detailDrawer.days
                    : []
                  ).map((day) => (
                    <Tag key={day} style={{ marginBottom: 4 }}>
                      {day}
                    </Tag>
                  ))}
                </div>
              </>
            )}

            {detailDrawer.service_description && (
              <>
                <Divider style={{ margin: "12px 0" }} />
                <Text type="secondary">Description</Text>
                <div style={{ whiteSpace: "pre-wrap" }}>
                  {detailDrawer.service_description}
                </div>
              </>
            )}

            {detailDrawer.overview && (
              <>
                <Divider style={{ margin: "12px 0" }} />
                <Text type="secondary">Overview</Text>
                <div style={{ whiteSpace: "pre-wrap" }}>
                  {detailDrawer.overview}
                </div>
              </>
            )}

            {Array.isArray(detailDrawer.highlights) &&
              detailDrawer.highlights.length > 0 && (
                <>
                  <Divider style={{ margin: "12px 0" }} />
                  <Text type="secondary">Highlights</Text>
                  <ul style={{ paddingLeft: 20, marginTop: 4 }}>
                    {detailDrawer.highlights.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </>
              )}

            {detailDrawer.important_info && (
              <>
                <Divider style={{ margin: "12px 0" }} />
                <Text type="secondary">Important Information</Text>
                <div style={{ whiteSpace: "pre-wrap" }}>
                  {detailDrawer.important_info}
                </div>
              </>
            )}

            {detailDrawer.meeting_point && (
              <>
                <Divider style={{ margin: "12px 0" }} />
                <Text type="secondary">Meeting Point</Text>
                <div>{detailDrawer.meeting_point}</div>
              </>
            )}

            {detailDrawer.cancellation_policy && (
              <>
                <Divider style={{ margin: "12px 0" }} />
                <Text type="secondary">Cancellation Policy</Text>
                <div>
                  {typeof detailDrawer.cancellation_policy === "object"
                    ? `${detailDrawer.cancellation_policy.type || "—"} — ${detailDrawer.cancellation_policy.details || ""}`
                    : detailDrawer.cancellation_policy}
                </div>
              </>
            )}

            {Array.isArray(detailDrawer.languages_offered) &&
              detailDrawer.languages_offered.length > 0 && (
                <>
                  <Divider style={{ margin: "12px 0" }} />
                  <Text type="secondary">Languages</Text>
                  <div style={{ marginTop: 4 }}>
                    {detailDrawer.languages_offered.map((lang) => (
                      <Tag key={lang}>{lang}</Tag>
                    ))}
                  </div>
                </>
              )}

            {Array.isArray(detailDrawer.tags) &&
              detailDrawer.tags.length > 0 && (
                <>
                  <Divider style={{ margin: "12px 0" }} />
                  <Text type="secondary">Tags</Text>
                  <div style={{ marginTop: 4 }}>
                    {detailDrawer.tags.map((tag) => (
                      <Tag key={tag} color="geekblue">
                        {tag}
                      </Tag>
                    ))}
                  </div>
                </>
              )}

            <Divider style={{ margin: "12px 0" }} />
            <Row gutter={[16, 8]}>
              <Col span={8}>
                <Text type="secondary">Avg Rating</Text>
                <div>{detailDrawer.average_rating ?? 0} ⭐</div>
              </Col>
              <Col span={8}>
                <Text type="secondary">Total Reviews</Text>
                <div>{detailDrawer.total_reviews ?? 0}</div>
              </Col>
              <Col span={8}>
                <Text type="secondary">Advance Booking</Text>
                <div>
                  {detailDrawer.min_advance_booking ?? 0}–
                  {detailDrawer.max_advance_booking ?? 365} days
                </div>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default Services;

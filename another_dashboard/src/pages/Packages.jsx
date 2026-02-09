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
  InputNumber,
  Select,
  message,
  Popconfirm,
  Typography,
  Divider,
  Row,
  Col,
  Alert,
  Tabs,
  Spin,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  MinusCircleOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { supabase } from "../lib/supabase";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

// ==================== LOGGING UTILITIES ====================
const log = {
  info: (msg, data = null) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ℹ️ [Packages] ${msg}`, data || "");
  },
  success: (msg, data = null) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ✅ [Packages] ${msg}`, data || "");
  },
  error: (msg, error = null) => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ❌ [Packages] ${msg}`, error || "");
  },
  warn: (msg, data = null) => {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] ⚠️ [Packages] ${msg}`, data || "");
  },
};

const Packages = () => {
  const [loading, setLoading] = useState(false);
  const [packages, setPackages] = useState([]);
  const [services, setServices] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [validationErrors, setValidationErrors] = useState({});
  const packageType = Form.useWatch("package_type", form);

  // ==================== VALIDATION FUNCTIONS ====================
  const validateBasicInfo = () => {
    const values = form.getFieldsValue();
    const errors = [];

    if (!values.name?.trim()) errors.push("Package name is required");
    if (!values.service_id) errors.push("Service selection is required");
    if (!values.price || values.price <= 0)
      errors.push("Valid selling price is required");

    log.info("Basic info validation", { valid: errors.length === 0, errors });
    return errors;
  };

  const validateIncludes = () => {
    // Includes/Excludes are optional, no strict validation needed
    log.info("Includes/Excludes validation", { valid: true, errors: [] });
    return [];
  };

  const validateDetails = () => {
    // Details tab has no required fields
    log.info("Details validation", { valid: true, errors: [] });
    return [];
  };

  const validateCombo = () => {
    const values = form.getFieldsValue();
    const errors = [];

    if (values.package_type === "combo") {
      if (!values.combo_items || values.combo_items.length === 0) {
        errors.push("At least one combo item is required for combo packages");
      } else {
        // Validate each combo item
        const invalidItems = values.combo_items.filter(
          (item) => !item?.name || !item?.price,
        );
        if (invalidItems.length > 0) {
          errors.push("All combo items must have a name and price");
        }
      }
    }

    log.info("Combo validation", {
      valid: errors.length === 0,
      errors,
      packageType: values.package_type,
      comboItemsCount: values.combo_items?.length || 0,
    });
    return errors;
  };

  const validateCancellation = () => {
    // Cancellation policy has defaults, no strict validation needed
    log.info("Cancellation validation", { valid: true, errors: [] });
    return [];
  };

  const validateAllTabs = () => {
    const basicErrors = validateBasicInfo();
    const includesErrors = validateIncludes();
    const detailsErrors = validateDetails();
    const comboErrors = validateCombo();
    const cancellationErrors = validateCancellation();

    const allErrors = {
      basic: basicErrors,
      includes: includesErrors,
      details: detailsErrors,
      combo: comboErrors,
      cancellation: cancellationErrors,
    };

    setValidationErrors(allErrors);

    const hasErrors = basicErrors.length > 0 || comboErrors.length > 0;

    if (hasErrors) {
      // Find first tab with errors and switch to it
      if (basicErrors.length > 0) {
        setActiveTab("basic");
        message.error("Please fill all required fields in Basic Info tab");
      } else if (comboErrors.length > 0) {
        setActiveTab("combo");
        message.error("Please complete combo package configuration");
      }
    }

    log.info("Full validation result", { allErrors, hasErrors });
    return !hasErrors;
  };

  // Get tab label with validation indicator
  const getTabLabel = (key, label) => {
    const errors = validationErrors[key] || [];
    const hasErrors = errors.length > 0;

    return (
      <span>
        {label}
        {hasErrors && (
          <Tooltip title={errors.join(", ")}>
            <ExclamationCircleOutlined
              style={{ color: "#ff4d4f", marginLeft: 6 }}
            />
          </Tooltip>
        )}
        {!hasErrors && validationErrors[key] !== undefined && (
          <CheckCircleOutlined style={{ color: "#52c41a", marginLeft: 6 }} />
        )}
      </span>
    );
  };

  useEffect(() => {
    log.info("Component mounted, fetching initial data");
    fetchPackages();
    fetchServices();
  }, []);

  const fetchPackages = async () => {
    log.info("Fetching packages from database");
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("packages")
        .select(
          `
          *,
          services:service_id(id, service_name)
        `,
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPackages(data || []);
      log.success(`Fetched ${data?.length || 0} packages`);
    } catch (error) {
      message.error("Failed to fetch packages");
      log.error("Failed to fetch packages", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    log.info("Fetching services for dropdown");
    const { data, error } = await supabase
      .from("services")
      .select("id, service_name");
    if (error) {
      log.error("Failed to fetch services", error);
    } else {
      setServices(data || []);
      log.success(`Fetched ${data?.length || 0} services for dropdown`);
    }
  };

  const handleCreate = () => {
    log.info("Opening create package modal");
    setEditingPackage(null);
    setValidationErrors({});
    setActiveTab("basic");
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    log.info(`Opening edit modal for package: ${record.name}`, {
      id: record.id,
    });
    setEditingPackage(record);
    setValidationErrors({});
    setActiveTab("basic");
    
    // Reset form first, then set values
    form.resetFields();
    
    // Prepare the form values
    const formValues = {
      name: record.name,
      description: record.description,
      service_id: record.service_id,
      price: record.price,
      duration: record.duration,
      pricing_type: record.pricing_type || "fixed",
      min_duration: record.min_duration,
      max_duration: record.max_duration,
      max_guests: record.max_guests,
      includes: record.includes || [],
      excludes: record.excludes || [],
      package_type: record.package_type || "standard",
      original_price: record.original_price || null,
      combo_items: record.combo_items || [],
      cancellation_policy_type:
        typeof record.cancellation_policy === "object"
          ? record.cancellation_policy?.type || "no_cancellation"
          : "no_cancellation",
      cancellation_policy_details:
        typeof record.cancellation_policy === "object"
          ? record.cancellation_policy?.details || ""
          : "",
      // Package detail fields
      confirmation_type: record.confirmation_type || "instant",
      voucher_type: record.voucher_type || "mobile",
      how_to_use: record.how_to_use || [],
      eligibility: record.eligibility || [],
      terms: record.terms || [],
      opening_hours: record.opening_hours || "",
      address: record.address || "",
      how_to_get_there: record.how_to_get_there || "",
    };
    
    log.info("Setting form values for edit", formValues);
    
    // Set modal visible first, then set form values after a tick
    setModalVisible(true);
    
    // Use setTimeout to ensure form is mounted before setting values
    setTimeout(() => {
      form.setFieldsValue(formValues);
      log.success("Form values set for editing");
    }, 0);
  };

  const handleDelete = async (id) => {
    log.info(`Deleting package with ID: ${id}`);
    try {
      const { error } = await supabase.from("packages").delete().eq("id", id);
      if (error) throw error;
      message.success("Package deleted successfully");
      log.success(`Package deleted: ${id}`);
      fetchPackages();
    } catch (error) {
      message.error("Failed to delete package");
      log.error(`Failed to delete package ${id}`, error);
    }
  };

  const handleSubmit = async (values) => {
    log.info("Form submission started", {
      isEdit: !!editingPackage,
      packageName: values.name,
      packageType: values.package_type,
    });

    // Run validation before submission
    if (!validateAllTabs()) {
      log.warn("Validation failed, submission blocked");
      return;
    }

    setSubmitting(true);
    try {
      // For combo packages, calculate original_price from combo_items if not manually set
      let calculatedOriginalPrice = values.original_price;
      if (values.package_type === "combo" && values.combo_items?.length > 0) {
        const itemsTotal = values.combo_items.reduce(
          (sum, item) => sum + (item?.price || 0),
          0,
        );
        // Use calculated total if original_price not manually overridden
        if (!calculatedOriginalPrice || calculatedOriginalPrice === 0) {
          calculatedOriginalPrice = itemsTotal;
          log.info(
            `Auto-calculated original price from combo items: ${calculatedOriginalPrice} AED`,
          );
        }
      }

      const packageData = {
        name: values.name,
        description: values.description,
        service_id: values.service_id,
        price: values.price,
        duration: values.duration,
        pricing_type: values.pricing_type,
        min_duration: values.min_duration,
        max_duration: values.max_duration,
        max_guests: values.max_guests,
        includes: values.includes || [],
        excludes: values.excludes || [],
        package_type: values.package_type || "standard",
        original_price:
          values.package_type === "combo" ? calculatedOriginalPrice : null,
        combo_items:
          values.package_type === "combo" ? values.combo_items || [] : [],
        cancellation_policy: {
          type: values.cancellation_policy_type || "no_cancellation",
          details:
            values.cancellation_policy_details ||
            "No cancellations, refunds, or changes can be made",
        },
        // Package detail fields for frontend display
        confirmation_type: values.confirmation_type || "instant",
        voucher_type: values.voucher_type || "mobile",
        how_to_use: values.how_to_use || [],
        eligibility: values.eligibility || [],
        terms: values.terms || [],
        opening_hours: values.opening_hours || "",
        address: values.address || "",
        how_to_get_there: values.how_to_get_there || "",
      };

      log.info("Prepared package data for save", {
        name: packageData.name,
        price: packageData.price,
        service_id: packageData.service_id,
        package_type: packageData.package_type,
        includesCount: packageData.includes.length,
        excludesCount: packageData.excludes.length,
      });

      if (editingPackage) {
        log.info(`Updating package ID: ${editingPackage.id}`);
        const { error } = await supabase
          .from("packages")
          .update(packageData)
          .eq("id", editingPackage.id);
        if (error) throw error;
        message.success("Package updated successfully");
        log.success(
          `Package updated: ${editingPackage.id} - ${packageData.name}`,
        );
      } else {
        log.info("Creating new package");
        const { data, error } = await supabase
          .from("packages")
          .insert([packageData])
          .select();
        if (error) throw error;
        message.success("Package created successfully");
        log.success(`Package created: ${data?.[0]?.id} - ${packageData.name}`);
      }

      setModalVisible(false);
      form.resetFields();
      setValidationErrors({});
      fetchPackages();
    } catch (error) {
      message.error("Failed to save package");
      log.error("Failed to save package", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleModalClose = () => {
    log.info("Closing modal");
    setModalVisible(false);
    form.resetFields();
    setValidationErrors({});
    setActiveTab("basic");
  };

  const filteredPackages = packages.filter((pkg) => {
    const searchLower = searchText.toLowerCase();
    return (
      pkg.name?.toLowerCase().includes(searchLower) ||
      pkg.services?.service_name?.toLowerCase().includes(searchLower)
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
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name?.localeCompare(b.name),
    },
    {
      title: "Service",
      dataIndex: ["services", "service_name"],
      key: "service",
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (price) => (price ? `${price} AED` : "-"),
      sorter: (a, b) => (a.price || 0) - (b.price || 0),
    },
    {
      title: "Pricing Type",
      dataIndex: "pricing_type",
      key: "pricing_type",
      render: (type) => (
        <Tag color={type === "fixed" ? "blue" : "green"}>{type || "fixed"}</Tag>
      ),
    },
    {
      title: "Duration",
      dataIndex: "duration",
      key: "duration",
    },
    {
      title: "Type",
      dataIndex: "package_type",
      key: "package_type",
      render: (type) => (
        <Tag color={type === "combo" ? "orange" : "default"}>
          {type === "combo" ? "Combo" : "Standard"}
        </Tag>
      ),
    },
    {
      title: "Cancellation",
      key: "cancellation",
      render: (_, record) => {
        const policy = record.cancellation_policy;
        if (typeof policy === "object" && policy?.type) {
          return (
            <Tag
              color={
                policy.type === "free_cancellation"
                  ? "green"
                  : policy.type === "flexible"
                    ? "blue"
                    : policy.type === "partial_refund"
                      ? "gold"
                      : "red"
              }
            >
              {policy.type
                .replace(/_/g, " ")
                .replace(/\b\w/g, (c) => c.toUpperCase())}
            </Tag>
          );
        }
        return <Tag>-</Tag>;
      },
    },
    {
      title: "Max Guests",
      dataIndex: "max_guests",
      key: "max_guests",
      render: (guests) => guests || "-",
    },
    {
      title: "Includes",
      dataIndex: "includes",
      key: "includes",
      render: (items) =>
        items?.length > 0 ? (
          <Space wrap>
            {items.slice(0, 2).map((item, i) => (
              <Tag key={i} color="green">
                {item}
              </Tag>
            ))}
            {items.length > 2 && <Tag>+{items.length - 2}</Tag>}
          </Space>
        ) : (
          "-"
        ),
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
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Delete this package?"
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
          Packages
        </Title>
        <Space wrap>
          <Input
            placeholder="Search packages..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            Add Package
          </Button>
        </Space>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={filteredPackages}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} packages`,
          }}
        />
      </Card>

      <Modal
        title={
          <Space>
            {editingPackage ? "Edit Package" : "Create Package"}
            {submitting && <Spin size="small" />}
          </Space>
        }
        open={modalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={850}
        styles={{ body: { maxHeight: "70vh", overflowY: "auto" } }}
        forceRender
      >
        {/* Validation Summary Alert */}
        {Object.values(validationErrors).some(
          (errors) => errors.length > 0,
        ) && (
          <Alert
            type="warning"
            showIcon
            icon={<ExclamationCircleOutlined />}
            message="Please fix the following issues before saving:"
            description={
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {Object.entries(validationErrors)
                  .filter(([_, errors]) => errors.length > 0)
                  .map(([tab, errors]) => (
                    <li key={tab}>
                      <strong>
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}:
                      </strong>{" "}
                      {errors.join(", ")}
                    </li>
                  ))}
              </ul>
            }
            style={{ marginBottom: 16 }}
          />
        )}

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Tabs
            activeKey={activeTab}
            onChange={(key) => {
              setActiveTab(key);
              log.info(`Tab changed to: ${key}`);
            }}
            items={[
              {
                key: "basic",
                label: getTabLabel("basic", "Basic Info"),
                children: (
                  <>
                    <Form.Item
                      name="name"
                      label="Package Name"
                      rules={[
                        {
                          required: true,
                          message: "Please enter package name",
                        },
                      ]}
                    >
                      <Input placeholder="e.g., At The Top SKY - Level 148" />
                    </Form.Item>

                    <Form.Item name="description" label="Description">
                      <TextArea
                        rows={3}
                        placeholder="Premium experience with access to the highest observation deck..."
                      />
                    </Form.Item>

                    <Form.Item
                      name="service_id"
                      label="Service"
                      rules={[
                        { required: true, message: "Please select a service" },
                      ]}
                    >
                      <Select placeholder="Select service">
                        {services.map((service) => (
                          <Option key={service.id} value={service.id}>
                            {service.service_name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item
                          name="price"
                          label="Selling Price (AED)"
                          rules={[{ required: true, message: "Required" }]}
                        >
                          <InputNumber min={0} style={{ width: "100%" }} />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          name="pricing_type"
                          label="Pricing Type"
                          initialValue="fixed"
                        >
                          <Select>
                            <Option value="fixed">Fixed</Option>
                            <Option value="per_person">Per Person</Option>
                            <Option value="per_hour">Per Hour</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item name="max_guests" label="Max Guests">
                          <InputNumber min={1} style={{ width: "100%" }} />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item name="duration" label="Duration">
                          <Input placeholder="e.g., 2 hours" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item name="min_duration" label="Min Duration">
                          <Input placeholder="e.g., 1 hour" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item name="max_duration" label="Max Duration">
                          <Input placeholder="e.g., 4 hours" />
                        </Form.Item>
                      </Col>
                    </Row>
                  </>
                ),
              },
              {
                key: "includes",
                label: getTabLabel("includes", "Includes / Excludes"),
                children: (
                  <>
                    <Form.Item label="What's Included">
                      <Form.List name="includes">
                        {(fields, { add, remove }) => (
                          <>
                            {fields.map(({ key, name, ...restField }) => (
                              <Space
                                key={key}
                                style={{ display: "flex", marginBottom: 8 }}
                                align="baseline"
                              >
                                <Form.Item
                                  {...restField}
                                  name={name}
                                  style={{ marginBottom: 0 }}
                                >
                                  <Input
                                    placeholder="e.g., Level 148 VIP lounge access"
                                    style={{ width: 500 }}
                                  />
                                </Form.Item>
                                <MinusCircleOutlined
                                  onClick={() => remove(name)}
                                />
                              </Space>
                            ))}
                            <Button
                              type="dashed"
                              onClick={() => add()}
                              icon={<PlusOutlined />}
                            >
                              Add Include
                            </Button>
                          </>
                        )}
                      </Form.List>
                    </Form.Item>

                    <Divider />

                    <Form.Item label="What's Not Included">
                      <Form.List name="excludes">
                        {(fields, { add, remove }) => (
                          <>
                            {fields.map(({ key, name, ...restField }) => (
                              <Space
                                key={key}
                                style={{ display: "flex", marginBottom: 8 }}
                                align="baseline"
                              >
                                <Form.Item
                                  {...restField}
                                  name={name}
                                  style={{ marginBottom: 0 }}
                                >
                                  <Input
                                    placeholder="e.g., Transportation, Personal expenses"
                                    style={{ width: 500 }}
                                  />
                                </Form.Item>
                                <MinusCircleOutlined
                                  onClick={() => remove(name)}
                                />
                              </Space>
                            ))}
                            <Button
                              type="dashed"
                              onClick={() => add()}
                              icon={<PlusOutlined />}
                            >
                              Add Exclude
                            </Button>
                          </>
                        )}
                      </Form.List>
                    </Form.Item>
                  </>
                ),
              },
              {
                key: "details",
                label: getTabLabel("details", "Package Details"),
                children: (
                  <>
                    <Alert
                      message="These details are shown in the Package Details drawer on the frontend"
                      type="info"
                      showIcon
                      style={{ marginBottom: 16 }}
                    />

                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="confirmation_type"
                          label="Confirmation Type"
                          initialValue="instant"
                        >
                          <Select>
                            <Option value="instant">
                              Instant Confirmation
                            </Option>
                            <Option value="24_hours">
                              Confirmation within 24 hours
                            </Option>
                            <Option value="48_hours">
                              Confirmation within 48 hours
                            </Option>
                            <Option value="manual">Manual Confirmation</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="voucher_type"
                          label="Voucher Type"
                          initialValue="mobile"
                        >
                          <Select>
                            <Option value="mobile">
                              Mobile Voucher (Show on phone)
                            </Option>
                            <Option value="print">
                              Print Voucher Required
                            </Option>
                            <Option value="both">Mobile or Printed</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item label="How to Use">
                      <Form.List name="how_to_use">
                        {(fields, { add, remove }) => (
                          <>
                            {fields.map(({ key, name, ...restField }) => (
                              <Space
                                key={key}
                                style={{ display: "flex", marginBottom: 8 }}
                                align="baseline"
                              >
                                <Form.Item
                                  {...restField}
                                  name={name}
                                  style={{ marginBottom: 0 }}
                                >
                                  <Input
                                    placeholder="e.g., Present your voucher at the ticket counter"
                                    style={{ width: 500 }}
                                  />
                                </Form.Item>
                                <MinusCircleOutlined
                                  onClick={() => remove(name)}
                                />
                              </Space>
                            ))}
                            <Button
                              type="dashed"
                              onClick={() => add()}
                              icon={<PlusOutlined />}
                            >
                              Add Step
                            </Button>
                          </>
                        )}
                      </Form.List>
                    </Form.Item>

                    <Form.Item label="Eligibility / Requirements">
                      <Form.List name="eligibility">
                        {(fields, { add, remove }) => (
                          <>
                            {fields.map(({ key, name, ...restField }) => (
                              <Space
                                key={key}
                                style={{ display: "flex", marginBottom: 8 }}
                                align="baseline"
                              >
                                <Form.Item
                                  {...restField}
                                  name={name}
                                  style={{ marginBottom: 0 }}
                                >
                                  <Input
                                    placeholder="e.g., Minimum age 12 years"
                                    style={{ width: 500 }}
                                  />
                                </Form.Item>
                                <MinusCircleOutlined
                                  onClick={() => remove(name)}
                                />
                              </Space>
                            ))}
                            <Button
                              type="dashed"
                              onClick={() => add()}
                              icon={<PlusOutlined />}
                            >
                              Add Requirement
                            </Button>
                          </>
                        )}
                      </Form.List>
                    </Form.Item>

                    <Form.Item label="Terms & Conditions">
                      <Form.List name="terms">
                        {(fields, { add, remove }) => (
                          <>
                            {fields.map(({ key, name, ...restField }) => (
                              <Space
                                key={key}
                                style={{ display: "flex", marginBottom: 8 }}
                                align="baseline"
                              >
                                <Form.Item
                                  {...restField}
                                  name={name}
                                  style={{ marginBottom: 0 }}
                                >
                                  <Input
                                    placeholder="e.g., Valid ID required for entry"
                                    style={{ width: 500 }}
                                  />
                                </Form.Item>
                                <MinusCircleOutlined
                                  onClick={() => remove(name)}
                                />
                              </Space>
                            ))}
                            <Button
                              type="dashed"
                              onClick={() => add()}
                              icon={<PlusOutlined />}
                            >
                              Add Term
                            </Button>
                          </>
                        )}
                      </Form.List>
                    </Form.Item>

                    <Divider />

                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item name="opening_hours" label="Opening Hours">
                          <Input placeholder="e.g., 10:00 AM - 10:00 PM daily" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="address" label="Venue Address">
                          <Input placeholder="e.g., Burj Khalifa, Downtown Dubai" />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item name="how_to_get_there" label="How to Get There">
                      <TextArea
                        rows={2}
                        placeholder="e.g., Take the Dubai Metro Red Line to Burj Khalifa/Dubai Mall station..."
                      />
                    </Form.Item>
                  </>
                ),
              },
              {
                key: "combo",
                label: (
                  <span>
                    {getTabLabel("combo", "Combo / Pricing")}
                    {packageType === "combo" && (
                      <Tag color="orange" style={{ marginLeft: 4 }}>
                        COMBO
                      </Tag>
                    )}
                  </span>
                ),
                children: (
                  <>
                    <Form.Item
                      name="package_type"
                      label="Package Type"
                      initialValue="standard"
                    >
                      <Select>
                        <Option value="standard">Standard Package</Option>
                        <Option value="combo">Combo Deal</Option>
                      </Select>
                    </Form.Item>

                    {packageType === "combo" && (
                      <>
                        <Alert
                          message="Combo Package Configuration"
                          description={
                            <>
                              Define the items included in this combo. The{" "}
                              <strong>original price</strong> (sum of individual
                              items) will be calculated automatically, or you
                              can override it. The{" "}
                              <strong>selling price</strong> (set in Basic Info)
                              should be lower to show savings.
                            </>
                          }
                          type="info"
                          showIcon
                          style={{ marginBottom: 16 }}
                        />

                        <Form.Item
                          label="Combo Items"
                          extra="Define what's bundled in this combo deal"
                        >
                          <Form.List name="combo_items">
                            {(fields, { add, remove }) => (
                              <>
                                {fields.map(({ key, name, ...restField }) => (
                                  <Row
                                    key={key}
                                    gutter={8}
                                    style={{ marginBottom: 8 }}
                                    align="middle"
                                  >
                                    <Col span={14}>
                                      <Form.Item
                                        {...restField}
                                        name={[name, "name"]}
                                        style={{ marginBottom: 0 }}
                                        rules={[
                                          {
                                            required: true,
                                            message: "Item name required",
                                          },
                                        ]}
                                      >
                                        <Input placeholder="Item name (e.g., Desert Safari)" />
                                      </Form.Item>
                                    </Col>
                                    <Col span={8}>
                                      <Form.Item
                                        {...restField}
                                        name={[name, "price"]}
                                        style={{ marginBottom: 0 }}
                                        rules={[
                                          {
                                            required: true,
                                            message: "Price required",
                                          },
                                        ]}
                                      >
                                        <InputNumber
                                          min={0}
                                          placeholder="Individual price"
                                          style={{ width: "100%" }}
                                          addonAfter="AED"
                                        />
                                      </Form.Item>
                                    </Col>
                                    <Col span={2}>
                                      <MinusCircleOutlined
                                        onClick={() => remove(name)}
                                        style={{ color: "#ff4d4f" }}
                                      />
                                    </Col>
                                  </Row>
                                ))}
                                <Button
                                  type="dashed"
                                  onClick={() => add()}
                                  icon={<PlusOutlined />}
                                  style={{ width: "100%" }}
                                >
                                  Add Combo Item
                                </Button>
                              </>
                            )}
                          </Form.List>
                        </Form.Item>

                        <Form.Item
                          name="original_price"
                          label="Original Price (AED)"
                          extra="Leave empty to auto-calculate from combo items, or override manually"
                        >
                          <InputNumber
                            min={0}
                            style={{ width: 200 }}
                            placeholder="Auto-calculated"
                          />
                        </Form.Item>

                        <Alert
                          message="Pricing Example"
                          description={
                            <>
                              If combo items total <strong>500 AED</strong> and
                              selling price is <strong>399 AED</strong>,
                              customers see "Save 20%" badge.
                            </>
                          }
                          type="success"
                          showIcon
                        />
                      </>
                    )}
                  </>
                ),
              },
              {
                key: "cancellation",
                label: getTabLabel("cancellation", "Cancellation Policy"),
                children: (
                  <>
                    <Alert
                      message="Per-Package Cancellation Policy"
                      description="This policy is shown on the package card and details drawer. If not set, the global site cancellation policy applies."
                      type="info"
                      showIcon
                      style={{ marginBottom: 16 }}
                    />

                    <Row gutter={16}>
                      <Col span={10}>
                        <Form.Item
                          name="cancellation_policy_type"
                          label="Policy Type"
                          initialValue="no_cancellation"
                        >
                          <Select>
                            <Option value="no_cancellation">
                              No Cancellation
                            </Option>
                            <Option value="free_cancellation">
                              Free Cancellation
                            </Option>
                            <Option value="partial_refund">
                              Partial Refund
                            </Option>
                            <Option value="flexible">Flexible</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={14}>
                        <Form.Item
                          name="cancellation_policy_details"
                          label="Policy Details"
                        >
                          <Input placeholder="e.g., Free cancellation up to 48 hours before" />
                        </Form.Item>
                      </Col>
                    </Row>
                  </>
                ),
              },
            ]}
          />

          <Divider />

          <Form.Item style={{ marginBottom: 0 }}>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button onClick={handleModalClose} disabled={submitting}>
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={submitting}
                disabled={submitting}
              >
                {editingPackage ? "Update Package" : "Create Package"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Packages;

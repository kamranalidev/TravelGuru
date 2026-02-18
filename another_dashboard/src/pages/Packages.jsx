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
  Upload,
  Image,
  Switch,
  TimePicker,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  MinusCircleOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  UploadOutlined,
  LoadingOutlined,
  ClockCircleOutlined,
  CarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  supabase,
  uploadImage,
  getImageUrl,
  deleteImage,
  STORAGE_BUCKET,
} from "../lib/supabase";
const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const log = {
  info: (msg, data = null) => {
    const timestamp = new Date().toISOString();
  },
  success: (msg, data = null) => {
    const timestamp = new Date().toISOString();
  },
  error: (msg, error = null) => {
    const timestamp = new Date().toISOString();
  },
  warn: (msg, data = null) => {
    const timestamp = new Date().toISOString();
  },
};
const Packages = () => {
  const [loading, setLoading] = useState(false);
  const [packages, setPackages] = useState([]);
  const [services, setServices] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [selectedService, setSelectedService] = useState(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [validationErrors, setValidationErrors] = useState({});
  const packageType = Form.useWatch("package_type", form);
  const enableTimeSelection = Form.useWatch("enable_time_selection", form);
  const enableTransfer = Form.useWatch("enable_transfer", form);

  const [imageUploading, setImageUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [uploadedImagePath, setUploadedImagePath] = useState(null);

  const [packageImages, setPackageImages] = useState([]);
  const [multiImageUploading, setMultiImageUploading] = useState(false);

  const handleImageUpload = async (file) => {
    try {
      setImageUploading(true);
      log.info("Starting image upload", {
        fileName: file.name,
        fileSize: file.size,
      });

      const path = await uploadImage(file, "packages");
      const publicUrl = getImageUrl(path);

      setUploadedImageUrl(publicUrl);
      setUploadedImagePath(path);
      form.setFieldsValue({ package_image: publicUrl });
      log.success("Image uploaded successfully", { path, publicUrl });
      message.success("Image uploaded successfully");
      return false;
    } catch (error) {
      log.error("Image upload failed", error);
      message.error(
        "Failed to upload image: " + (error.message || "Unknown error"),
      );
      return false;
    } finally {
      setImageUploading(false);
    }
  };
  const handleRemoveImage = async () => {
    try {
      if (uploadedImagePath) {
        log.info("Removing uploaded image", { path: uploadedImagePath });
        await deleteImage(uploadedImagePath);
        log.success("Image deleted from storage");
      }
      setUploadedImageUrl(null);
      setUploadedImagePath(null);
      form.setFieldsValue({ package_image: "" });
      message.success("Image removed");
    } catch (error) {
      log.error("Failed to remove image", error);
      message.error("Failed to remove image");
    }
  };

  const handleMultiImageUpload = async (file) => {
    try {
      setMultiImageUploading(true);
      log.info("Starting multi-image upload", {
        fileName: file.name,
        fileSize: file.size,
        currentCount: packageImages.length,
      });

      const path = await uploadImage(file, "packages");
      const publicUrl = getImageUrl(path);

      const newImage = { url: publicUrl, path: path };
      setPackageImages((prev) => [...prev, newImage]);
      log.success("Image added to gallery", { path, publicUrl });
      message.success("Image added to gallery");
      return false;
    } catch (error) {
      log.error("Multi-image upload failed", error);
      message.error(
        "Failed to upload image: " + (error.message || "Unknown error"),
      );
      return false;
    } finally {
      setMultiImageUploading(false);
    }
  };
  const handleRemoveGalleryImage = async (index) => {
    try {
      const imageToRemove = packageImages[index];
      if (imageToRemove?.path) {
        log.info("Removing gallery image", { path: imageToRemove.path });
        await deleteImage(imageToRemove.path);
        log.success("Image deleted from storage");
      }
      setPackageImages((prev) => prev.filter((_, i) => i !== index));
      message.success("Image removed from gallery");
    } catch (error) {
      log.error("Failed to remove gallery image", error);
      message.error("Failed to remove image");
    }
  };
  const handleReorderImages = (fromIndex, toIndex) => {
    setPackageImages((prev) => {
      const newImages = [...prev];
      const [removed] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, removed);
      return newImages;
    });
  };

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
    log.info("Includes/Excludes validation", { valid: true, errors: [] });
    return [];
  };
  const validateDetails = () => {
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
    // Reset image upload state
    setUploadedImageUrl(null);
    setUploadedImagePath(null);
    setPackageImages([]);
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
    // Set image state if package has image
    if (record.package_image) {
      setUploadedImageUrl(record.package_image);
      // Try to extract path from URL if it's from our storage
      setUploadedImagePath(record.package_image_path || null);
    } else {
      setUploadedImageUrl(null);
      setUploadedImagePath(null);
    }
    // Set multiple images if they exist
    if (record.package_images && Array.isArray(record.package_images)) {
      setPackageImages(record.package_images);
    } else {
      setPackageImages([]);
    }
    // Reset form first, then set values
    form.resetFields();
    // Prepare the form values
    const formValues = {
      name: record.name,
      description: record.description,
      service_id: record.service_id,
      price: record.price,
      child_price: record.child_price,
      infant_price: record.infant_price,
      child_age_range: record.child_age_range || "3-12 years",
      infant_age_range: record.infant_age_range || "0-2 years",
      package_image: record.package_image || "",
      duration: record.duration,
      sub_packages: record.sub_packages || [],
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
      how_to_use: record.how_to_use || [],
      eligibility: record.eligibility || [],
      terms: record.terms || [],
      opening_hours: record.opening_hours || "",
      address: record.address || "",
      how_to_get_there: record.how_to_get_there || "",
      // Time selection & transfer options
      enable_time_selection: record.enable_time_selection || false,
      available_times: Array.isArray(record.available_times)
        ? record.available_times.map((timeStr) => {
            // If it's already a string, keep it as is for the form
            // The TimePicker will be populated via value normalization
            return timeStr;
          })
        : [],
      enable_transfer: record.enable_transfer || false,
      transfer_price: record.transfer_price || null,
      round_trip_price: record.round_trip_price || null,
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
        child_price: values.child_price || null,
        infant_price: values.infant_price || null,
        child_age_range: values.child_age_range || "3-12 years",
        infant_age_range: values.infant_age_range || "0-2 years",
        package_image: values.package_image || null,
        package_image_path: uploadedImagePath || null,
        package_images: packageImages.length > 0 ? packageImages : [],
        duration: values.duration,
        sub_packages: values.sub_packages || [],
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
        how_to_use: values.how_to_use || [],
        eligibility: values.eligibility || [],
        terms: values.terms || [],
        opening_hours: values.opening_hours || "",
        address: values.address || "",
        how_to_get_there: values.how_to_get_there || "",
        // Time selection & transfer options
        enable_time_selection: values.enable_time_selection || false,
        available_times: values.available_times || [],
        enable_transfer: values.enable_transfer || false,
        transfer_price: values.transfer_price || 0,
        round_trip_price: values.round_trip_price || 0,
      };
      log.info("Prepared package data for save", {
        name: packageData.name,
        price: packageData.price,
        child_price: packageData.child_price,
        infant_price: packageData.infant_price,
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
    const matchesSearch =
      pkg.name?.toLowerCase().includes(searchLower) ||
      pkg.services?.service_name?.toLowerCase().includes(searchLower);
    const matchesService = selectedService
      ? pkg.service_id === selectedService
      : true;
    return matchesSearch && matchesService;
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
      title: "Pricing",
      key: "pricing",
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text strong style={{ color: "#1890ff" }}>
            Adult: {record.price || 0} AED
          </Text>
          {record.child_price !== null && record.child_price !== undefined && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              Child: {record.child_price} AED
            </Text>
          )}
          {record.infant_price !== null &&
            record.infant_price !== undefined && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                Infant:{" "}
                {record.infant_price === 0
                  ? "Free"
                  : `${record.infant_price} AED`}
              </Text>
            )}
        </Space>
      ),
      sorter: (a, b) => (a.price || 0) - (b.price || 0),
    },
    {
      title: "Sub-Packages",
      dataIndex: "sub_packages",
      key: "sub_packages",
      render: (subPackages) => (
        <Space direction="vertical" size={2}>
          {Array.isArray(subPackages) && subPackages.length > 0 ? (
            subPackages.slice(0, 3).map((sp, idx) => (
              <Tag key={idx} color="blue">
                {sp.name}: {sp.price} AED
              </Tag>
            ))
          ) : (
            <Text type="secondary">-</Text>
          )}
          {Array.isArray(subPackages) && subPackages.length > 3 && (
            <Text type="secondary" style={{ fontSize: 11 }}>
              +{subPackages.length - 3} more
            </Text>
          )}
        </Space>
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
        <Tag
          color={
            type === "base" ? "gold" : type === "combo" ? "orange" : "default"
          }
        >
          {type === "base"
            ? "⭐ Base"
            : type === "combo"
              ? "Combo"
              : "Standard"}
        </Tag>
      ),
    },
    {
      title: "Image",
      key: "package_image",
      width: 100,
      render: (_, record) => (
        <div style={{ position: "relative", display: "inline-block" }}>
          {record.package_image ? (
            <Image
              src={record.package_image}
              width={50}
              height={50}
              style={{ objectFit: "cover", borderRadius: 4 }}
              fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgesKcf4CAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAB3RJTUUH5AsHCDsxjNyqaQAAAAlwSFlzAAALEwAACxMBAJqcGAAAAARnQU1BAACxjwv8YQUAAABJSURBVHja7cExAQAAAMKg9U9tDQ+gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAC4GXDJAAE90tE9AAAAAElFTkSuQmCC"
            />
          ) : (
            <Text type="secondary">-</Text>
          )}
          {record.package_images && record.package_images.length > 0 && (
            <Tooltip title={`${record.package_images.length} gallery images`}>
              <Tag
                color="blue"
                style={{
                  position: "absolute",
                  bottom: -4,
                  right: -8,
                  fontSize: 10,
                  padding: "0 4px",
                  minHeight: "auto",
                  lineHeight: "16px",
                }}
              >
                +{record.package_images.length}
              </Tag>
            </Tooltip>
          )}
        </div>
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
      title: "Options",
      key: "options",
      width: 140,
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          {record.enable_time_selection && (
            <Tag color="purple" icon={<ClockCircleOutlined />}>
              Time Selection
            </Tag>
          )}
          {record.enable_transfer && (
            <Tag color="cyan" icon={<CarOutlined />}>
              Transfer
            </Tag>
          )}
          {!record.enable_time_selection && !record.enable_transfer && (
            <Text type="secondary">-</Text>
          )}
        </Space>
      ),
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
          <Select
            placeholder="Filter by service"
            allowClear
            style={{ width: 200 }}
            value={selectedService}
            onChange={setSelectedService}
          >
            {services.map((service) => (
              <Option key={service.id} value={service.id}>
                {service.service_name}
              </Option>
            ))}
          </Select>
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
                      <Col span={6}>
                        <Form.Item
                          name="price"
                          label="Base/Adult Price (AED)"
                          rules={[{ required: true, message: "Required" }]}
                          tooltip="This is the adult ticket price"
                        >
                          <InputNumber min={0} style={{ width: "100%" }} />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          name="child_price"
                          label="Child Price (AED)"
                          tooltip="Price for children (ages 3-12). Leave empty if children pay adult price."
                        >
                          <InputNumber
                            min={0}
                            style={{ width: "100%" }}
                            placeholder="Optional"
                          />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          name="infant_price"
                          label="Infant Price (AED)"
                          tooltip="Price for infants (ages 0-2). Leave empty or set to 0 for free."
                        >
                          <InputNumber
                            min={0}
                            style={{ width: "100%" }}
                            placeholder="Optional"
                          />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item name="max_guests" label="Max Guests">
                          <InputNumber min={1} style={{ width: "100%" }} />
                        </Form.Item>
                      </Col>
                    </Row>

                    {/* Sub-Packages Section */}
                    <Divider orientation="left">
                      Sub-Packages (Optional)
                    </Divider>
                    <Alert
                      message="Sub-packages allow you to offer different options within a package"
                      description="Example: For Jet Ski, you can add '30 min - 200 AED', '1 hour - 350 AED'. Customers will select one sub-package when booking."
                      type="info"
                      showIcon
                      style={{ marginBottom: 16 }}
                    />
                    <Form.List name="sub_packages">
                      {(fields, { add, remove }) => (
                        <>
                          {fields.map(({ key, name, ...restField }) => (
                            <Row
                              key={key}
                              gutter={16}
                              align="middle"
                              style={{ marginBottom: 8 }}
                            >
                              <Col span={12}>
                                <Form.Item
                                  {...restField}
                                  name={[name, "name"]}
                                  rules={[
                                    {
                                      required: true,
                                      message: "Name required",
                                    },
                                  ]}
                                  style={{ marginBottom: 0 }}
                                >
                                  <Input placeholder="Sub-package name (e.g., '30 min ride')" />
                                </Form.Item>
                              </Col>
                              <Col span={8}>
                                <Form.Item
                                  {...restField}
                                  name={[name, "price"]}
                                  rules={[
                                    {
                                      required: true,
                                      message: "Price required",
                                    },
                                  ]}
                                  style={{ marginBottom: 0 }}
                                >
                                  <InputNumber
                                    min={0}
                                    style={{ width: "100%" }}
                                    placeholder="Price (AED)"
                                    addonAfter="AED"
                                  />
                                </Form.Item>
                              </Col>
                              <Col span={4}>
                                <Button
                                  type="text"
                                  danger
                                  icon={<MinusCircleOutlined />}
                                  onClick={() => remove(name)}
                                />
                              </Col>
                            </Row>
                          ))}
                          <Form.Item>
                            <Button
                              type="dashed"
                              onClick={() => add()}
                              block
                              icon={<PlusOutlined />}
                            >
                              Add Sub-Package
                            </Button>
                          </Form.Item>
                        </>
                      )}
                    </Form.List>

                    {/* Multiple Images Gallery Upload */}
                    <Divider orientation="left">Package Gallery Images</Divider>
                    <Row gutter={16}>
                      <Col span={24}>
                        <Form.Item
                          label="Gallery Images"
                          tooltip="Upload multiple images for the package gallery (displayed on the booking page)"
                        >
                          <Space direction="vertical" style={{ width: "100%" }}>
                            <Upload
                              accept="image/*"
                              showUploadList={false}
                              beforeUpload={handleMultiImageUpload}
                              disabled={multiImageUploading}
                              multiple
                            >
                              <Button
                                icon={
                                  multiImageUploading ? (
                                    <LoadingOutlined />
                                  ) : (
                                    <UploadOutlined />
                                  )
                                }
                                disabled={multiImageUploading}
                              >
                                {multiImageUploading
                                  ? "Uploading..."
                                  : "Add Gallery Images"}
                              </Button>
                            </Upload>
                            {packageImages.length > 0 && (
                              <div
                                style={{
                                  display: "flex",
                                  flexWrap: "wrap",
                                  gap: 12,
                                  marginTop: 12,
                                  padding: 12,
                                  background: "#fafafa",
                                  borderRadius: 8,
                                  border: "1px dashed #d9d9d9",
                                }}
                              >
                                {packageImages.map((img, index) => (
                                  <div
                                    key={index}
                                    style={{
                                      position: "relative",
                                      border:
                                        index === 0
                                          ? "2px solid #FF621F"
                                          : "1px solid #e8e8e8",
                                      borderRadius: 8,
                                      overflow: "hidden",
                                      background: "white",
                                    }}
                                  >
                                    {index === 0 && (
                                      <div
                                        style={{
                                          position: "absolute",
                                          top: 0,
                                          left: 0,
                                          background: "#FF621F",
                                          color: "white",
                                          fontSize: 10,
                                          padding: "2px 6px",
                                          borderBottomRightRadius: 6,
                                          zIndex: 1,
                                        }}
                                      >
                                        Main
                                      </div>
                                    )}
                                    <Image
                                      src={img.url}
                                      width={100}
                                      height={75}
                                      style={{
                                        objectFit: "cover",
                                        display: "block",
                                      }}
                                      preview
                                    />
                                    <div
                                      style={{
                                        display: "flex",
                                        justifyContent: "center",
                                        gap: 4,
                                        padding: 4,
                                        background: "#f5f5f5",
                                      }}
                                    >
                                      {index > 0 && (
                                        <Button
                                          size="small"
                                          type="text"
                                          onClick={() =>
                                            handleReorderImages(
                                              index,
                                              index - 1,
                                            )
                                          }
                                          style={{ padding: "0 4px" }}
                                        >
                                          ←
                                        </Button>
                                      )}
                                      <Button
                                        size="small"
                                        type="text"
                                        danger
                                        onClick={() =>
                                          handleRemoveGalleryImage(index)
                                        }
                                        icon={<DeleteOutlined />}
                                        style={{ padding: "0 4px" }}
                                      />
                                      {index < packageImages.length - 1 && (
                                        <Button
                                          size="small"
                                          type="text"
                                          onClick={() =>
                                            handleReorderImages(
                                              index,
                                              index + 1,
                                            )
                                          }
                                          style={{ padding: "0 4px" }}
                                        >
                                          →
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              Upload multiple images to create a gallery. The
                              first image will be shown as the main thumbnail.
                              Drag to reorder.
                            </Text>
                          </Space>
                        </Form.Item>
                      </Col>
                    </Row>

                    <Divider orientation="left">
                      Age Group Configuration
                    </Divider>

                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="child_age_range"
                          label="Child Age Range"
                          initialValue="3-12 years"
                          tooltip="Age range for child pricing (shown in booking flow)"
                        >
                          <Input placeholder="e.g., 3-12 years" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="infant_age_range"
                          label="Infant Age Range"
                          initialValue="0-2 years"
                          tooltip="Age range for infant pricing (shown in booking flow)"
                        >
                          <Input placeholder="e.g., 0-2 years" />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Alert
                      message="Participant Pricing"
                      description={
                        <>
                          <strong>Adult Price:</strong> Required, applies to
                          guests aged 13+
                          <br />
                          <strong>Child Price:</strong> Uses age range defined
                          above. Leave empty = same as adult price
                          <br />
                          <strong>Infant Price:</strong> Uses age range defined
                          above. Leave empty or 0 = free entry
                        </>
                      }
                      type="info"
                      showIcon
                      style={{ marginBottom: 16 }}
                    />

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
                                    placeholder="e.g., Present your booking confirmation at the entrance"
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
                        <Option value="base">Base / Standard Experience</Option>
                        <Option value="standard">Standard Package</Option>
                        <Option value="combo">Combo Deal</Option>
                      </Select>
                    </Form.Item>

                    <Alert
                      message={
                        packageType === "base"
                          ? "Base Package Configuration"
                          : packageType === "combo"
                            ? "Combo Package Configuration"
                            : "Standard Package"
                      }
                      description={
                        packageType === "base" ? (
                          <>
                            This is the <strong>Standard Experience</strong>{" "}
                            package that appears by default when customers don't
                            select a premium package. There should only be{" "}
                            <strong>one base package per service</strong>. The
                            price should match the service's default price.
                          </>
                        ) : packageType === "combo" ? (
                          <>
                            Define the items included in this combo. The{" "}
                            <strong>original price</strong> (sum of individual
                            items) will be calculated automatically, or you can
                            override it. The <strong>selling price</strong> (set
                            in Basic Info) should be lower to show savings.
                          </>
                        ) : (
                          "This is a standard add-on package that customers can choose in addition to or instead of the base experience."
                        )
                      }
                      type={packageType === "base" ? "warning" : "info"}
                      showIcon
                      style={{ marginBottom: 16 }}
                    />

                    {packageType === "combo" && (
                      <>
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
              {
                key: "options",
                label: (
                  <span>
                    {getTabLabel("options", "Options")}
                    {(enableTimeSelection || enableTransfer) && (
                      <Tag color="blue" style={{ marginLeft: 4 }}>
                        ON
                      </Tag>
                    )}
                  </span>
                ),
                children: (
                  <>
                    <Alert
                      message="Booking Options"
                      description="Configure optional features like time slot selection and transfer/pickup service for this package. These options are shown to customers during the booking flow."
                      type="info"
                      showIcon
                      style={{ marginBottom: 16 }}
                    />

                    {/* Time Selection Section */}
                    <Divider orientation="left">
                      <Space>
                        <ClockCircleOutlined />
                        Time Selection
                      </Space>
                    </Divider>

                    <Form.Item
                      name="enable_time_selection"
                      label="Enable Time Selection"
                      valuePropName="checked"
                      initialValue={false}
                      tooltip="When enabled, customers must select a time slot when booking this package"
                    >
                      <Switch checkedChildren="ON" unCheckedChildren="OFF" />
                    </Form.Item>

                    {enableTimeSelection && (
                      <>
                        <Form.Item
                          label="Available Time Slots"
                          extra="Add all time slots customers can choose from. Use the time picker to select times."
                        >
                          <Form.List name="available_times">
                            {(fields, { add, remove }) => (
                              <>
                                <div
                                  style={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: 8,
                                    marginBottom: 12,
                                  }}
                                >
                                  {fields.map(({ key, name, ...restField }) => (
                                    <Space key={key} align="baseline">
                                      <Form.Item
                                        {...restField}
                                        name={name}
                                        style={{ marginBottom: 0 }}
                                        rules={[
                                          {
                                            required: true,
                                            message: "Time required",
                                          },
                                        ]}
                                        getValueProps={(value) => {
                                          // Convert string to dayjs for display
                                          if (
                                            typeof value === "string" &&
                                            value
                                          ) {
                                            return {
                                              value: dayjs(value, "hh:mm A"),
                                            };
                                          }
                                          return { value: value };
                                        }}
                                        normalize={(value) => {
                                          // Convert dayjs to string for storage
                                          if (value && dayjs.isDayjs(value)) {
                                            return value.format("hh:mm A");
                                          }
                                          return value;
                                        }}
                                      >
                                        <TimePicker
                                          use12Hours
                                          format="hh:mm A"
                                          placeholder="Select time"
                                          style={{ width: 140 }}
                                        />
                                      </Form.Item>
                                      <MinusCircleOutlined
                                        onClick={() => remove(name)}
                                        style={{ color: "#ff4d4f" }}
                                      />
                                    </Space>
                                  ))}
                                </div>
                                <Button
                                  type="dashed"
                                  onClick={() => add()}
                                  icon={<PlusOutlined />}
                                  style={{ width: "100%" }}
                                >
                                  Add Time Slot
                                </Button>
                              </>
                            )}
                          </Form.List>
                        </Form.Item>

                        <Alert
                          message="Time Slot Tips"
                          description={
                            <>
                              Use the time picker to select times. They will be
                              displayed as selectable buttons (like{" "}
                              <strong>04:00 PM</strong>,{" "}
                              <strong>06:30 PM</strong>) on the booking page.
                              Add multiple slots for different time options.
                            </>
                          }
                          type="success"
                          showIcon
                          style={{ marginBottom: 16 }}
                        />
                      </>
                    )}

                    {/* Transfer/Pickup Section */}
                    <Divider orientation="left">
                      <Space>
                        <CarOutlined />
                        Transfer / Pickup
                      </Space>
                    </Divider>

                    <Form.Item
                      name="enable_transfer"
                      label="Enable Transfer Option"
                      valuePropName="checked"
                      initialValue={false}
                      tooltip="When enabled, customers can optionally add a pickup/transfer to their booking"
                    >
                      <Switch checkedChildren="ON" unCheckedChildren="OFF" />
                    </Form.Item>

                    {enableTransfer && (
                      <>
                        <Alert
                          message="Transfer Configuration"
                          description="Set pricing for one-way and round-trip transfers. Customers will see toggle buttons to select their preference. Transfer is optional — they can choose 'No transfer'."
                          type="info"
                          showIcon
                          style={{ marginBottom: 16 }}
                        />

                        <Row gutter={16}>
                          <Col span={12}>
                            <Form.Item
                              name="transfer_price"
                              label="One Way Transfer Price (AED)"
                              tooltip="Price for a one-way pickup or dropoff. Set to 0 or leave empty to hide this option."
                            >
                              <InputNumber
                                min={0}
                                style={{ width: "100%" }}
                                placeholder="e.g., 50"
                                addonAfter="AED"
                              />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item
                              name="round_trip_price"
                              label="Round Trip Transfer Price (AED)"
                              tooltip="Price for round-trip transfer. Set to 0 or leave empty to hide this option."
                            >
                              <InputNumber
                                min={0}
                                style={{ width: "100%" }}
                                placeholder="e.g., 80"
                                addonAfter="AED"
                              />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Alert
                          message="Pricing Example"
                          description={
                            <>
                              If one-way is <strong>50 AED</strong> and round
                              trip is <strong>80 AED</strong>, customers will
                              see:
                              <br />
                              <strong>No transfer</strong> |{" "}
                              <strong>One way (+50 AED)</strong> |{" "}
                              <strong>Round trip (+80 AED)</strong>
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

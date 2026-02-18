import { useState, useEffect } from "react";
import { Card, Button, Form, Input, message, Tabs, Typography, Divider, Row, Col, Switch, Space, Alert, Spin, } from "antd";
import { SaveOutlined, FileTextOutlined, LockOutlined, InfoCircleOutlined, GlobalOutlined, } from "@ant-design/icons";
import { supabase } from "../lib/supabase";
const { TextArea } = Input;
const { Title, Text } = Typography;

const DEFAULT_TERMS = `Terms and Conditions

1. BOOKING & PAYMENT
All bookings are subject to availability. Payment is required at the time of booking. Prices are listed in AED and include applicable taxes unless otherwise stated.

2. CANCELLATION POLICY
Cancellation policies vary by service. Please refer to the specific service details for cancellation terms. Standard cancellations made less than 24 hours before the scheduled activity are non-refundable.

3. MODIFICATIONS
Booking modifications are subject to availability and may incur additional charges. Please contact our support team at least 24 hours before your scheduled activity.

4. LIABILITY
Travel Guru acts as an intermediary between customers and service providers. While we ensure quality standards, the service provider is ultimately responsible for the activity delivery.

5. REFUNDS
Approved refunds will be processed within 7-14 business days to the original payment method.

6. USER ACCOUNTS
Users are responsible for maintaining the confidentiality of their account credentials. Any activity under your account is your responsibility.

7. PRIVACY
Your personal information is handled in accordance with our Privacy Policy. We do not share your data with third parties without consent.

8. CONTACT
For questions about these terms, contact us at support@travelguru.ae`;
const DEFAULT_PRIVACY = `Privacy Policy

1. INFORMATION WE COLLECT
We collect personal information you provide during registration and booking, including name, email, phone number, and payment details.

2. HOW WE USE YOUR INFORMATION
Your information is used to process bookings, send confirmations, improve our services, and communicate important updates.

3. DATA SECURITY
We use industry-standard encryption and security measures to protect your personal data. Payment information is processed securely through Stripe.

4. COOKIES
Our website uses cookies to enhance your browsing experience and analyze site traffic.

5. THIRD-PARTY SHARING
We do not sell your personal information. Data may be shared with service providers solely for booking fulfillment.

6. YOUR RIGHTS
You may request access to, correction of, or deletion of your personal data by contacting our support team.

7. CONTACT
For privacy-related inquiries, contact privacy@travelguru.ae`;
const DEFAULT_CANCELLATION = `Cancellation Policy

STANDARD SERVICES
- Free cancellation up to 48 hours before the activity
- 50% refund for cancellations 24-48 hours before
- No refund for cancellations less than 24 hours before

PREMIUM & COMBO PACKAGES
- Free cancellation up to 72 hours before the activity
- 50% refund for cancellations 48-72 hours before
- No refund for cancellations less than 48 hours before

AIRPORT TRANSFERS
- Free cancellation up to 24 hours before pickup time
- No refund for cancellations less than 24 hours before

WEATHER-RELATED CANCELLATIONS
- Full refund provided for cancellations due to adverse weather conditions
- Rescheduling available at no extra cost

REFUND PROCESSING
- Approved refunds are processed within 7-14 business days
- Refunds are issued to the original payment method`;
function Settings() {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState(null);
    useEffect(() => {
        fetchSettings();
    }, []);
    const fetchSettings = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("site_settings")
                .select("*")
                .eq("id", 1)
                .maybeSingle();
            if (error && error.code !== "PGRST116") {
                
            }
            if (data) {
                setSettings(data);
                form.setFieldsValue({
                    terms_and_conditions: data.terms_and_conditions || DEFAULT_TERMS,
                    privacy_policy: data.privacy_policy || DEFAULT_PRIVACY,
                    cancellation_policy: data.cancellation_policy || DEFAULT_CANCELLATION,
                    company_name: data.company_name || "Travel Guru",
                    company_email: data.company_email || "support@travelguru.ae",
                    company_phone: data.company_phone || "",
                    company_address: data.company_address || "",
                    maintenance_mode: data.maintenance_mode || false,
                });
            }
            else {
                
                form.setFieldsValue({
                    terms_and_conditions: DEFAULT_TERMS,
                    privacy_policy: DEFAULT_PRIVACY,
                    cancellation_policy: DEFAULT_CANCELLATION,
                    company_name: "Travel Guru",
                    company_email: "support@travelguru.ae",
                    company_phone: "",
                    company_address: "",
                    maintenance_mode: false,
                });
            }
        }
        catch (err) {
        }
        finally {
            setLoading(false);
        }
    };
    const handleSave = async (values) => {
        try {
            setSaving(true);
            const payload = {
                terms_and_conditions: values.terms_and_conditions || "",
                privacy_policy: values.privacy_policy || "",
                cancellation_policy: values.cancellation_policy || "",
                company_name: values.company_name || "Travel Guru",
                company_email: values.company_email || "",
                company_phone: values.company_phone || "",
                company_address: values.company_address || "",
                maintenance_mode: values.maintenance_mode || false,
                updated_at: new Date().toISOString(),
            };
            if (settings?.id) {
                const { error } = await supabase
                    .from("site_settings")
                    .update(payload)
                    .eq("id", settings.id);
                if (error)
                    throw error;
            }
            else {
                const { error } = await supabase
                    .from("site_settings")
                    .insert([{ ...payload }]);
                if (error)
                    throw error;
            }
            message.success("Settings saved successfully");
            fetchSettings();
        }
        catch (error) {
            message.error("Failed to save settings. Make sure the site_settings table exists in Supabase.");
        }
        finally {
            setSaving(false);
        }
    };
    const tabs = [
        {
            key: "terms",
            label: (<span>
          <FileTextOutlined style={{ marginRight: 8 }}/>
          Terms & Conditions
        </span>),
            children: (<div>
          <Alert message="Terms & Conditions" description="These terms are displayed on the checkout page and linked from the footer. Users must agree to these before completing a booking." type="info" showIcon icon={<InfoCircleOutlined />} style={{ marginBottom: 24 }}/>
          <Form.Item name="terms_and_conditions" label={<Text strong style={{ fontSize: 15 }}>
                Terms & Conditions Content
              </Text>}>
            <TextArea rows={20} placeholder="Enter your terms and conditions..." style={{
                    fontFamily: "monospace",
                    fontSize: 13,
                    lineHeight: 1.6,
                }}/>
          </Form.Item>
          <Space>
            <Button type="default" onClick={() => form.setFieldValue("terms_and_conditions", DEFAULT_TERMS)}>
              Reset to Default
            </Button>
          </Space>
        </div>),
        },
        {
            key: "privacy",
            label: (<span>
          <LockOutlined style={{ marginRight: 8 }}/>
          Privacy Policy
        </span>),
            children: (<div>
          <Alert message="Privacy Policy" description="Your privacy policy informs users how their data is collected, used, and protected." type="info" showIcon icon={<InfoCircleOutlined />} style={{ marginBottom: 24 }}/>
          <Form.Item name="privacy_policy" label={<Text strong style={{ fontSize: 15 }}>
                Privacy Policy Content
              </Text>}>
            <TextArea rows={20} placeholder="Enter your privacy policy..." style={{
                    fontFamily: "monospace",
                    fontSize: 13,
                    lineHeight: 1.6,
                }}/>
          </Form.Item>
          <Space>
            <Button type="default" onClick={() => form.setFieldValue("privacy_policy", DEFAULT_PRIVACY)}>
              Reset to Default
            </Button>
          </Space>
        </div>),
        },
        {
            key: "cancellation",
            label: (<span>
          <FileTextOutlined style={{ marginRight: 8 }}/>
          Cancellation Policy
        </span>),
            children: (<div>
          <Alert message="Cancellation Policy" description="This policy is referenced in service details and during checkout. Individual services may override this with their own cancellation policy." type="info" showIcon icon={<InfoCircleOutlined />} style={{ marginBottom: 24 }}/>
          <Form.Item name="cancellation_policy" label={<Text strong style={{ fontSize: 15 }}>
                Default Cancellation Policy
              </Text>}>
            <TextArea rows={20} placeholder="Enter your cancellation policy..." style={{
                    fontFamily: "monospace",
                    fontSize: 13,
                    lineHeight: 1.6,
                }}/>
          </Form.Item>
          <Space>
            <Button type="default" onClick={() => form.setFieldValue("cancellation_policy", DEFAULT_CANCELLATION)}>
              Reset to Default
            </Button>
          </Space>
        </div>),
        },
        {
            key: "general",
            label: (<span>
          <GlobalOutlined style={{ marginRight: 8 }}/>
          General Settings
        </span>),
            children: (<div>
          <Title level={5} style={{ marginBottom: 16 }}>
            Company Information
          </Title>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="company_name" label="Company Name">
                <Input placeholder="Travel Guru"/>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="company_email" label="Support Email">
                <Input placeholder="support@travelguru.ae" type="email"/>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="company_phone" label="Phone Number">
                <Input placeholder="+971 XX XXX XXXX"/>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="company_address" label="Address">
                <Input placeholder="Dubai, UAE"/>
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <Title level={5} style={{ marginBottom: 16 }}>
            Site Controls
          </Title>
          <Form.Item name="maintenance_mode" label="Maintenance Mode" valuePropName="checked" extra="When enabled, the frontend will show a maintenance page to visitors.">
            <Switch checkedChildren="ON" unCheckedChildren="OFF"/>
          </Form.Item>
        </div>),
        },
    ];
    if (loading) {
        return (<div style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: 400,
            }}>
        <Spin size="large"/>
      </div>);
    }
    return (<div>
      <Card title={<Space>
            <span style={{ fontSize: 18, fontWeight: 700 }}>Site Settings</span>
          </Space>} extra={<Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={() => form.submit()} size="large">
            Save All Settings
          </Button>}>
        <Form form={form} layout="vertical" onFinish={handleSave} preserve={false}>
          <Tabs items={tabs} size="large"/>
        </Form>
      </Card>
    </div>);
}
export default Settings;

import { useState } from "react";
import { Alert, Button, Card, Form, Input, Modal, Table, message } from "antd";
import { supabase } from "../lib/supabase";
import { useCountry } from "../context/CountryContext";
export default function Countries() {
  const { countries, refreshCountries, error, loading } = useCountry();
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();
  const edit = record => { setEditing(record); form.resetFields(); form.setFieldsValue(record || {}); setOpen(true); };
  const save = async values => {
    setSaving(true);
    try {
      const payload = { ...values, code: values.code.trim().toUpperCase(), name: values.name.trim(), destination_label: values.destination_label.trim() };
      const { error } = editing
        ? await supabase.from("countries").update(payload).eq("code", editing.code)
        : await supabase.from("countries").insert(payload);
      if (error) throw error;
      message.success("Country saved");
      setOpen(false);
      await refreshCountries();
    } catch (error) {
      message.error(`Unable to save country: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };
  return <Card title="Countries & destinations" extra={<Button type="primary" onClick={() => edit(null)}>Add country</Button>}>
    <Alert style={{ marginBottom: 16 }} type="info" showIcon message="Assign services to a country. Packages inherit that country. All catalog prices and checkout payments remain in AED." />
    {error && <Alert type="error" message={error} />}
    <Table rowKey="code" dataSource={countries} loading={loading} columns={[
      { title: "Code", dataIndex: "code" }, { title: "Country", dataIndex: "name" },
      { title: "Featured destination", dataIndex: "destination_label" },
      { title: "Actions", render: (_, record) => <Button onClick={() => edit(record)}>Edit</Button> }
    ]} />
    <Modal forceRender title={editing ? "Edit country" : "Add country"} open={open} onCancel={() => setOpen(false)} onOk={() => form.submit()} confirmLoading={saving}>
      <Form form={form} layout="vertical" onFinish={save}>
        <Form.Item name="code" label="Two-letter country code" rules={[{ required: true, pattern: /^[A-Za-z]{2}$/, message: "Enter two letters, e.g. AZ" }]}><Input disabled={!!editing} maxLength={2} /></Form.Item>
        <Form.Item name="name" label="Country name" rules={[{ required: true, whitespace: true }]}><Input placeholder="Azerbaijan" /></Form.Item>
        <Form.Item name="destination_label" label="Featured destination" rules={[{ required: true, whitespace: true }]}><Input placeholder="Baku" /></Form.Item>
        <Form.Item name="description" label="Homepage description"><Input.TextArea /></Form.Item>
        <Form.Item name="hero_image" label="Homepage image URL" rules={[{ type: "url", message: "Enter a valid image URL" }]}><Input placeholder="https://…" /></Form.Item>
      </Form>
    </Modal>
  </Card>;
}

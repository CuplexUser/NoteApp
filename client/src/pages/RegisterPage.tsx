import { useState } from "react";
import { Form, Input, Button, Card, Typography, Alert, Flex } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { isAxiosError } from "axios";

const { Title, Text } = Typography;

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onFinish(values: { email: string; password: string; name: string }) {
    setError(null);
    setSubmitting(true);
    try {
      await register(values.email, values.password, values.name);
      navigate("/notes");
    } catch (err) {
      const message = isAxiosError(err) ? err.response?.data?.error : null;
      setError(message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Flex justify="center" align="center" style={{ minHeight: "100vh", background: "#f5f5f5" }}>
      <Card style={{ width: 380 }}>
        <Title level={3} style={{ textAlign: "center", marginBottom: 4 }}>
          Create an account
        </Title>
        <Text type="secondary" style={{ display: "block", textAlign: "center", marginBottom: 24 }}>
          Start keeping notes
        </Text>
        {error && <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />}
        <Form layout="vertical" onFinish={onFinish} disabled={submitting}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input size="large" placeholder="Ada Lovelace" />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}>
            <Input size="large" placeholder="you@example.com" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, min: 8, message: "At least 8 characters" }]}
          >
            <Input.Password size="large" placeholder="At least 8 characters" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large" loading={submitting}>
              Sign up
            </Button>
          </Form.Item>
        </Form>
        <Text style={{ display: "block", textAlign: "center" }}>
          Already have an account? <Link to="/login">Log in</Link>
        </Text>
      </Card>
    </Flex>
  );
}

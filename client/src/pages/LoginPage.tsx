import { useState } from "react";
import { Form, Input, Button, Card, Typography, Alert, Flex } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { isAxiosError } from "axios";

const { Title, Text } = Typography;

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onFinish(values: { email: string; password: string }) {
    setError(null);
    setSubmitting(true);
    try {
      await login(values.email, values.password);
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
          Welcome back
        </Title>
        <Text type="secondary" style={{ display: "block", textAlign: "center", marginBottom: 24 }}>
          Log in to your notes
        </Text>
        {error && <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />}
        <Form layout="vertical" onFinish={onFinish} disabled={submitting}>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}>
            <Input size="large" placeholder="you@example.com" />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true }]}>
            <Input.Password size="large" placeholder="••••••••" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large" loading={submitting}>
              Log in
            </Button>
          </Form.Item>
        </Form>
        <Text style={{ display: "block", textAlign: "center" }}>
          No account yet? <Link to="/register">Create one</Link>
        </Text>
      </Card>
    </Flex>
  );
}

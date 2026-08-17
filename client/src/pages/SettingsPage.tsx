import { useState } from "react";
import {
  Card,
  Avatar,
  Button,
  Form,
  Input,
  Typography,
  Switch,
  Space,
  Upload,
  message,
  Divider,
  Descriptions,
} from "antd";
import {
  UserOutlined,
  UploadOutlined,
  DeleteOutlined,
  BulbOutlined,
} from "@ant-design/icons";
import type { UploadProps } from "antd";
import dayjs from "dayjs";
import { useAuth } from "../contexts/AuthContext";
import { useThemeMode } from "../contexts/ThemeContext";
import { avatarUrl } from "../api/users";
import { isAxiosError } from "axios";

const { Title, Text } = Typography;

function errorMessage(err: unknown, fallback: string) {
  return (isAxiosError(err) && err.response?.data?.error) || fallback;
}

export default function SettingsPage() {
  const { user, updateName, changePassword, uploadAvatar, deleteAvatar } = useAuth();
  const { mode, toggleMode } = useThemeMode();
  const [nameForm] = Form.useForm<{ name: string }>();
  const [passwordForm] = Form.useForm<{ currentPassword: string; newPassword: string; confirmPassword: string }>();
  const [savingName, setSavingName] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [avatarBusy, setAvatarBusy] = useState(false);

  async function handleSaveName(values: { name: string }) {
    setSavingName(true);
    try {
      await updateName(values.name);
      message.success("Display name updated");
    } catch (err) {
      message.error(errorMessage(err, "Could not update your name"));
    } finally {
      setSavingName(false);
    }
  }

  async function handleChangePassword(values: { currentPassword: string; newPassword: string }) {
    setSavingPassword(true);
    try {
      await changePassword(values.currentPassword, values.newPassword);
      message.success("Password changed");
      passwordForm.resetFields();
    } catch (err) {
      message.error(errorMessage(err, "Could not change your password"));
    } finally {
      setSavingPassword(false);
    }
  }

  const customAvatarRequest: UploadProps["customRequest"] = async (options) => {
    const { file, onSuccess, onError } = options;
    setAvatarBusy(true);
    try {
      await uploadAvatar(file as File);
      onSuccess?.({});
      message.success("Photo updated");
    } catch (err) {
      onError?.(err as Error);
      message.error(errorMessage(err, "Could not upload photo (2MB max, images only)"));
    } finally {
      setAvatarBusy(false);
    }
  };

  async function handleRemoveAvatar() {
    setAvatarBusy(true);
    try {
      await deleteAvatar();
      message.success("Photo removed");
    } catch (err) {
      message.error(errorMessage(err, "Could not remove photo"));
    } finally {
      setAvatarBusy(false);
    }
  }

  if (!user) return null;

  return (
    <div style={{ maxWidth: 720 }}>
      <Title level={3}>Settings</Title>

      <Card title="Profile" style={{ marginBottom: 16 }}>
        <Space size="large" align="start" wrap>
          <Space direction="vertical" align="center">
            <Avatar size={88} src={avatarUrl(user)} icon={<UserOutlined />} />
            <Space>
              <Upload
                accept="image/*"
                showUploadList={false}
                customRequest={customAvatarRequest}
                disabled={avatarBusy}
              >
                <Button size="small" icon={<UploadOutlined />} loading={avatarBusy}>
                  Upload
                </Button>
              </Upload>
              {user.has_avatar && (
                <Button
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={handleRemoveAvatar}
                  disabled={avatarBusy}
                >
                  Remove
                </Button>
              )}
            </Space>
          </Space>

          <Form
            form={nameForm}
            layout="vertical"
            initialValues={{ name: user.name }}
            onFinish={handleSaveName}
            style={{ minWidth: 260 }}
          >
            <Form.Item name="name" label="Display name" rules={[{ required: true, message: "Name is required" }]}>
              <Input />
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={savingName}>
              Save name
            </Button>
          </Form>
        </Space>

        <Divider />
        <Descriptions column={1} size="small">
          <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
          <Descriptions.Item label="Member since">
            {user.created_at ? dayjs(user.created_at).format("MMMM D, YYYY") : "—"}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="Security" style={{ marginBottom: 16 }}>
        <Form form={passwordForm} layout="vertical" onFinish={handleChangePassword} style={{ maxWidth: 360 }}>
          <Form.Item
            name="currentPassword"
            label="Current password"
            rules={[{ required: true, message: "Enter your current password" }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label="New password"
            rules={[{ required: true, min: 8, message: "At least 8 characters" }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="Confirm new password"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "Confirm your new password" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) return Promise.resolve();
                  return Promise.reject(new Error("Passwords do not match"));
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={savingPassword}>
            Change password
          </Button>
        </Form>
      </Card>

      <Card title="Appearance">
        <Space align="center">
          <BulbOutlined />
          <Text>Dark mode</Text>
          <Switch checked={mode === "dark"} onChange={toggleMode} />
        </Space>
      </Card>
    </div>
  );
}

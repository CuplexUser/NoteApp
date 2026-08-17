import { Layout, Menu, Avatar, Dropdown, Space, Typography, theme } from "antd";
import {
  FileTextOutlined,
  DashboardOutlined,
  LogoutOutlined,
  UserOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { avatarUrl } from "../api/users";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = theme.useToken();

  const selectedKey = location.pathname.startsWith("/dashboard")
    ? "dashboard"
    : location.pathname.startsWith("/settings")
      ? "settings"
      : "notes";

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider breakpoint="lg" collapsedWidth="0" theme="dark">
        <div
          style={{
            height: 56,
            margin: 16,
            color: "#fff",
            fontSize: 18,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
          }}
        >
          📝 Notes
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={[
            { key: "notes", icon: <FileTextOutlined />, label: "Notes", onClick: () => navigate("/notes") },
            { key: "dashboard", icon: <DashboardOutlined />, label: "Dashboard", onClick: () => navigate("/dashboard") },
            { key: "settings", icon: <SettingOutlined />, label: "Settings", onClick: () => navigate("/settings") },
          ]}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            background: token.colorBgContainer,
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            padding: "0 24px",
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          <Dropdown
            menu={{
              items: [
                { key: "settings", icon: <SettingOutlined />, label: "Settings", onClick: () => navigate("/settings") },
                { key: "logout", icon: <LogoutOutlined />, label: "Log out", onClick: handleLogout },
              ],
            }}
            trigger={["click"]}
          >
            <Space size="middle" style={{ cursor: "pointer" }}>
              <Avatar src={avatarUrl(user)} icon={<UserOutlined />} />
              <Text strong>{user?.name}</Text>
            </Space>
          </Dropdown>
        </Header>
        <Content style={{ padding: 24 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}

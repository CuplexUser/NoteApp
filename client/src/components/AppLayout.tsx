import { Layout, Menu, Avatar, Space, Typography, theme } from "antd";
import { FileTextOutlined, DashboardOutlined, LogoutOutlined, UserOutlined } from "@ant-design/icons";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = theme.useToken();

  const selectedKey = location.pathname.startsWith("/dashboard") ? "dashboard" : "notes";

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
          <Space size="middle">
            <Avatar icon={<UserOutlined />} />
            <Text strong>{user?.name}</Text>
            <LogoutOutlined
              style={{ cursor: "pointer", fontSize: 18 }}
              onClick={handleLogout}
              title="Log out"
            />
          </Space>
        </Header>
        <Content style={{ padding: 24 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}

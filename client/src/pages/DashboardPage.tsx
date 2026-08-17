import { Row, Col, Card, Statistic, Typography, Progress, Empty, Table, Spin } from "antd";
import {
  FileTextOutlined,
  StarFilled,
  ClockCircleOutlined,
  PaperClipOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { fetchDashboardStats } from "../api/dashboard";
import dayjs from "dayjs";

const { Title, Text } = Typography;

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery({ queryKey: ["dashboard"], queryFn: fetchDashboardStats });

  if (isLoading || !data) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  const maxTagCount = Math.max(1, ...data.tagCounts.map((t) => t.count));

  return (
    <div>
      <Title level={3}>Dashboard</Title>
      <Text type="secondary">Live aggregate queries run against Postgres on every load.</Text>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Total notes" value={data.totalNotes} prefix={<FileTextOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Pinned notes"
              value={data.pinnedNotes}
              prefix={<StarFilled style={{ color: "#faad14" }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Created in last 7 days"
              value={data.notesLast7Days}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Attachment storage used"
              value={formatBytes(data.attachments.totalBytes)}
              prefix={<PaperClipOutlined />}
              suffix={`(${data.attachments.count} files)`}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Notes by tag" size="small">
            {data.tagCounts.length === 0 ? (
              <Empty description="No tags yet" />
            ) : (
              data.tagCounts.map((t) => (
                <div key={t.tag} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <Text>{t.tag}</Text>
                    <Text type="secondary">{t.count}</Text>
                  </div>
                  <Progress
                    percent={Math.round((t.count / maxTagCount) * 100)}
                    showInfo={false}
                    size="small"
                  />
                </div>
              ))
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Activity (last 14 days)" size="small">
            <Table
              size="small"
              pagination={false}
              dataSource={data.activityByDay}
              rowKey="day"
              locale={{ emptyText: "No recent activity" }}
              columns={[
                { title: "Day", dataIndex: "day", render: (d: string) => dayjs(d).format("MMM D, YYYY") },
                { title: "Notes created", dataIndex: "count" },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

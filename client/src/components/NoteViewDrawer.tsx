import { Drawer, Typography, Tag, Space, Button, List, Empty } from "antd";
import { EditOutlined, StarFilled, DownloadOutlined, PaperClipOutlined } from "@ant-design/icons";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import dayjs from "dayjs";
import type { Note } from "../types";
import { downloadAttachmentUrl } from "../api/attachments";

const { Title, Text } = Typography;

interface Props {
  note: Note | null;
  onClose: () => void;
  onEdit: (note: Note) => void;
}

export default function NoteViewDrawer({ note, onClose, onEdit }: Props) {
  return (
    <Drawer
      open={!!note}
      onClose={onClose}
      width={520}
      title={
        note && (
          <Space>
            {note.metadata?.pinned && <StarFilled style={{ color: "#faad14" }} />}
            <span
              style={{
                display: "inline-block",
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: note.metadata?.color || "#d9d9d9",
              }}
            />
            {note.title}
          </Space>
        )
      }
      extra={
        note && (
          <Button icon={<EditOutlined />} onClick={() => onEdit(note)}>
            Edit
          </Button>
        )
      }
    >
      {note && (
        <>
          <Space wrap size={[4, 4]} style={{ marginBottom: 16 }}>
            {note.tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </Space>

          <div className="markdown-body">
            {note.content ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{note.content}</ReactMarkdown>
            ) : (
              <Text type="secondary">No content</Text>
            )}
          </div>

          <Title level={5} style={{ marginTop: 24 }}>
            Attachments
          </Title>
          <List
            size="small"
            dataSource={note.attachments}
            locale={{ emptyText: <Empty description="No attachments" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
            renderItem={(a) => (
              <List.Item
                actions={[
                  <a key="download" href={downloadAttachmentUrl(a.id)} target="_blank" rel="noreferrer">
                    <DownloadOutlined />
                  </a>,
                ]}
              >
                <PaperClipOutlined style={{ marginRight: 8 }} />
                {a.filename}
              </List.Item>
            )}
          />

          <Text type="secondary" style={{ display: "block", marginTop: 16, fontSize: 12 }}>
            Last updated {dayjs(note.updated_at).format("MMM D, YYYY [at] h:mm A")}
          </Text>
        </>
      )}
    </Drawer>
  );
}

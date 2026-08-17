import { Upload, Button, List, Popconfirm, message, type UploadProps } from "antd";
import { UploadOutlined, DownloadOutlined, DeleteOutlined, PaperClipOutlined } from "@ant-design/icons";
import { uploadAttachment, deleteAttachment, downloadAttachmentUrl } from "../api/attachments";
import type { Attachment } from "../types";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

interface Props {
  noteId: string;
  attachments: Attachment[];
  onChanged: () => void;
}

type CustomRequestOptions = Parameters<NonNullable<UploadProps["customRequest"]>>[0];

export default function AttachmentsPanel({ noteId, attachments, onChanged }: Props) {
  async function customRequest(options: CustomRequestOptions) {
    const { file, onSuccess, onError } = options;
    try {
      await uploadAttachment(noteId, file as File);
      onSuccess?.({});
      message.success("File uploaded");
      onChanged();
    } catch (err) {
      onError?.(err as Error);
      message.error("Upload failed (5MB max)");
    }
  }

  async function handleDelete(id: string) {
    await deleteAttachment(id);
    message.success("Attachment deleted");
    onChanged();
  }

  return (
    <div>
      <Upload customRequest={customRequest} showUploadList={false}>
        <Button icon={<UploadOutlined />}>Upload file (max 5MB)</Button>
      </Upload>
      <List
        style={{ marginTop: 12 }}
        size="small"
        dataSource={attachments}
        locale={{ emptyText: "No attachments yet" }}
        renderItem={(a) => (
          <List.Item
            actions={[
              <a key="download" href={downloadAttachmentUrl(a.id)} target="_blank" rel="noreferrer">
                <DownloadOutlined />
              </a>,
              <Popconfirm
                key="delete"
                title="Delete this attachment?"
                onConfirm={() => handleDelete(a.id)}
              >
                <DeleteOutlined style={{ color: "#ff4d4f", cursor: "pointer" }} />
              </Popconfirm>,
            ]}
          >
            <PaperClipOutlined style={{ marginRight: 8 }} />
            {a.filename}
            <span style={{ color: "#999", marginLeft: 8 }}>({formatBytes(a.size_bytes)})</span>
          </List.Item>
        )}
      />
    </div>
  );
}

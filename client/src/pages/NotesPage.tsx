import { useEffect, useMemo, useState } from "react";
import {
  Row,
  Col,
  Card,
  Input,
  Select,
  Switch,
  Button,
  Empty,
  Tag,
  Typography,
  Modal,
  Form,
  Space,
  Popconfirm,
  message,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  StarFilled,
  StarOutlined,
  PaperClipOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { fetchNotes, fetchTags, createNote, updateNote, deleteNote, type NoteInput } from "../api/notes";
import type { Note } from "../types";
import ColorSwatchPicker from "../components/ColorSwatchPicker";
import AttachmentsPanel from "../components/AttachmentsPanel";
import NoteViewDrawer from "../components/NoteViewDrawer";

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

export default function NotesPage() {
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [pinnedOnly, setPinnedOnly] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [viewingNote, setViewingNote] = useState<Note | null>(null);
  const [form] = Form.useForm<{ title: string; content: string; tags: string[]; color?: string; pinned?: boolean }>();

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const notesQuery = useQuery({
    queryKey: ["notes", search, tagFilter, pinnedOnly],
    queryFn: () => fetchNotes({ search, tags: tagFilter, pinned: pinnedOnly }),
  });

  const tagsQuery = useQuery({ queryKey: ["tags"], queryFn: fetchTags });

  function invalidateNotes() {
    queryClient.invalidateQueries({ queryKey: ["notes"] });
    queryClient.invalidateQueries({ queryKey: ["tags"] });
  }

  const createMutation = useMutation({
    mutationFn: (input: NoteInput) => createNote(input),
    onSuccess: (note) => {
      invalidateNotes();
      message.success("Note created — you can now attach files below");
      setEditingNote(note); // stay open in edit mode so attachments can be added immediately
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<NoteInput> }) => updateNote(id, input),
    onSuccess: () => {
      invalidateNotes();
      message.success("Note updated");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteNote(id),
    onSuccess: () => {
      invalidateNotes();
      message.success("Note deleted");
    },
  });

  const tagOptions = useMemo(
    () => (tagsQuery.data || []).map((t) => ({ label: t, value: t })),
    [tagsQuery.data]
  );

  function openCreateModal() {
    setEditingNote(null);
    form.resetFields();
    setModalOpen(true);
  }

  function openEditModal(note: Note) {
    setEditingNote(note);
    form.setFieldsValue({
      title: note.title,
      content: note.content,
      tags: note.tags,
      color: note.metadata?.color,
      pinned: note.metadata?.pinned,
    });
    setModalOpen(true);
  }

  function openViewDrawer(note: Note) {
    setViewingNote(note);
  }

  function handleEditFromDrawer(note: Note) {
    setViewingNote(null);
    openEditModal(note);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingNote(null);
    form.resetFields();
  }

  function togglePinned(note: Note) {
    updateMutation.mutate({
      id: note.id,
      input: { metadata: { ...note.metadata, pinned: !note.metadata?.pinned } },
    });
  }

  async function handleSubmit() {
    const values = await form.validateFields();
    const input: NoteInput = {
      title: values.title,
      content: values.content || "",
      tags: values.tags || [],
      metadata: { color: values.color, pinned: values.pinned },
    };
    if (editingNote) {
      updateMutation.mutate({ id: editingNote.id, input });
    } else {
      createMutation.mutate(input);
    }
  }

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={3} style={{ margin: 0 }}>
            My Notes
          </Title>
        </Col>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
            New Note
          </Button>
        </Col>
      </Row>

      <Space wrap style={{ marginBottom: 20 }} size="middle">
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder="Full-text search notes..."
          style={{ width: 260 }}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <Select
          mode="multiple"
          allowClear
          placeholder="Filter by tags"
          style={{ minWidth: 220 }}
          options={tagOptions}
          value={tagFilter}
          onChange={setTagFilter}
        />
        <Space>
          <Switch checked={pinnedOnly} onChange={setPinnedOnly} />
          <Text>Pinned only</Text>
        </Space>
      </Space>

      {notesQuery.data && notesQuery.data.length === 0 && (
        <Empty description="No notes found" style={{ marginTop: 60 }} />
      )}

      <Row gutter={[16, 16]}>
        {(notesQuery.data || []).map((note) => (
          <Col xs={24} sm={12} lg={8} key={note.id}>
            <Card
              hoverable
              style={{ borderTop: `4px solid ${note.metadata?.color || "#d9d9d9"}` }}
              actions={[
                <Tooltip title={note.metadata?.pinned ? "Unpin" : "Pin"} key="pin">
                  <span onClick={() => togglePinned(note)}>
                    {note.metadata?.pinned ? <StarFilled style={{ color: "#faad14" }} /> : <StarOutlined />}
                  </span>
                </Tooltip>,
                <EditOutlined key="edit" onClick={() => openEditModal(note)} />,
                <Popconfirm
                  key="delete"
                  title="Delete this note?"
                  onConfirm={() => deleteMutation.mutate(note.id)}
                >
                  <DeleteOutlined style={{ color: "#ff4d4f" }} />
                </Popconfirm>,
              ]}
            >
              <div onClick={() => openViewDrawer(note)} style={{ cursor: "pointer" }}>
                <Card.Meta
                  title={note.title}
                  description={
                    <>
                      <Paragraph ellipsis={{ rows: 3 }} style={{ marginBottom: 8, minHeight: 60 }}>
                        {note.content || <Text type="secondary">No content</Text>}
                      </Paragraph>
                      <Space wrap size={[4, 4]} style={{ marginBottom: 8 }}>
                        {note.tags.map((tag) => (
                          <Tag key={tag}>{tag}</Tag>
                        ))}
                      </Space>
                      <div>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Updated {dayjs(note.updated_at).fromNow()}
                        </Text>
                        {note.attachments.length > 0 && (
                          <Text type="secondary" style={{ fontSize: 12, marginLeft: 10 }}>
                            <PaperClipOutlined /> {note.attachments.length}
                          </Text>
                        )}
                      </div>
                    </>
                  }
                />
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        open={modalOpen}
        title={editingNote ? "Edit Note" : "New Note"}
        onCancel={closeModal}
        onOk={handleSubmit}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        okText={editingNote ? "Save" : "Create"}
        width={560}
        destroyOnHidden
      >
        <Form layout="vertical" form={form} initialValues={{ tags: [], pinned: false }}>
          <Form.Item name="title" label="Title" rules={[{ required: true, message: "Title is required" }]}>
            <Input placeholder="Note title" />
          </Form.Item>
          <Form.Item name="content" label="Content">
            <TextArea rows={4} placeholder="Write something..." />
          </Form.Item>
          <Form.Item name="tags" label="Tags">
            <Select mode="tags" placeholder="Add tags and press enter" options={tagOptions} />
          </Form.Item>
          <Space size="large">
            <Form.Item name="color" label="Color">
              <ColorSwatchPicker />
            </Form.Item>
            <Form.Item name="pinned" label="Pinned" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Space>
        </Form>

        {editingNote && (
          <>
            <Title level={5} style={{ marginTop: 8 }}>
              Attachments
            </Title>
            <AttachmentsPanel
              noteId={editingNote.id}
              attachments={
                notesQuery.data?.find((n) => n.id === editingNote.id)?.attachments || editingNote.attachments
              }
              onChanged={invalidateNotes}
            />
          </>
        )}
      </Modal>

      <NoteViewDrawer
        note={
          viewingNote ? notesQuery.data?.find((n) => n.id === viewingNote.id) || viewingNote : null
        }
        onClose={() => setViewingNote(null)}
        onEdit={handleEditFromDrawer}
      />
    </div>
  );
}

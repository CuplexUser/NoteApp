export interface User {
  id: string;
  email: string;
  name: string;
  created_at?: string;
  has_avatar?: boolean;
  avatar_updated_at?: string | null;
}

export interface Attachment {
  id: string;
  filename: string;
  mime_type: string;
  size_bytes: number;
  created_at: string;
}

export interface NoteMetadata {
  color?: string;
  pinned?: boolean;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  metadata: NoteMetadata;
  created_at: string;
  updated_at: string;
  attachments: Attachment[];
}

export interface DashboardStats {
  totalNotes: number;
  pinnedNotes: number;
  notesLast7Days: number;
  tagCounts: { tag: string; count: number }[];
  attachments: { count: number; totalBytes: number };
  activityByDay: { day: string; count: number }[];
}

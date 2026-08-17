import { api } from "./client";
import type { Note, NoteMetadata } from "../types";

export interface NoteFilters {
  search?: string;
  tags?: string[];
  pinned?: boolean;
}

export async function fetchNotes(filters: NoteFilters) {
  const params: Record<string, string> = {};
  if (filters.search) params.search = filters.search;
  if (filters.tags && filters.tags.length) params.tags = filters.tags.join(",");
  if (filters.pinned) params.pinned = "true";
  const res = await api.get<{ notes: Note[] }>("/notes", { params });
  return res.data.notes;
}

export async function fetchTags() {
  const res = await api.get<{ tags: string[] }>("/notes/tags");
  return res.data.tags;
}

export interface NoteInput {
  title: string;
  content: string;
  tags: string[];
  metadata: NoteMetadata;
}

export async function createNote(input: NoteInput) {
  const res = await api.post<{ note: Note }>("/notes", input);
  return res.data.note;
}

export async function updateNote(id: string, input: Partial<NoteInput>) {
  const res = await api.put<{ note: Note }>(`/notes/${id}`, input);
  return res.data.note;
}

export async function deleteNote(id: string) {
  await api.delete(`/notes/${id}`);
}

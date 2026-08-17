import { api } from "./client";
import type { Attachment } from "../types";

export async function uploadAttachment(noteId: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await api.post<{ attachment: Attachment }>(
    `/notes/${noteId}/attachments`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return res.data.attachment;
}

export async function deleteAttachment(id: string) {
  await api.delete(`/attachments/${id}`);
}

export function downloadAttachmentUrl(id: string) {
  return `/api/attachments/${id}/download`;
}

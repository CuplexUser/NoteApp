import { api } from "./client";
import type { User } from "../types";

export async function updateName(name: string) {
  const res = await api.put<{ user: User }>("/users/me", { name });
  return res.data.user;
}

export async function changePassword(currentPassword: string, newPassword: string) {
  await api.put("/users/me/password", { currentPassword, newPassword });
}

export async function uploadAvatar(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await api.post<{ user: User }>("/users/me/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.user;
}

export async function deleteAvatar() {
  const res = await api.delete<{ user: User }>("/users/me/avatar");
  return res.data.user;
}

export function avatarUrl(user: User | null) {
  if (!user?.has_avatar) return undefined;
  const v = user.avatar_updated_at ? new Date(user.avatar_updated_at).getTime() : "";
  return `/api/users/me/avatar?v=${v}`;
}

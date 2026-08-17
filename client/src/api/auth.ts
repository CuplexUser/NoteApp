import { api } from "./client";
import type { User } from "../types";

export async function registerUser(data: { email: string; password: string; name: string }) {
  const res = await api.post<{ user: User }>("/auth/register", data);
  return res.data.user;
}

export async function loginUser(data: { email: string; password: string }) {
  const res = await api.post<{ user: User }>("/auth/login", data);
  return res.data.user;
}

export async function logoutUser() {
  await api.post("/auth/logout");
}

export async function fetchMe() {
  const res = await api.get<{ user: User }>("/auth/me");
  return res.data.user;
}

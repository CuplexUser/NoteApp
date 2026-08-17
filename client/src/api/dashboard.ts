import { api } from "./client";
import type { DashboardStats } from "../types";

export async function fetchDashboardStats() {
  const res = await api.get<DashboardStats>("/dashboard");
  return res.data;
}

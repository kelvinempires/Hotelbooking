// src/api/dashboard.js
import api from "./api";

export const getDashboardStats = async () => {
  const res = await api.get("/owner/dashboard-stats");
  return res.data.data;
};

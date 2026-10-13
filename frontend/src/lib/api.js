import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

// Public base URL of the Cloudflare R2 bucket that serves all images.
export const MEDIA_URL = (process.env.REACT_APP_MEDIA_URL || "").replace(/\/$/, "");
export const media = (key) => `${MEDIA_URL}/${key}`;

export const api = axios.create({ baseURL: API });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("uf_admin_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const inr = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

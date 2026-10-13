import axios from "axios";

// Empty in production: the API is served from the same domain under /api.
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "";
export const API = `${BACKEND_URL}/api`;

// Public base URL of the Cloudflare R2 bucket that serves all images.
export const MEDIA_URL = (process.env.REACT_APP_MEDIA_URL || "").replace(/\/$/, "");
export const media = (key) => `${MEDIA_URL}/${key}`;

// The admin session lives in an httpOnly cookie set by the backend; the browser
// attaches it automatically, so no token is ever stored in JavaScript.
export const api = axios.create({ baseURL: API, withCredentials: true });

// An expired or revoked admin session sends the user back to the login page.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const { pathname } = window.location;
    if (err?.response?.status === 401 && pathname.startsWith("/admin") && pathname !== "/admin/login") {
      window.location.assign("/admin/login");
    }
    return Promise.reject(err);
  }
);

export const inr = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

import axios from "axios";

/* =========================
   API Gateway Base URL
   ========================= */

const BASE_URL = "http://localhost:8080";

export const AUTH_BASE_URL = `${BASE_URL}/user`;
export const ADMIN_BASE_URL = `${BASE_URL}/admin`;
export const ACCOUNT_BASE_URL = `${BASE_URL}/account`;
export const SUPPORT_BASE_URL = `${BASE_URL}/support`;

/* =========================
   Axios Clients
   ========================= */

export const authApi = axios.create({ baseURL: AUTH_BASE_URL });
export const adminApi = axios.create({ baseURL: ADMIN_BASE_URL });
export const accountApi = axios.create({ baseURL: ACCOUNT_BASE_URL });
export const supportApi = axios.create({ baseURL: SUPPORT_BASE_URL });

/* Backward compatibility */

export const AUTH_API = authApi;
export const ADMIN_API = adminApi;
export const ACCOUNT_API = accountApi;
export const LOAN_API = supportApi;

/* =========================
   Storage Keys
   ========================= */

export const STORAGE_KEYS = {
  session: "myfin_session",
  customers: "myfin_customers",
  admins: "myfin_admins",
};

/* =========================
   Session Management
   ========================= */

export const setSession = (session) => {
  if (!session) {
    clearSession();
    return;
  }

  sessionStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session));

  if (session.role === "customer") {
    sessionStorage.setItem("user", JSON.stringify(session));
  }

  if (session.role === "admin") {
    sessionStorage.setItem("admin", JSON.stringify(session));
  }
};

export const getSession = () => {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEYS.session) || "null");
  } catch {
    return null;
  }
};

export const clearSession = () => {
  localStorage.removeItem(STORAGE_KEYS.session);
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("admin");
  localStorage.removeItem("adminToken");
  localStorage.removeItem("myfin_banking_state");

  sessionStorage.removeItem(STORAGE_KEYS.session);
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");
  sessionStorage.removeItem("admin");
  sessionStorage.removeItem("adminToken");
  sessionStorage.removeItem("myfin_banking_state");
};

export const getRole = () => getSession()?.role || null;
export const isAuthenticated = () => Boolean(getSession());

export const mergeSession = (patch) => {
  const current = getSession() || {};
  const next = { ...current, ...patch };
  setSession(next);
  return next;
};

/* =========================
   Local Storage Helpers
   ========================= */

export const getStoredRecords = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
};

export const saveStoredRecords = (key, records) => {
  localStorage.setItem(key, JSON.stringify(records));
};

export const appendCustomerRecord = (customer) => {
  const records = getStoredRecords(STORAGE_KEYS.customers);
  const next = [
    customer,
    ...records.filter((item) => item.email !== customer.email),
  ];
  saveStoredRecords(STORAGE_KEYS.customers, next);
};

export const appendAdminRecord = (admin) => {
  const records = getStoredRecords(STORAGE_KEYS.admins);
  const next = [admin, ...records.filter((item) => item.email !== admin.email)];
  saveStoredRecords(STORAGE_KEYS.admins, next);
};

/* =========================
   Error Handling
   ========================= */

export const getErrorMessage = (error, fallback = "Something went wrong.") => {
  if (typeof error?.response?.data === "string" && error.response.data.trim()) {
    return error.response.data;
  }

  if (
    typeof error?.response?.data?.message === "string" &&
    error.response.data.message.trim()
  ) {
    return error.response.data.message;
  }

  if (typeof error?.message === "string" && error.message.trim()) {
    return error.message;
  }

  return fallback;
};

/* =========================
   Axios Interceptors
   ========================= */

const handleError = (error) => {
  if (error.response?.status === 401) {
    clearSession();
  }

  return Promise.reject(error);
};

[authApi, adminApi, accountApi, supportApi].forEach((client) => {
  client.interceptors.request.use((config) => {
    const token = sessionStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  client.interceptors.response.use((response) => response, handleError);
});

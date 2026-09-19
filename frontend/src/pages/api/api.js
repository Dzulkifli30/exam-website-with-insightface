import axios from "axios";

const API_URL_BASE = "";

const api = axios.create({
  baseURL: "/api/",
  headers: {
    Accept: "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export { api as default, API_URL_BASE };
// Central Axios instance — all API calls go through here
// Sets base URL, attaches JWT token automatically
import axios from "axios";

const BASE_URL= import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})
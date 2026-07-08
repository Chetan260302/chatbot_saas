// Central Axios instance — all API calls go through here
// Sets base URL, attaches JWT token automatically
import axios from "axios";
import { useAuthStore } from "../store/authStore";

const BASE_URL= import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

//Attach token on header of every call
apiClient.interceptors.request.use((config)=>{
    const token=localStorage.getItem("access_token")

    if(token){
        config.headers.Authorization = `Bearer ${token}`
    }

    return config
})

// On 401 → clear tokens and redirect to login
apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().logout()
      const isAuthPage = window.location.pathname.startsWith('/login') || window.location.pathname.startsWith('/register')
      if (!isAuthPage) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)
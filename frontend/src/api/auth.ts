import { apiClient } from "./client";

export interface RegisterPayload{
    company_name:string
    email:string
    password:string
    full_name:string
}

export interface LoginPayload{
    email:string
    password:string
}

export interface TokenResponse {
  access_token:  string
  refresh_token: string
  token_type:    string
}

export interface UserProfile {
  id:        string
  email:     string
  full_name: string
  role:      string
  tenant_id: string
  is_active: boolean
}

export const authAPI={
    // Register endpoint (should be public)
    register: async (data: RegisterPayload) => {
        const response = await apiClient.post<TokenResponse>('auth/register', data)
        return response.data
    },
    // Login endpoint (public, no auth token needed)
    login: async (data: LoginPayload) => {
        const response = await apiClient.post<TokenResponse>('auth/login', data)
        return response.data
    },
    // Test endpoint – needs token (auth middleware will protect)
    getMe: async () => {
        const response = await apiClient.get<UserProfile>('auth/me')
        return response.data
    },

    //logout
    logout: async () => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        // localStorage.removeItem('user_profile')
    },
}
    
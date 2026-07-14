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

export interface TenantUsage {
  plan: string
  trial_ends_at: string | null
  trial_days_remaining: number | null
  period_start: string
  usage: {
    chatbots: number
    conversations: number
    messages: number
  }
  limits: {
    chatbots: number
    conversations: number
    messages: number
    documents_per_chatbot: number
  }
}

export interface UserProfile {
  id:            string
  email:         string
  full_name:     string
  role:          string
  tenant_id:     string
  is_active:     boolean
  is_superadmin: boolean
}

export interface RegisterResponse {
  status: string
  message: string
  verification_required?: boolean
  dev_verification_url?: string
}

export const authAPI={
    // Register endpoint (should be public)
    register: async (data: RegisterPayload) => {
        const response = await apiClient.post<RegisterResponse>('/auth/register', data)
        return response.data
    },
    // Login endpoint (public, no auth token needed)
    login: async (data: LoginPayload) => {
        const response = await apiClient.post<TokenResponse>('/auth/login', data)
        return response.data
    },
    // Test endpoint – needs token (auth middleware will protect)
    getMe: async () => {
        const response = await apiClient.get<UserProfile>('/auth/me')
        return response.data
    },
    // Get tenant details including API key
    getTenantMe: async () => {
        const response = await apiClient.get<{ id: string; name: string; api_key: string; plan: string }>('/auth/tenant/me')
        return response.data
    },
    // Get tenant plan usage telemetry
    getTenantUsage: async () => {
        const response = await apiClient.get<TenantUsage>('/auth/tenant/usage')
        return response.data
    },
    changePassword: async (data: any) => {
        const response = await apiClient.post('/auth/change-password', data)
        return response.data
    },
    forgotPassword: async (email: string) => {
        const response = await apiClient.post('/auth/forgot-password', { email })
        return response.data
    },
    resetPassword: async (data: any) => {
        const response = await apiClient.post('/auth/reset-password', data)
        return response.data
    },
    verifyEmail: async (token: string) => {
        const response = await apiClient.post('/auth/verify-email', { token })
        return response.data
    },

    //logout
    logout: async () => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user_profile')
        localStorage.removeItem('remember_me')
        sessionStorage.removeItem('access_token')
        sessionStorage.removeItem('refresh_token')
        sessionStorage.removeItem('user_profile')
    },
}
    
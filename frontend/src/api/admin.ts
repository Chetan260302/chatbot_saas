import { apiClient } from "./client"

// ── Types ──────────────────────────────────────────────────────

export interface AdminTenant {
  id:            string
  name:          string
  slug:          string
  plan:          string
  is_active:     boolean
  created_at:    string
  chatbot_count: number
  user_count:    number
}

export interface AdminUser {
  id:            string
  email:         string
  full_name:     string
  role:          string
  is_active:     boolean
  is_superadmin: boolean
  tenant_id:     string
  tenant_name:   string
  created_at:    string
}

export interface PlatformStats {
  total_tenants:  number
  active_tenants: number
  total_users:    number
  total_chatbots: number
  total_messages: number
}

export interface AdminChatbot {
  id:             string
  name:           string
  slug:           string
  description:    string | null
  is_active:      boolean
  domain:         string
  tenant_id:      string
  tenant_name:    string
  created_at:     string
  message_count:  number
  document_count: number
}

// ── API ────────────────────────────────────────────────────────

export const adminApi = {
  // Tenants
  listTenants: (search?: string) =>
    apiClient.get<AdminTenant[]>('/admin/tenants', { params: search ? { search } : {} }),

  toggleTenant: (tenantId: string) =>
    apiClient.patch<{ id: string; is_active: boolean }>(`/admin/tenants/${tenantId}/toggle`),

  // Users
  listUsers: (params?: { search?: string; tenant_id?: string }) =>
    apiClient.get<AdminUser[]>('/admin/users', { params }),

  toggleUser: (userId: string) =>
    apiClient.patch<{ id: string; is_active: boolean }>(`/admin/users/${userId}/toggle`),

  // Stats
  platformStats: () =>
    apiClient.get<PlatformStats>('/admin/stats'),

  // Chatbots (cross-tenant)
  listAllChatbots: (params?: { search?: string; tenant_id?: string }) =>
    apiClient.get<AdminChatbot[]>('/admin/chatbots', { params }),

  toggleChatbot: (chatbotId: string) =>
    apiClient.patch<{ id: string; is_active: boolean }>(`/admin/chatbots/${chatbotId}/toggle`),
}

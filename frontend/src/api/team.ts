// src/api/team.ts
import { apiClient } from './client'

export interface TeamMember {
  id:          string
  email:       string
  full_name:   string
  role:        string
  is_active:   boolean
  is_verified: boolean
  created_at:  string
}

export interface InviteMemberPayload {
  email:     string
  full_name: string
  role:      string  // "admin" | "member"
}

export const teamApi = {
  listMembers: () =>
    apiClient.get<TeamMember[]>('/tenant/members'),

  inviteMember: (data: InviteMemberPayload) =>
    apiClient.post<TeamMember>('/tenant/members/invite', data),

  changeMemberRole: (userId: string, role: string) =>
    apiClient.patch<TeamMember>(`/tenant/members/${userId}/role`, { role }),

  removeMember: (userId: string) =>
    apiClient.delete(`/tenant/members/${userId}`),
}

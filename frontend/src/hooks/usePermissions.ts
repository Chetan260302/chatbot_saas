// src/hooks/usePermissions.ts
import { useAuthStore } from '../store/authStore'

/**
 * Centralized permission checks based on user role.
 * Use this hook anywhere you need to show/hide UI elements by role.
 */
export function usePermissions() {
  const { user } = useAuthStore()
  const role = user?.role || 'member'
  const isSuperadmin = user?.is_superadmin ?? false

  return {
    // Chatbot & document management
    canEditChatbots:    isSuperadmin || role === 'owner' || role === 'admin',
    canDeleteChatbots:  isSuperadmin || role === 'owner' || role === 'admin',
    canUploadDocuments: isSuperadmin || role === 'owner' || role === 'admin',

    // Team management
    canManageTeam:      isSuperadmin || role === 'owner' || role === 'admin',
    canInviteMembers:   isSuperadmin || role === 'owner' || role === 'admin',
    canChangeRoles:     isSuperadmin || role === 'owner',
    canRemoveMembers:   isSuperadmin || role === 'owner' || role === 'admin',

    // Sensitive settings
    canViewApiKey:      isSuperadmin || role === 'owner',
    canViewBilling:     isSuperadmin || role === 'owner',
    canDeleteTenant:    role === 'owner',

    // Role checks
    isOwner:   role === 'owner',
    isAdmin:   role === 'admin',
    isMember:  role === 'member',
    isSuperadmin,
    role,
  }
}

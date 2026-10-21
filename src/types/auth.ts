/**
 * src/types/auth.ts — Role-Based Access Control (RBAC) and Auth Types
 */

export type UserRole = 'admin' | 'user_admin' | 'user'

export interface UserRoleMetadata {
  role?: UserRole
  tier?: 'free' | 'pro' | 'enterprise'
  [key: string]: unknown
}

export interface ManagedUser {
  id: string
  fullName: string
  email: string
  imageUrl?: string
  role: UserRole
  createdAt: string
  lastSignInAt?: string
  accountsCount: number
  tradesCount: number
}

import { describe, it, expect } from 'vitest'
import { parseUserRole, getRoleLabel, getRoleBadgeStyle } from '@/hooks/useUserRole'

describe('Role-Based Access Control (RBAC) Utilities', () => {
  describe('parseUserRole', () => {
    it('defaults to "user" when metadata is missing or empty', () => {
      expect(parseUserRole(null)).toBe('user')
      expect(parseUserRole(undefined)).toBe('user')
      expect(parseUserRole({})).toBe('user')
    })

    it('identifies super admin role', () => {
      expect(parseUserRole({ role: 'admin' })).toBe('admin')
      expect(parseUserRole({ user_role: 'admin' })).toBe('admin')
    })

    it('identifies user admin role across common casing variants', () => {
      expect(parseUserRole({ role: 'user_admin' })).toBe('user_admin')
      expect(parseUserRole({ role: 'user-admin' })).toBe('user_admin')
      expect(parseUserRole({ role: 'useradmin' })).toBe('user_admin')
      expect(parseUserRole({ user_role: 'user_admin' })).toBe('user_admin')
    })

    it('defaults unknown or standard roles to "user"', () => {
      expect(parseUserRole({ role: 'user' })).toBe('user')
      expect(parseUserRole({ role: 'trader' })).toBe('user')
      expect(parseUserRole({ role: 'guest' })).toBe('user')
      expect(parseUserRole({ role: 123 as unknown as string })).toBe('user')
    })
  })

  describe('getRoleLabel', () => {
    it('returns human-readable labels', () => {
      expect(getRoleLabel('admin')).toBe('Super Admin')
      expect(getRoleLabel('user_admin')).toBe('User Admin')
      expect(getRoleLabel('user')).toBe('Trader')
    })
  })

  describe('getRoleBadgeStyle', () => {
    it('returns warm amber for admin', () => {
      const style = getRoleBadgeStyle('admin')
      expect(style.text).toContain('text-[#FF8C43]')
      expect(style.bg).toContain('bg-[#FF8C43]/15')
    })

    it('returns emerald green for user_admin', () => {
      const style = getRoleBadgeStyle('user_admin')
      expect(style.text).toContain('text-[#1DB954]')
      expect(style.bg).toContain('bg-[#1DB954]/15')
    })

    it('returns muted neutral for standard trader', () => {
      const style = getRoleBadgeStyle('user')
      expect(style.text).toContain('text-[#A1A1AA]')
    })
  })
})

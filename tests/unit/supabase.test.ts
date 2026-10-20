import { describe, it, expect, vi } from 'vitest'
import {
  supabase,
  getAuthenticatedClient,
  createClerkSupabaseClient,
  supabaseUrl,
  supabaseAnonKey,
} from '@/lib/supabase'

describe('Supabase Client Configuration (Step 1.3)', () => {
  it('instantiates default Supabase singleton client', () => {
    expect(supabase).toBeDefined()
    expect(supabaseUrl).toBeDefined()
    expect(supabaseAnonKey).toBeDefined()
  })

  it('creates an authenticated client with Clerk Bearer token injected', () => {
    const testToken = 'mock-clerk-jwt-token-12345'
    const authenticatedClient = getAuthenticatedClient(testToken)

    expect(authenticatedClient).toBeDefined()
  })

  it('creates dynamic clerk client with token getter function', async () => {
    const mockTokenGetter = vi.fn().mockResolvedValue('mock-dynamic-jwt')
    const dynamicClient = createClerkSupabaseClient(mockTokenGetter)

    expect(dynamicClient).toBeDefined()
  })
})

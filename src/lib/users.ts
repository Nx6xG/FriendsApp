import { useAppStore } from '@/stores/appStore'

/**
 * Global user name cache: UUID → display name.
 * This is the central translation layer between UUIDs (used in data)
 * and display names (shown in UI).
 */
const nameCache = new Map<string, string>()

/**
 * Register a user's name in the cache.
 */
export function registerUser(id: string, name: string) {
  if (id && name) nameCache.set(id, name)
}

/**
 * Get a user's display name by ID.
 * - If the ID is in the cache, return the cached name.
 * - If the ID matches the current user, return their name.
 * - If the ID looks like a plain name (no dashes, short), return as-is (backwards compat).
 * - Otherwise return truncated ID.
 */
export function getUserName(id: string): string {
  if (!id) return 'Unknown'
  const cached = nameCache.get(id)
  if (cached) return cached
  // Check if it's the current user (covers the case where cache is empty after reload)
  const state = useAppStore.getState()
  if (id === state.currentUserId && state.currentUser) {
    registerUser(id, state.currentUser)
    return state.currentUser
  }
  // Backwards compat: if it's not a UUID, it's probably already a name
  if (id.length < 36 && !id.includes('-')) return id
  return id.slice(0, 8)
}

/**
 * Resolve an array of IDs to display names.
 */
export function getUserNames(ids: string[]): string[] {
  return ids.map(getUserName)
}

/**
 * Get the current user's UUID. Returns '' if not logged in.
 */
export function getMyId(): string {
  return useAppStore.getState().currentUserId || ''
}

/**
 * Get the current user's display name.
 */
export function getMyName(): string {
  return useAppStore.getState().currentUser || 'User'
}

/**
 * Check if the given ID is the current user.
 * Handles both UUID and name comparison for backwards compat.
 */
export function isMe(id: string): boolean {
  const state = useAppStore.getState()
  return id === state.currentUserId || id === state.currentUser
}

/**
 * Get the ID to use for new data entries.
 * Returns UUID if logged in, falls back to name for demo mode.
 */
export function getAuthorId(): string {
  const state = useAppStore.getState()
  if (state.demoMode) return state.currentUser
  return state.currentUserId || state.currentUser
}

/**
 * Clear the name cache (call on logout).
 */
export function clearNameCache() {
  nameCache.clear()
}

/**
 * Debug: dump the cache.
 */
export function dumpCache(): Record<string, string> {
  return Object.fromEntries(nameCache)
}

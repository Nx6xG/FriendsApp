import { supabase } from './supabase'
import { useAppStore } from '@/stores/appStore'
import { fetchUserGroups, fetchProfile, fetchNotifications, fetchGroupPrefs } from './supabaseData'
import { registerUser } from './users'
import type { RealtimeChannel } from '@supabase/supabase-js'

let channels: RealtimeChannel[] = []
let syncing = false
let synced = false

/**
 * Initial sync: fetch all data from Supabase and hydrate the store.
 * Runs only once per session.
 */
export async function initSync(userId: string) {
  if (syncing || synced) return
  syncing = true

  try {
    console.log('[Sync] Starting for user:', userId)

    const [groups, profile, notifications, groupPrefs] = await Promise.all([
      fetchUserGroups(userId),
      fetchProfile(userId),
      fetchNotifications(userId),
      fetchGroupPrefs(userId),
    ])

    console.log('[Sync] Fetched:', groups.length, 'groups')

    const store = useAppStore.getState()

    // Register current user
    registerUser(userId, profile?.name || store.currentUser)

    // Merge profile carefully — don't overwrite local values with null
    const mergedProfile = profile
      ? Object.fromEntries(
          Object.entries({ ...store.profile, ...profile }).map(([k, v]) =>
            [k, v !== null && v !== undefined ? v : store.profile[k as keyof typeof store.profile]]
          )
        )
      : store.profile

    // Set everything in the store
    useAppStore.setState({
      groups: groups.length > 0 ? groups : store.groups,
      notifications: notifications.length > 0 ? notifications : store.notifications,
      groupPrefs: Object.keys(groupPrefs).length > 0 ? groupPrefs : store.groupPrefs,
      profile: mergedProfile as typeof store.profile,
      currentUser: profile?.name || store.currentUser,
      currentUserId: userId,
      onboarded: true,
    })

    // Start realtime
    const groupIds = (groups.length > 0 ? groups : store.groups).map((g) => g.id)
    if (groupIds.length > 0) {
      subscribeToChanges(userId, groupIds)
    }

    synced = true
    console.log('[Sync] Complete')
  } catch (e) {
    console.error('[Sync] Failed:', e)
  } finally {
    syncing = false
  }
}

/**
 * Force a full re-sync (e.g. after creating/joining a group).
 */
export async function resync() {
  const userId = useAppStore.getState().currentUserId
  if (!userId) return
  synced = false
  syncing = false
  await initSync(userId)
}

/**
 * Subscribe to realtime changes for all group data.
 */
function subscribeToChanges(userId: string, groupIds: string[]) {
  cleanup()

  // Single channel for all group data changes
  const dataChannel = supabase
    .channel('group-data')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => resyncQuiet())
    .on('postgres_changes', { event: '*', schema: 'public', table: 'todos' }, () => resyncQuiet())
    .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, () => resyncQuiet())
    .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, () => resyncQuiet())
    .on('postgres_changes', { event: '*', schema: 'public', table: 'suggestions' }, () => resyncQuiet())
    .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => resyncQuiet())
    .on('postgres_changes', { event: '*', schema: 'public', table: 'places' }, () => resyncQuiet())
    .on('postgres_changes', { event: '*', schema: 'public', table: 'map_pins' }, () => resyncQuiet())
    .on('postgres_changes', { event: '*', schema: 'public', table: 'feed_items' }, () => resyncQuiet())
    .on('postgres_changes', { event: '*', schema: 'public', table: 'group_members' }, () => resyncQuiet())
    .on('postgres_changes', { event: '*', schema: 'public', table: 'live_locations' }, () => resyncQuiet())
    .subscribe()
  channels.push(dataChannel)

  // Separate channel for user-specific notifications
  const notifChannel = supabase
    .channel('user-notifications')
    .on('postgres_changes', {
      event: 'INSERT', schema: 'public', table: 'notifications',
      filter: `user_id=eq.${userId}`,
    }, (payload) => {
      const n = payload.new
      const store = useAppStore.getState()
      if (store.notifications.some((notif) => notif.id === n.id)) return
      useAppStore.setState({
        notifications: [{
          id: n.id, type: n.type, title: n.title, body: n.body,
          groupId: n.group_id, read: n.read, timestamp: new Date(n.created_at).getTime(),
        }, ...store.notifications],
      })
    })
    .subscribe()
  channels.push(notifChannel)
}

// Debounced resync — don't refetch on every single change
let resyncTimer: ReturnType<typeof setTimeout> | null = null
function resyncQuiet() {
  if (resyncTimer) clearTimeout(resyncTimer)
  resyncTimer = setTimeout(() => {
    const userId = useAppStore.getState().currentUserId
    if (!userId || useAppStore.getState().demoMode) return
    // Fetch fresh data without resetting synced flag
    fetchUserGroups(userId).then((groups) => {
      if (groups.length > 0) {
        useAppStore.setState({ groups })
      }
    }).catch(console.error)
  }, 500) // Wait 500ms to batch rapid changes
}

/**
 * Cleanup all subscriptions.
 */
export function cleanup() {
  channels.forEach((ch) => supabase.removeChannel(ch))
  channels = []
  synced = false
  syncing = false
  if (resyncTimer) clearTimeout(resyncTimer)
}

/**
 * Get the current Supabase user ID.
 */
export async function getCurrentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser()
  return data.user?.id ?? null
}

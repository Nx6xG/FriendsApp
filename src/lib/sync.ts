import { supabase } from './supabase'
import { useAppStore } from '@/stores/appStore'
import { fetchUserGroups, fetchProfile, fetchNotifications, fetchGroupPrefs, dbEnsureProfile } from './supabaseData'
import { registerUser, clearNameCache } from './users'
import { log, logError } from './logger'
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
    log('[Sync] Starting for user:', userId)

    // Trigger server-side cleanup (max once per 24h, async)
    const lastCleanup = Number(localStorage.getItem('lastCleanup') || '0')
    if (Date.now() - lastCleanup > 86400000) {
      localStorage.setItem('lastCleanup', String(Date.now()))
      supabase.rpc('cleanup_old_data').then(() => { log('[Sync] Cleanup done') })
    }

    const [groups, profile, notifications, groupPrefs] = await Promise.all([
      fetchUserGroups(userId),
      fetchProfile(userId),
      fetchNotifications(userId),
      fetchGroupPrefs(userId),
    ])

    log('[Sync] Fetched:', groups.length, 'groups')

    const store = useAppStore.getState()

    // Ensure profile exists in DB (handles case where auth.users exists but profile was deleted)
    if (!profile) {
      const name = store.currentUser || store.profile.name || 'User'
      log('[Sync] No profile found, creating one for:', name)
      await dbEnsureProfile(userId, name)
    }

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
    const hasGroups = (groups.length > 0 ? groups : store.groups).length > 0
    if (hasGroups) {
      subscribeToChanges(userId)
    }

    synced = true
    log('[Sync] Complete')
  } catch (e) {
    logError('[Sync] Failed:', e)
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
function subscribeToChanges(userId: string) {
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
    // Fetch fresh data and MERGE with local state to preserve optimistic updates
    fetchUserGroups(userId).then((serverGroups) => {
      if (serverGroups.length === 0) return
      const localGroups = useAppStore.getState().groups
      // Merge: use server data as base, but keep any local items not yet on server
      const merged = serverGroups.map((sg) => {
        const lg = localGroups.find((l) => l.id === sg.id)
        if (!lg) return sg
        return {
          ...sg,
          // Keep local items that don't exist on server yet (optimistic inserts)
          todos: mergeById(sg.todos, lg.todos),
          expenses: mergeById(sg.expenses, lg.expenses),
          suggestions: mergeById(sg.suggestions, lg.suggestions),
          messages: mergeById(sg.messages, lg.messages),
          events: mergeById(sg.events || [], lg.events || []),
          places: mergeById(sg.places || [], lg.places || []),
          mapPins: mergeById(sg.mapPins || [], lg.mapPins || []),
          feed: mergeById(sg.feed, lg.feed),
          payments: mergeById(sg.payments || [], lg.payments || []),
          liveLocations: sg.liveLocations, // always use server for live data
        }
      })
      // Also keep local-only groups (not yet on server)
      const serverIds = new Set(serverGroups.map((g) => g.id))
      const localOnly = localGroups.filter((g) => !serverIds.has(g.id))
      useAppStore.setState({ groups: [...merged, ...localOnly] })
    }).catch(logError)
  }, 500) // Wait 500ms to batch rapid changes
}

/** Merge two arrays by ID: server wins for existing items, local-only items are kept */
function mergeById<T extends { id: string }>(server: T[], local: T[]): T[] {
  const serverIds = new Set(server.map((s) => s.id))
  const localOnly = local.filter((l) => !serverIds.has(l.id))
  return [...server, ...localOnly]
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
  clearNameCache()
}

/**
 * Get the current Supabase user ID.
 */
export async function getCurrentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser()
  return data.user?.id ?? null
}

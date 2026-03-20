import { supabase } from './supabase'
import { useAppStore } from '@/stores/appStore'
import { fetchUserGroups, fetchProfile, fetchNotifications, fetchGroupPrefs } from './supabaseData'
import { registerUser } from './users'
import type { RealtimeChannel } from '@supabase/supabase-js'

let channels: RealtimeChannel[] = []

/**
 * Initial sync: fetch all data from Supabase and hydrate the Zustand store.
 */
export async function initSync(userId: string) {
  try {
    const [groups, profile, notifications, groupPrefs] = await Promise.all([
      fetchUserGroups(userId),
      fetchProfile(userId),
      fetchNotifications(userId),
      fetchGroupPrefs(userId),
    ])

    const store = useAppStore.getState()

    // Hydrate store with Supabase data
    // Register current user in name cache
    registerUser(userId, profile?.name || store.currentUser)

    // Register all group members in name cache
    for (const group of (groups.length > 0 ? groups : store.groups)) {
      if (group.memberRoles) {
        for (const member of group.memberRoles) {
          // memberRoles.name could be a display name or UUID
          // We register the mapping for display
          registerUser(member.name, member.name)
        }
      }
      // Also register members array entries
      for (const m of group.members) {
        if (!m.includes('-')) registerUser(m, m) // backwards compat: name = name
      }
    }

    // Merge profile: only overwrite fields that have actual values from DB
    const mergedProfile = profile
      ? Object.fromEntries(
          Object.entries({ ...store.profile, ...profile }).map(([k, v]) =>
            [k, v !== null && v !== undefined ? v : store.profile[k as keyof typeof store.profile]]
          )
        )
      : store.profile

    useAppStore.setState({
      groups: groups.length > 0 ? groups : store.groups,
      notifications: notifications.length > 0 ? notifications : store.notifications,
      groupPrefs: Object.keys(groupPrefs).length > 0 ? groupPrefs : store.groupPrefs,
      profile: mergedProfile as typeof store.profile,
      currentUser: profile?.name || store.currentUser,
      onboarded: true,
    })

    // Start realtime subscriptions
    const groupIds = (groups.length > 0 ? groups : store.groups).map((g) => g.id)
    if (groupIds.length > 0) {
      subscribeToChanges(userId, groupIds)
    }
  } catch (e) {
    console.error('Sync failed:', e)
  }
}

/**
 * Subscribe to realtime changes for the user's groups.
 */
function subscribeToChanges(userId: string, groupIds: string[]) {
  // Cleanup existing subscriptions
  cleanup()

  // Messages (most important for chat)
  const msgChannel = supabase
    .channel('messages')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
    }, (payload) => {
      const m = payload.new
      if (!groupIds.includes(m.group_id)) return
      const store = useAppStore.getState()
      // Don't add if already exists (from optimistic update)
      const group = store.groups.find((g) => g.id === m.group_id)
      if (group?.messages.some((msg) => msg.id === m.id)) return

      useAppStore.setState({
        groups: store.groups.map((g) =>
          g.id === m.group_id
            ? { ...g, messages: [...g.messages, {
                id: m.id, authorId: m.author_id, text: m.text,
                embed: m.embed, reactions: m.reactions || [],
                timestamp: new Date(m.created_at).getTime(),
              }] }
            : g
        ),
      })
    })
    .subscribe()
  channels.push(msgChannel)

  // Notifications
  const notifChannel = supabase
    .channel('notifications')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
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

  // Group members (detect new members joining)
  const memberChannel = supabase
    .channel('group_members')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'group_members',
    }, () => {
      // Refetch all groups on membership changes
      initSync(userId)
    })
    .subscribe()
  channels.push(memberChannel)

  // Live locations (frequent updates)
  const liveChannel = supabase
    .channel('live_locations')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'live_locations',
    }, (payload) => {
      const l = payload.new as Record<string, unknown>
      if (!l || !groupIds.includes(l.group_id as string)) return
      const store = useAppStore.getState()
      useAppStore.setState({
        groups: store.groups.map((g) =>
          g.id === l.group_id
            ? {
                ...g,
                liveLocations: [
                  ...(g.liveLocations || []).filter((loc) => loc.userId !== l.user_id),
                  {
                    userId: l.user_id as string, lat: Number(l.lat), lng: Number(l.lng),
                    label: l.label as string | undefined, sharing: l.sharing as boolean,
                    updatedAt: new Date(l.updated_at as string).getTime(),
                  },
                ],
              }
            : g
        ),
      })
    })
    .subscribe()
  channels.push(liveChannel)
}

/**
 * Cleanup all realtime subscriptions.
 */
export function cleanup() {
  channels.forEach((ch) => supabase.removeChannel(ch))
  channels = []
}

/**
 * Get the current Supabase user ID.
 */
export async function getCurrentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser()
  return data.user?.id ?? null
}

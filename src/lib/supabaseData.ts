import { supabase } from './supabase'
import { registerUser } from './users'
import type { Group, TodoItem, Expense, Payment, Suggestion, ChatMessage, GroupEvent, Place, PlaceRating, MapPin as MapPinType, LiveLocation, FeedItem, Notification, UserProfile } from '@/types'

// ─── Fetch all data for a user ────────────────────────────────

export async function fetchUserGroups(userId: string) {
  // Get group IDs the user is a member of
  const { data: memberships } = await supabase
    .from('group_members')
    .select('group_id, role, fun_role')
    .eq('user_id', userId)

  if (!memberships || memberships.length === 0) return []

  const groupIds = memberships.map((m) => m.group_id)

  // Fetch groups
  const { data: groups } = await supabase
    .from('groups')
    .select('*')
    .in('id', groupIds)

  if (!groups) return []

  // Fetch all related data in parallel
  const [
    { data: todos },
    { data: todoComments },
    { data: expenses },
    { data: payments },
    { data: suggestions },
    { data: messages },
    { data: events },
    { data: places },
    { data: placeRatings },
    { data: mapPins },
    { data: liveLocations },
    { data: feedItems },
    { data: allMembers },
    { data: allProfiles },
  ] = await Promise.all([
    supabase.from('todos').select('*').in('group_id', groupIds),
    supabase.from('todo_comments').select('*'),
    supabase.from('expenses').select('*').in('group_id', groupIds),
    supabase.from('payments').select('*').in('group_id', groupIds),
    supabase.from('suggestions').select('*').in('group_id', groupIds),
    supabase.from('messages').select('*').in('group_id', groupIds).order('created_at'),
    supabase.from('events').select('*').in('group_id', groupIds),
    supabase.from('places').select('*').in('group_id', groupIds),
    supabase.from('place_ratings').select('*'),
    supabase.from('map_pins').select('*').in('group_id', groupIds),
    supabase.from('live_locations').select('*').in('group_id', groupIds),
    supabase.from('feed_items').select('*').in('group_id', groupIds).order('created_at', { ascending: false }),
    supabase.from('group_members').select('*, profiles(name)').in('group_id', groupIds),
    supabase.from('profiles').select('*'),
  ])

  // Build nested Group objects
  return groups.map((g): Group => {
    const groupTodos = (todos || []).filter((t) => t.group_id === g.id)
    const groupExpenses = (expenses || []).filter((e) => e.group_id === g.id)
    const groupMembers = (allMembers || []).filter((m) => m.group_id === g.id)
    const groupPlaces = (places || []).filter((p) => p.group_id === g.id)

    return {
      id: g.id,
      name: g.name,
      emoji: g.emoji,
      inviteCode: g.invite_code,
      members: groupMembers.map((m) => {
        const profile = (allProfiles || []).find((p) => p.id === m.user_id)
        const name = profile?.name || 'Unknown'
        registerUser(m.user_id, name)
        return name  // Keep as name for backwards compat — components use names to display
      }),
      memberRoles: groupMembers.map((m) => {
        const profile = (allProfiles || []).find((p) => p.id === m.user_id)
        const name = profile?.name || 'Unknown'
        registerUser(m.user_id, name)
        return { name, role: m.role, funRole: m.fun_role }
      }),
      settings: g.settings || {},
      todos: groupTodos.map((t): TodoItem => ({
        id: t.id,
        text: t.text,
        description: t.description,
        assigneeIds: t.assignee_ids || [],
        tags: t.tags || [],
        priority: t.priority,
        dueDate: t.due_date,
        comments: (todoComments || []).filter((c) => c.todo_id === t.id).map((c) => ({
          id: c.id, authorId: c.author_id, text: c.text, createdAt: new Date(c.created_at).getTime(),
        })),
        linkedItems: t.linked_items || [],
        done: t.done,
        createdAt: new Date(t.created_at).getTime(),
      })),
      expenses: groupExpenses.map((e): Expense => ({
        id: e.id, title: e.title, amount: Number(e.amount), paidById: e.paid_by,
        splitBetween: e.split_between || [], customAmounts: e.custom_amounts,
        category: e.category, recurring: e.recurring, linkedItems: e.linked_items || [],
        date: e.date, createdAt: new Date(e.created_at).getTime(),
      })),
      payments: (payments || []).filter((p) => p.group_id === g.id).map((p): Payment => ({
        id: p.id, from: p.from_user, to: p.to_user, amount: Number(p.amount),
        date: p.date, createdAt: new Date(p.created_at).getTime(),
      })),
      suggestions: (suggestions || []).filter((s) => s.group_id === g.id).map((s): Suggestion => ({
        id: s.id, text: s.text, authorId: s.author_id, votes: s.votes || [],
        done: s.done, mode: s.mode, linkedItems: s.linked_items || [],
        createdAt: new Date(s.created_at).getTime(),
      })),
      messages: (messages || []).filter((m) => m.group_id === g.id).map((m): ChatMessage => ({
        id: m.id, authorId: m.author_id, text: m.text, embed: m.embed,
        reactions: m.reactions || [], timestamp: new Date(m.created_at).getTime(),
      })),
      feed: (feedItems || []).filter((f) => f.group_id === g.id).map((f): FeedItem => ({
        id: f.id, type: f.type, text: f.text, timestamp: new Date(f.created_at).getTime(),
      })),
      events: (events || []).filter((e) => e.group_id === g.id).map((e): GroupEvent => ({
        id: e.id, title: e.title, emoji: e.emoji, date: e.date, time: e.time,
        location: e.location, description: e.description, attendees: e.attendees || [],
        recurrence: e.recurrence, linkedItems: e.linked_items || [],
        createdBy: e.created_by, createdAt: new Date(e.created_at).getTime(),
      })),
      places: groupPlaces.map((p): Place => ({
        id: p.id, name: p.name, emoji: p.emoji, category: p.category, address: p.address,
        ratings: (placeRatings || []).filter((r) => r.place_id === p.id).map((r): PlaceRating => ({
          id: r.id, userId: r.user_id, score: Number(r.score), comment: r.comment,
          createdAt: new Date(r.created_at).getTime(),
        })),
        addedBy: p.added_by, visitedAt: p.visited_at, createdAt: new Date(p.created_at).getTime(),
      })),
      mapPins: (mapPins || []).filter((p) => p.group_id === g.id).map((p): MapPinType => ({
        id: p.id, lat: Number(p.lat), lng: Number(p.lng), label: p.label, emoji: p.emoji,
        type: p.type, addedBy: p.added_by, date: p.date, createdAt: new Date(p.created_at).getTime(),
      })),
      liveLocations: (liveLocations || []).filter((l) => l.group_id === g.id).map((l): LiveLocation => ({
        userId: l.user_id, lat: Number(l.lat), lng: Number(l.lng), label: l.label,
        sharing: l.sharing, updatedAt: new Date(l.updated_at).getTime(),
      })),
      createdAt: new Date(g.created_at).getTime(),
    }
  })
}

export async function fetchProfile(userId: string): Promise<Partial<UserProfile> | null> {
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
  if (!data) return null
  return {
    name: data.name, emoji: data.emoji, status: data.status,
    language: data.language, darkMode: data.dark_mode,
    notificationsEnabled: data.notifications_enabled,
    plan: data.plan || 'free',
    planExpiresAt: data.plan_expires_at ? new Date(data.plan_expires_at).getTime() : undefined,
  }
}

export async function fetchNotifications(userId: string) {
  const { data } = await supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  return (data || []).map((n): Notification => ({
    id: n.id, type: n.type, title: n.title, body: n.body,
    groupId: n.group_id, read: n.read, timestamp: new Date(n.created_at).getTime(),
  }))
}

export async function fetchGroupPrefs(userId: string) {
  const { data } = await supabase.from('user_group_prefs').select('*').eq('user_id', userId)
  const prefs: Record<string, { navTabs: string[]; startTab: string }> = {}
  for (const p of (data || [])) {
    prefs[p.group_id] = { navTabs: p.nav_tabs || ['feed', 'todos', 'expenses', 'chat'], startTab: p.start_tab || '' }
  }
  return prefs
}

// ─── Write operations ─────────────────────────────────────────

// Groups
export const dbInsertGroup = (g: { id: string; name: string; emoji: string; invite_code?: string; settings?: object; created_by: string }) =>
  supabase.from('groups').insert(g)

export const dbUpdateGroup = (id: string, updates: object) =>
  supabase.from('groups').update(updates).eq('id', id)

export const dbDeleteGroup = (id: string) =>
  supabase.from('groups').delete().eq('id', id)

export const dbAddMember = (groupId: string, userId: string, role = 'member') =>
  supabase.from('group_members').insert({ group_id: groupId, user_id: userId, role })

// Todos
export const dbInsertTodo = (groupId: string, t: TodoItem, createdBy: string) =>
  supabase.from('todos').insert({
    id: t.id, group_id: groupId, text: t.text, description: t.description,
    assignee_ids: t.assigneeIds, tags: t.tags, priority: t.priority,
    due_date: t.dueDate, done: t.done, linked_items: t.linkedItems, created_by: createdBy,
  })

export const dbUpdateTodo = (id: string, updates: Partial<TodoItem>) => {
  const mapped: Record<string, unknown> = {}
  if (updates.text !== undefined) mapped.text = updates.text
  if (updates.description !== undefined) mapped.description = updates.description
  if (updates.assigneeIds !== undefined) mapped.assignee_ids = updates.assigneeIds
  if (updates.tags !== undefined) mapped.tags = updates.tags
  if (updates.priority !== undefined) mapped.priority = updates.priority
  if (updates.dueDate !== undefined) mapped.due_date = updates.dueDate
  if (updates.done !== undefined) mapped.done = updates.done
  if (updates.linkedItems !== undefined) mapped.linked_items = updates.linkedItems
  return supabase.from('todos').update(mapped).eq('id', id)
}

export const dbDeleteTodo = (id: string) => supabase.from('todos').delete().eq('id', id)

export const dbInsertTodoComment = (todoId: string, c: { id: string; authorId: string; text: string }) =>
  supabase.from('todo_comments').insert({ id: c.id, todo_id: todoId, author_id: c.authorId, text: c.text })

// Expenses
export const dbInsertExpense = (groupId: string, e: Expense, paidByUserId: string) =>
  supabase.from('expenses').insert({
    id: e.id, group_id: groupId, title: e.title, amount: e.amount,
    paid_by: paidByUserId, split_between: e.splitBetween, custom_amounts: e.customAmounts,
    category: e.category, recurring: e.recurring, linked_items: e.linkedItems, date: e.date,
  })

export const dbUpdateExpense = (id: string, updates: object) =>
  supabase.from('expenses').update(updates).eq('id', id)

export const dbDeleteExpense = (id: string) => supabase.from('expenses').delete().eq('id', id)

export const dbInsertPayment = (groupId: string, p: Payment, fromUserId: string, toUserId: string) =>
  supabase.from('payments').insert({
    id: p.id, group_id: groupId, from_user: fromUserId, to_user: toUserId, amount: p.amount, date: p.date,
  })

export const dbDeletePayment = (id: string) => supabase.from('payments').delete().eq('id', id)

// Suggestions
export const dbInsertSuggestion = (groupId: string, s: Suggestion, authorUserId: string) =>
  supabase.from('suggestions').insert({
    id: s.id, group_id: groupId, text: s.text, author_id: authorUserId,
    votes: s.votes, done: s.done, mode: s.mode, linked_items: s.linkedItems,
  })

export const dbUpdateSuggestion = (id: string, updates: object) =>
  supabase.from('suggestions').update(updates).eq('id', id)

export const dbDeleteSuggestion = (id: string) => supabase.from('suggestions').delete().eq('id', id)

// Messages
export const dbInsertMessage = (groupId: string, m: ChatMessage, authorUserId: string) =>
  supabase.from('messages').insert({
    id: m.id, group_id: groupId, author_id: authorUserId, text: m.text, embed: m.embed, reactions: m.reactions,
  })

export const dbUpdateMessage = (id: string, updates: object) =>
  supabase.from('messages').update(updates).eq('id', id)

// Events
export const dbInsertEvent = (groupId: string, e: GroupEvent, createdByUserId: string) =>
  supabase.from('events').insert({
    id: e.id, group_id: groupId, title: e.title, emoji: e.emoji, date: e.date, time: e.time,
    location: e.location, description: e.description, attendees: e.attendees,
    recurrence: e.recurrence, linked_items: e.linkedItems, created_by: createdByUserId,
  })

export const dbUpdateEvent = (id: string, updates: object) =>
  supabase.from('events').update(updates).eq('id', id)

export const dbDeleteEvent = (id: string) => supabase.from('events').delete().eq('id', id)

// Places
export const dbInsertPlace = (groupId: string, p: Place, addedByUserId: string) =>
  supabase.from('places').insert({
    id: p.id, group_id: groupId, name: p.name, emoji: p.emoji,
    category: p.category, address: p.address, added_by: addedByUserId,
  })

export const dbInsertPlaceRating = (placeId: string, r: PlaceRating, userIdOverride: string) =>
  supabase.from('place_ratings').insert({
    id: r.id, place_id: placeId, user_id: userIdOverride, score: r.score, comment: r.comment,
  })

export const dbDeletePlace = (id: string) => supabase.from('places').delete().eq('id', id)

// Map Pins
export const dbInsertMapPin = (groupId: string, p: MapPinType, addedByUserId: string) =>
  supabase.from('map_pins').insert({
    id: p.id, group_id: groupId, lat: p.lat, lng: p.lng, label: p.label,
    emoji: p.emoji, type: p.type, added_by: addedByUserId, date: p.date,
  })

export const dbDeleteMapPin = (id: string) => supabase.from('map_pins').delete().eq('id', id)

// Live Locations
export const dbUpsertLiveLocation = (groupId: string, l: LiveLocation, userIdOverride: string) =>
  supabase.from('live_locations').upsert({
    group_id: groupId, user_id: userIdOverride, lat: l.lat, lng: l.lng,
    label: l.label, sharing: l.sharing, updated_at: new Date().toISOString(),
  }, { onConflict: 'group_id,user_id' })

// Feed
export const dbInsertFeedItem = (groupId: string, f: FeedItem) =>
  supabase.from('feed_items').insert({ id: f.id, group_id: groupId, type: f.type, text: f.text })

// Notifications
export const dbInsertNotification = (n: Notification, userIdOverride: string) =>
  supabase.from('notifications').insert({
    id: n.id, user_id: userIdOverride, type: n.type, title: n.title,
    body: n.body, group_id: n.groupId, read: n.read,
  })

export const dbUpdateNotification = (id: string, updates: object) =>
  supabase.from('notifications').update(updates).eq('id', id)

// Profile
export const dbUpdateProfile = (userId: string, updates: Partial<UserProfile>) => {
  const mapped: Record<string, unknown> = {}
  if (updates.name !== undefined) mapped.name = updates.name
  if (updates.emoji !== undefined) mapped.emoji = updates.emoji
  if (updates.status !== undefined) mapped.status = updates.status
  if (updates.language !== undefined) mapped.language = updates.language
  if (updates.darkMode !== undefined) mapped.dark_mode = updates.darkMode
  if (updates.notificationsEnabled !== undefined) mapped.notifications_enabled = updates.notificationsEnabled
  return supabase.from('profiles').update(mapped).eq('id', userId)
}

// Group Prefs
export const dbUpsertGroupPrefs = (userId: string, groupId: string, prefs: { navTabs: string[]; startTab: string }) =>
  supabase.from('user_group_prefs').upsert({
    user_id: userId, group_id: groupId, nav_tabs: prefs.navTabs, start_tab: prefs.startTab,
  }, { onConflict: 'user_id,group_id' })

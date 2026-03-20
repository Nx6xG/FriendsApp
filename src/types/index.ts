export interface LinkedItem {
  type: 'event' | 'place' | 'mapPin' | 'todo' | 'expense' | 'suggestion'
  id: string
}

export interface User {
  id: string
  name: string
  avatarUrl?: string
}

export interface TodoComment {
  id: string
  authorId: string
  text: string
  createdAt: number
}

export interface TodoItem {
  id: string
  text: string
  description?: string
  assigneeIds: string[]
  tags?: string[]
  priority?: 'low' | 'medium' | 'high'
  dueDate?: string
  comments?: TodoComment[]
  linkedItems?: LinkedItem[]
  done: boolean
  createdAt: number
}

export type ExpenseCategory = 'food' | 'transport' | 'entertainment' | 'shopping' | 'housing' | 'travel' | 'other'

export interface Expense {
  id: string
  title: string
  amount: number
  paidById: string
  splitBetween: string[]
  customAmounts?: Record<string, number>
  category?: ExpenseCategory
  linkedItems?: LinkedItem[]
  recurring?: 'none' | 'weekly' | 'monthly'
  date: string
  createdAt: number
}

export interface Payment {
  id: string
  from: string
  to: string
  amount: number
  date: string
  createdAt: number
}

export interface Suggestion {
  id: string
  text: string
  authorId: string
  votes: string[]
  done?: boolean
  mode?: 'voting' | 'bucket'
  linkedItems?: LinkedItem[]
  createdAt: number
}

export interface ChatPollOption {
  id: string
  text: string
  votes: string[]
}

export interface ChatEmbed {
  type: 'poll' | 'expense_request' | 'event_invite' | 'todo_assign' | 'link'
  // poll
  pollQuestion?: string
  pollOptions?: ChatPollOption[]
  // expense_request
  expenseTitle?: string
  expenseAmount?: number
  // event_invite
  eventTitle?: string
  eventDate?: string
  eventTime?: string
  eventAttendees?: string[]
  // todo
  todoText?: string
  todoAssignee?: string
  todoDone?: boolean
  // link
  linkedItem?: LinkedItem
}

export interface ChatReaction {
  emoji: string
  users: string[]
}

export interface ChatMessage {
  id: string
  authorId: string
  text: string
  embed?: ChatEmbed
  reactions?: ChatReaction[]
  timestamp: number
}

// Profile / Settings
export type PlanType = 'free' | 'pro'

export interface UserProfile {
  name: string
  emoji: string
  status?: string
  shareLocation: boolean
  notificationsEnabled: boolean
  darkMode: boolean
  language: 'de' | 'en'
  hiddenGroups?: string[]
  plan?: PlanType
  planExpiresAt?: number
}

export interface FeedItem {
  id: string
  type: 'expense' | 'todo' | 'vote' | 'chat' | 'system' | 'suggestion' | 'event' | 'place'
  text: string
  timestamp: number
}

// V2: Events / Kalender
export interface GroupEvent {
  id: string
  title: string
  emoji: string
  date: string        // ISO date string
  time: string        // HH:mm
  location?: string
  description?: string
  attendees: string[]
  linkedItems?: LinkedItem[]
  recurrence?: 'none' | 'weekly' | 'biweekly' | 'monthly'
  createdBy: string
  createdAt: number
}

// V2: Places / Orte bewerten
export interface PlaceRating {
  id: string
  userId: string
  score: number       // 1-5
  comment?: string
  createdAt: number
}

export interface Place {
  id: string
  name: string
  emoji: string
  category: string    // restaurant, bar, cafe, activity, etc.
  address?: string
  ratings: PlaceRating[]
  addedBy: string
  visitedAt?: string
  createdAt: number
}

// V2: Roles
export type MemberRole = 'admin' | 'member' | 'viewer'

export interface MemberWithRole {
  name: string
  role: MemberRole
  funRole?: string    // "Immer zu Spät", "Organisator", etc.
}

export interface TagDef {
  name: string
  color: string
}

export interface GroupSettings {
  todoTags?: TagDef[]
}

export interface UserGroupPrefs {
  navTabs: string[]    // tab keys for the bottom nav (max 4)
  startTab: string     // tab path to open on group entry (e.g. '' for feed, '/chat', etc.)
}

export interface Group {
  id: string
  name: string
  emoji: string
  inviteCode?: string
  members: string[]
  memberRoles?: MemberWithRole[]
  settings?: GroupSettings
  todos: TodoItem[]
  expenses: Expense[]
  payments?: Payment[]
  suggestions: Suggestion[]
  messages: ChatMessage[]
  feed: FeedItem[]
  events?: GroupEvent[]
  places?: Place[]
  // V3
  mapPins?: MapPin[]
  liveLocations?: LiveLocation[]
  createdAt: number
}

export type TabKey = 'feed' | 'todo' | 'money' | 'vote' | 'chat' | 'events' | 'places' | 'stats' | 'map' | 'notifications'

// V3: World Map
export interface MapPin {
  id: string
  lat: number
  lng: number
  label: string
  emoji: string
  type: 'visited' | 'wishlist'
  addedBy: string
  date?: string
  createdAt: number
}

// V3: Live Location (opt-in)
export interface LiveLocation {
  userId: string
  lat: number
  lng: number
  label?: string
  updatedAt: number
  sharing: boolean
}

// V3: Notifications
export interface Notification {
  id: string
  type: 'vote_open' | 'debt' | 'event_reminder' | 'role' | 'expense' | 'todo'
  title: string
  body: string
  groupId: string
  read: boolean
  timestamp: number
}

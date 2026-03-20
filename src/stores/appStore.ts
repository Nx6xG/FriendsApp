import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Group, GroupSettings, UserGroupPrefs, TodoItem, TodoComment, Expense, Payment, Suggestion, ChatMessage, FeedItem, GroupEvent, Place, PlaceRating, MemberWithRole, MapPin, LiveLocation, Notification, UserProfile } from '@/types'
import { uid } from '@/lib/utils'
import { getCurrentUserId, resync } from '@/lib/sync'
import * as db from '@/lib/supabaseData'

// ─── Demo data ──────────────────────────────────────────────────
const now = Date.now()
const h = (hours: number) => now - hours * 3600000
const d = (days: number) => now - days * 86400000

const DEMO_GROUPS: Group[] = [
  {
    id: 'g1',
    name: 'Wiener Squad',
    emoji: '🏙️',
    members: ['Nico', 'Lisa', 'Max', 'Sophie'],
    memberRoles: [
      { name: 'Nico', role: 'admin', funRole: 'Organisator' },
      { name: 'Lisa', role: 'member', funRole: 'Immer zu Spät' },
      { name: 'Max', role: 'member', funRole: 'Der Reiche' },
      { name: 'Sophie', role: 'member', funRole: 'Snack Queen' },
    ],
    todos: [
      { id: 't1', text: 'Bowlinghalle reservieren', assigneeIds: ['Max'], done: false, createdAt: d(3) },
      { id: 't2', text: 'Snacks besorgen', assigneeIds: ['Lisa'], done: true, createdAt: d(5) },
      { id: 't3', text: 'Playlist erstellen', assigneeIds: ['Nico'], done: false, createdAt: d(2) },
      { id: 't4', text: 'Airbnb buchen für Wachau', assigneeIds: ['Sophie', 'Nico'], done: false, createdAt: d(1) },
      { id: 't5', text: 'Escape Room Gutschein einlösen', assigneeIds: ['Max'], done: true, createdAt: d(7) },
    ],
    expenses: [
      { id: 'e1', title: 'Pizza Abend', amount: 48.50, paidById: 'Nico', splitBetween: ['Nico', 'Lisa', 'Max', 'Sophie'], date: '2026-03-15', createdAt: d(4) },
      { id: 'e2', title: 'Kino Tickets', amount: 56.00, paidById: 'Sophie', splitBetween: ['Nico', 'Lisa', 'Sophie'], date: '2026-03-12', createdAt: d(7) },
      { id: 'e3', title: 'Bowling', amount: 72.00, paidById: 'Max', splitBetween: ['Nico', 'Lisa', 'Max', 'Sophie'], date: '2026-03-08', createdAt: d(11) },
      { id: 'e4', title: 'Uber zum Club', amount: 18.90, paidById: 'Lisa', splitBetween: ['Nico', 'Lisa', 'Max'], date: '2026-03-10', createdAt: d(9) },
      { id: 'e5', title: 'Brunch Cafe Leopold', amount: 94.00, paidById: 'Nico', splitBetween: ['Nico', 'Lisa', 'Max', 'Sophie'], date: '2026-03-16', createdAt: d(3) },
      { id: 'e6', title: 'Escape Room', amount: 120.00, paidById: 'Max', splitBetween: ['Nico', 'Lisa', 'Max', 'Sophie'], date: '2026-03-01', createdAt: d(18) },
      { id: 'e7', title: 'Abendessen Plachutta', amount: 156.80, paidById: 'Sophie', splitBetween: ['Nico', 'Lisa', 'Max', 'Sophie'], date: '2026-02-25', createdAt: d(22) },
    ],
    suggestions: [
      { id: 's1', text: 'Escape Room nächstes WE', authorId: 'Lisa', votes: ['Nico', 'Max'], createdAt: d(2) },
      { id: 's2', text: 'Wanderung am Kahlenberg', authorId: 'Max', votes: ['Lisa', 'Sophie', 'Nico'], createdAt: d(3) },
      { id: 's3', text: 'Karaoke Abend', authorId: 'Nico', votes: ['Sophie'], createdAt: d(1) },
      { id: 's4', text: 'Wachau Weinverkostung', authorId: 'Sophie', votes: ['Nico', 'Lisa', 'Max', 'Sophie'], createdAt: d(1) },
    ],
    messages: [
      { id: 'm1', authorId: 'Lisa', text: 'Hey, wer kommt Samstag?', timestamp: h(48) },
      { id: 'm2', authorId: 'Max', text: 'Bin dabei! 🎳', timestamp: h(47) },
      { id: 'm3', authorId: 'Nico', text: 'Same, wird nice', timestamp: h(46) },
      { id: 'm4', authorId: 'Sophie', text: 'Ich auch! Soll ich Snacks mitbringen?', timestamp: h(45) },
      { id: 'm5', authorId: 'Lisa', text: 'Ja bitte! 🙏', timestamp: h(44) },
      { id: 'm6', authorId: 'Max', text: 'Habt ihr die Wachau Idee gesehen? Wär mega', timestamp: h(6) },
      { id: 'm7', authorId: 'Nico', text: 'Unbedingt, hab schon gevotet', timestamp: h(5) },
      { id: 'm8', authorId: 'Sophie', text: 'Ich schau nach Airbnbs! 🏡', timestamp: h(4) },
      { id: 'm9', authorId: 'Lisa', text: 'Perfekt, wann solls losgehen?', timestamp: h(3) },
      { id: 'm10', authorId: 'Max', text: 'Nächstes Wochenende? Freitag bis Sonntag', timestamp: h(2) },
      {
        id: 'm11', authorId: 'Lisa', text: 'Was machen wir am Wochenende?', timestamp: h(1),
        embed: {
          type: 'poll', pollQuestion: 'Was machen wir am Wochenende?',
          pollOptions: [
            { id: 'po1', text: 'Bowling 🎳', votes: ['Lisa', 'Max'] },
            { id: 'po2', text: 'Kino 🎬', votes: ['Sophie'] },
            { id: 'po3', text: 'Escape Room 🔐', votes: ['Nico'] },
            { id: 'po4', text: 'Gemütlich kochen 🍳', votes: [] },
          ],
        },
      },
      {
        id: 'm12', authorId: 'Max', text: 'Wer kommt mit zum Kahlenberg? 🥾', timestamp: h(0.8),
        embed: {
          type: 'event_invite', eventTitle: 'Kahlenberg Wanderung',
          eventDate: '2026-04-05', eventTime: '10:00',
          eventAttendees: ['Max', 'Lisa'],
        },
      },
      {
        id: 'm13', authorId: 'Nico', text: 'Kann jemand die Getränke besorgen?', timestamp: h(0.5),
        embed: {
          type: 'todo_assign', todoText: 'Getränke für Bowling besorgen',
          todoAssignee: 'Sophie', todoDone: false,
        },
      },
    ],
    events: [
      {
        id: 'ev1', title: 'Bowling Night', emoji: '🎳',
        date: '2026-03-22', time: '19:00',
        location: 'Bowlingcenter Plus City',
        description: 'Endlich wieder bowlen! Max reserviert.',
        attendees: ['Nico', 'Lisa', 'Max', 'Sophie'],
        createdBy: 'Max', createdAt: d(3),
      },
      {
        id: 'ev2', title: 'Wachau Wochenende', emoji: '🍷',
        date: '2026-03-28', time: '14:00',
        location: 'Airbnb Dürnstein',
        description: 'Weinverkostung + Wandern + Chillen',
        attendees: ['Nico', 'Sophie', 'Max'],
        createdBy: 'Sophie', createdAt: d(1),
      },
      {
        id: 'ev3', title: 'Kahlenberg Wanderung', emoji: '🥾',
        date: '2026-04-05', time: '10:00',
        location: 'Treffpunkt: U4 Heiligenstadt',
        attendees: ['Lisa', 'Max'],
        createdBy: 'Max', createdAt: d(2),
      },
      {
        id: 'ev4', title: 'Brunch @ Vollpension', emoji: '🥐',
        date: '2026-04-12', time: '11:00',
        location: 'Vollpension, Schleifmühlgasse',
        attendees: ['Nico', 'Lisa', 'Sophie'],
        createdBy: 'Lisa', createdAt: h(12),
      },
    ],
    places: [
      {
        id: 'p1', name: 'Plachutta', emoji: '🥩', category: 'Restaurant',
        address: 'Wollzeile 38, 1010 Wien',
        ratings: [
          { id: 'r1', userId: 'Nico', score: 5, comment: 'Bester Tafelspitz ever', createdAt: d(20) },
          { id: 'r2', userId: 'Sophie', score: 4, comment: 'Super, aber teuer', createdAt: d(20) },
          { id: 'r3', userId: 'Max', score: 5, comment: 'Legendär', createdAt: d(20) },
          { id: 'r4', userId: 'Lisa', score: 4, comment: 'Sehr gut, Portion könnte größer sein', createdAt: d(20) },
        ],
        addedBy: 'Sophie', visitedAt: '2026-02-25', createdAt: d(22),
      },
      {
        id: 'p2', name: 'Cafe Leopold', emoji: '☕', category: 'Café',
        address: 'Museumsplatz 1, 1070 Wien',
        ratings: [
          { id: 'r5', userId: 'Nico', score: 4, comment: 'Top Brunch, coole Vibes', createdAt: d(3) },
          { id: 'r6', userId: 'Lisa', score: 5, comment: 'Mein Lieblingscafe!', createdAt: d(3) },
          { id: 'r7', userId: 'Max', score: 3, comment: 'Ganz ok, nix besonderes', createdAt: d(3) },
        ],
        addedBy: 'Nico', visitedAt: '2026-03-16', createdAt: d(3),
      },
      {
        id: 'p3', name: 'Escape the Room', emoji: '🔐', category: 'Aktivität',
        address: 'Zieglergasse 6, 1070 Wien',
        ratings: [
          { id: 'r8', userId: 'Nico', score: 5, comment: 'Mega spannend, Zombie Room war der Hammer', createdAt: d(17) },
          { id: 'r9', userId: 'Max', score: 5, comment: 'Bestes Escape Room in Wien', createdAt: d(17) },
          { id: 'r10', userId: 'Sophie', score: 4, comment: 'Cool aber ich hab mich gefürchtet 😅', createdAt: d(17) },
        ],
        addedBy: 'Max', visitedAt: '2026-03-01', createdAt: d(18),
      },
      {
        id: 'p4', name: 'Strandbar Herrmann', emoji: '🏖️', category: 'Bar',
        address: 'Herrmannpark, 1030 Wien',
        ratings: [
          { id: 'r11', userId: 'Lisa', score: 5, comment: 'Perfekt im Sommer!', createdAt: d(60) },
          { id: 'r12', userId: 'Nico', score: 4, comment: 'Chill Location', createdAt: d(60) },
        ],
        addedBy: 'Lisa', visitedAt: '2025-07-15', createdAt: d(60),
      },
      {
        id: 'p5', name: 'Bowlingcenter Plus City', emoji: '🎳', category: 'Aktivität',
        address: 'Sterneckstraße 13, 1230 Wien',
        ratings: [
          { id: 'r13', userId: 'Max', score: 4, comment: 'Gute Bahnen, faire Preise', createdAt: d(10) },
          { id: 'r14', userId: 'Nico', score: 3, comment: 'Laut aber ok', createdAt: d(10) },
          { id: 'r15', userId: 'Sophie', score: 4, comment: 'Macht immer Spaß!', createdAt: d(10) },
        ],
        addedBy: 'Max', visitedAt: '2026-03-08', createdAt: d(11),
      },
    ],
    feed: [
      { id: 'f1', type: 'event', text: 'Sophie hat "Wachau Wochenende" erstellt 🍷', timestamp: d(1) },
      { id: 'f2', type: 'expense', text: 'Nico hat "Brunch Cafe Leopold" (€94,00) hinzugefügt', timestamp: d(3) },
      { id: 'f3', type: 'place', text: 'Nico hat "Cafe Leopold" bewertet: ⭐⭐⭐⭐', timestamp: d(3) },
      { id: 'f4', type: 'todo', text: 'Lisa hat "Snacks besorgen" erledigt ✓', timestamp: d(4) },
      { id: 'f5', type: 'expense', text: 'Nico hat "Pizza Abend" (€48,50) hinzugefügt', timestamp: d(4) },
      { id: 'f6', type: 'vote', text: 'Alle haben für "Wachau Weinverkostung" gestimmt 🎉', timestamp: d(5) },
      { id: 'f7', type: 'todo', text: 'Max hat "Escape Room Gutschein einlösen" erledigt ✓', timestamp: d(7) },
      { id: 'f8', type: 'expense', text: 'Sophie hat "Kino Tickets" (€56,00) hinzugefügt', timestamp: d(7) },
      { id: 'f9', type: 'event', text: 'Max hat "Bowling Night" erstellt 🎳', timestamp: d(8) },
      { id: 'f10', type: 'system', text: 'Gruppe "Wiener Squad" wurde erstellt', timestamp: d(30) },
    ],
    mapPins: [
      { id: 'mp1', lat: 48.2082, lng: 16.3738, label: 'Wien', emoji: '🏙️', type: 'visited', addedBy: 'Nico', date: '2026-01', createdAt: d(30) },
      { id: 'mp2', lat: 47.0707, lng: 15.4395, label: 'Graz Wochenende', emoji: '🍷', type: 'visited', addedBy: 'Lisa', date: '2025-09', createdAt: d(180) },
      { id: 'mp3', lat: 47.2692, lng: 11.4041, label: 'Skiurlaub Innsbruck', emoji: '⛷️', type: 'visited', addedBy: 'Max', date: '2026-01', createdAt: d(60) },
      { id: 'mp4', lat: 48.3064, lng: 15.4361, label: 'Wachau Trip', emoji: '🍇', type: 'wishlist', addedBy: 'Sophie', createdAt: d(5) },
      { id: 'mp5', lat: 43.7696, lng: 11.2558, label: 'Florenz', emoji: '🇮🇹', type: 'wishlist', addedBy: 'Nico', createdAt: d(10) },
      { id: 'mp6', lat: 41.3874, lng: 2.1686, label: 'Barcelona', emoji: '🇪🇸', type: 'wishlist', addedBy: 'Lisa', createdAt: d(15) },
      { id: 'mp7', lat: 50.0755, lng: 14.4378, label: 'Prag Citytrip', emoji: '🏰', type: 'visited', addedBy: 'Max', date: '2025-05', createdAt: d(300) },
      { id: 'mp8', lat: 47.8095, lng: 13.0550, label: 'Salzburg Tagesausflug', emoji: '🎵', type: 'visited', addedBy: 'Sophie', date: '2025-11', createdAt: d(120) },
      { id: 'mp9', lat: 35.6762, lng: 139.6503, label: 'Tokyo Traumreise', emoji: '🇯🇵', type: 'wishlist', addedBy: 'Nico', createdAt: d(3) },
      { id: 'mp10', lat: 44.4268, lng: 26.1025, label: 'Bukarest', emoji: '🇷🇴', type: 'wishlist', addedBy: 'Max', createdAt: d(8) },
    ],
    liveLocations: [
      { userId: 'Nico', lat: 48.2100, lng: 16.3700, label: 'Zuhause', updatedAt: h(0.1), sharing: true },
      { userId: 'Lisa', lat: 48.1985, lng: 16.3650, label: 'Uni', updatedAt: h(0.5), sharing: true },
      { userId: 'Max', lat: 48.2150, lng: 16.3800, label: 'Gym', updatedAt: h(1), sharing: true },
      { userId: 'Sophie', lat: 48.2020, lng: 16.3580, sharing: false, updatedAt: h(24) },
    ],
    createdAt: d(30),
  },
  {
    id: 'g2',
    name: 'WG Leopoldstadt',
    emoji: '🏠',
    members: ['Nico', 'Tom', 'Anna'],
    memberRoles: [
      { name: 'Nico', role: 'admin' },
      { name: 'Tom', role: 'member', funRole: 'Putzvermeider' },
      { name: 'Anna', role: 'member', funRole: 'Die Köchin' },
    ],
    todos: [
      { id: 'wt1', text: 'Bad putzen', assigneeIds: ['Tom'], done: false, createdAt: d(1) },
      { id: 'wt2', text: 'Müll rausbringen', assigneeIds: ['Nico'], done: false, createdAt: d(0) },
      { id: 'wt3', text: 'Einkaufen: Milch, Eier, Brot', assigneeIds: ['Anna'], done: true, createdAt: d(2) },
    ],
    expenses: [
      { id: 'we1', title: 'Miete März', amount: 1200, paidById: 'Nico', splitBetween: ['Nico', 'Tom', 'Anna'], date: '2026-03-01', createdAt: d(18) },
      { id: 'we2', title: 'Internet', amount: 29.90, paidById: 'Anna', splitBetween: ['Nico', 'Tom', 'Anna'], date: '2026-03-05', createdAt: d(14) },
      { id: 'we3', title: 'Großeinkauf Billa', amount: 67.40, paidById: 'Tom', splitBetween: ['Nico', 'Tom', 'Anna'], date: '2026-03-14', createdAt: d(5) },
    ],
    suggestions: [
      { id: 'ws1', text: 'Putzplan aufstellen', authorId: 'Anna', votes: ['Anna', 'Nico'], createdAt: d(4) },
      { id: 'ws2', text: 'Balkon bepflanzen', authorId: 'Tom', votes: ['Tom'], createdAt: d(2) },
    ],
    messages: [
      { id: 'wm1', authorId: 'Anna', text: 'Wer hat die Milch leer gemacht? 😤', timestamp: h(8) },
      { id: 'wm2', authorId: 'Tom', text: '...keine Ahnung 👀', timestamp: h(7) },
      { id: 'wm3', authorId: 'Nico', text: 'Guilty 😅 Kauf ich morgen nach', timestamp: h(6) },
    ],
    events: [
      {
        id: 'wev1', title: 'WG Dinner', emoji: '🍝',
        date: '2026-03-21', time: '19:30',
        location: 'Unsere Küche',
        description: 'Anna kocht, rest macht Abwasch',
        attendees: ['Nico', 'Tom', 'Anna'],
        createdBy: 'Anna', createdAt: d(2),
      },
    ],
    places: [
      {
        id: 'wp1', name: 'Billa Plus Taborstraße', emoji: '🛒', category: 'Einkauf',
        address: 'Taborstraße 22, 1020 Wien',
        ratings: [
          { id: 'wr1', userId: 'Anna', score: 3, comment: 'Geht, aber Obst oft schlecht', createdAt: d(10) },
        ],
        addedBy: 'Anna', createdAt: d(10),
      },
    ],
    feed: [
      { id: 'wf1', type: 'todo', text: 'Anna hat "Einkaufen" erledigt ✓', timestamp: d(1) },
      { id: 'wf2', type: 'expense', text: 'Tom hat "Großeinkauf Billa" (€67,40) hinzugefügt', timestamp: d(5) },
      { id: 'wf3', type: 'event', text: 'Anna hat "WG Dinner" erstellt 🍝', timestamp: d(2) },
      { id: 'wf4', type: 'system', text: 'Gruppe "WG Leopoldstadt" wurde erstellt', timestamp: d(60) },
    ],
    createdAt: d(60),
  },
]

const DEMO_NOTIFICATIONS: Notification[] = [
  { id: 'n1', type: 'vote_open', title: 'Offene Abstimmung', body: '4 Vorschläge warten auf deine Stimme', groupId: 'g1', read: false, timestamp: now - 3600000 },
  { id: 'n2', type: 'debt', title: 'Offene Schulden', body: 'Du schuldest Sophie €14,00', groupId: 'g1', read: false, timestamp: now - 7200000 },
  { id: 'n3', type: 'event_reminder', title: 'Bowling Night', body: 'Samstag um 19:00 — bist du dabei?', groupId: 'g1', read: false, timestamp: now - 10800000 },
  { id: 'n4', type: 'expense', title: 'Neue Ausgabe', body: 'Tom hat "Großeinkauf Billa" (€67,40) hinzugefügt', groupId: 'g2', read: true, timestamp: now - 86400000 * 5 },
  { id: 'n5', type: 'todo', title: 'Aufgabe für dich', body: '"Müll rausbringen" wurde dir zugewiesen', groupId: 'g2', read: true, timestamp: now - 86400000 },
]

// ─── Store ──────────────────────────────────────────────────────

interface AppState {
  currentUser: string
  currentUserId: string
  groups: Group[]
  onboarded: boolean
  demoMode: boolean

  setUser: (name: string) => void
  setCurrentUserId: (id: string) => void
  setOnboarded: (v: boolean) => void
  setDemoMode: (v: boolean) => void

  addGroup: (group: Group) => void
  deleteGroup: (groupId: string) => void
  joinGroup: (inviteCode: string) => Group | null
  generateInviteCode: (groupId: string) => string

  // V1
  addTodo: (groupId: string, todo: TodoItem) => void
  updateTodo: (groupId: string, todoId: string, updates: Partial<TodoItem>) => void
  toggleTodo: (groupId: string, todoId: string) => void
  deleteTodo: (groupId: string, todoId: string) => void

  addTodoComment: (groupId: string, todoId: string, comment: TodoComment) => void

  addExpense: (groupId: string, expense: Expense) => void
  updateExpense: (groupId: string, expenseId: string, updates: Partial<Expense>) => void
  deleteExpense: (groupId: string, expenseId: string) => void
  addPayment: (groupId: string, payment: Payment) => void
  deletePayment: (groupId: string, paymentId: string) => void

  addSuggestion: (groupId: string, suggestion: Suggestion) => void
  updateSuggestion: (groupId: string, suggestionId: string, updates: Partial<Suggestion>) => void
  toggleVote: (groupId: string, suggestionId: string, userId: string) => void
  toggleSuggestionDone: (groupId: string, suggestionId: string) => void
  deleteSuggestion: (groupId: string, suggestionId: string) => void

  addMessage: (groupId: string, message: ChatMessage) => void
  addFeedItem: (groupId: string, item: Omit<FeedItem, 'id'>) => void

  // V2
  addEvent: (groupId: string, event: GroupEvent) => void
  updateEvent: (groupId: string, eventId: string, updates: Partial<GroupEvent>) => void
  deleteEvent: (groupId: string, eventId: string) => void
  toggleRSVP: (groupId: string, eventId: string, userId: string) => void

  addPlace: (groupId: string, place: Place) => void
  addPlaceRating: (groupId: string, placeId: string, rating: PlaceRating) => void
  deletePlace: (groupId: string, placeId: string) => void

  updateMemberRole: (groupId: string, memberName: string, role: MemberWithRole) => void
  updateGroupSettings: (groupId: string, settings: Partial<GroupSettings>) => void
  updateGroupInfo: (groupId: string, updates: { name?: string; emoji?: string }) => void

  // V3
  addMapPin: (groupId: string, pin: MapPin) => void
  deleteMapPin: (groupId: string, pinId: string) => void
  updateLiveLocation: (groupId: string, loc: LiveLocation) => void

  notifications: Notification[]
  addNotification: (n: Notification) => void
  markNotificationRead: (id: string) => void
  clearNotifications: () => void

  // User group prefs
  groupPrefs: Record<string, UserGroupPrefs>
  updateGroupPrefs: (groupId: string, prefs: Partial<UserGroupPrefs>) => void
  getGroupPrefs: (groupId: string) => UserGroupPrefs

  // Profile
  profile: UserProfile
  updateProfile: (updates: Partial<UserProfile>) => void

  // Chat embeds
  toggleChatReaction: (groupId: string, messageId: string, emoji: string, userId: string) => void
  voteChatPoll: (groupId: string, messageId: string, optionId: string, userId: string) => void
  rsvpChatEvent: (groupId: string, messageId: string, userId: string) => void
  toggleChatTodo: (groupId: string, messageId: string) => void
  loadDemoData: () => void
  resetAppData: () => void

  getGroup: (groupId: string) => Group | undefined
}

const updateGroup = (groups: Group[], groupId: string, updater: (g: Group) => Group) =>
  groups.map((g) => (g.id === groupId ? updater(g) : g))

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: '',
      currentUserId: '',
      groups: [],
      onboarded: false,
      demoMode: false,

      setUser: (name) => set({ currentUser: name }),
      setCurrentUserId: (id) => set({ currentUserId: id }),
      setOnboarded: (v) => set({ onboarded: v }),
      setDemoMode: (v) => set({ demoMode: v }),

      addGroup: (group) => {
        set((s) => ({ groups: [...s.groups, group] }))
        if (!get().demoMode) {
          getCurrentUserId().then(async (uid) => {
            if (!uid) return
            const { error: groupErr } = await db.dbInsertGroup({
              id: group.id, name: group.name, emoji: group.emoji,
              invite_code: group.inviteCode, settings: group.settings || {},
              created_by: uid,
            })
            if (groupErr) { console.error('[DB]', groupErr); return }

            const { error: memberErr } = await db.dbAddMember(group.id, uid, 'admin')
            if (memberErr) console.error('[DB]', memberErr)

            if (group.feed.length > 0) {
              const feedItem = group.feed[0]
              db.dbInsertFeedItem(group.id, feedItem.id, feedItem.type, feedItem.text).then(({ error: e }) => { if (e) console.error("[DB]", e.message) })
            }

            await resync()
          })
        }
      },
      deleteGroup: (groupId) => {
        set((s) => ({ groups: s.groups.filter((g) => g.id !== groupId) }))
        if (!get().demoMode) {
          db.dbDeleteGroup(groupId).then(({ error }) => {
            if (error) console.error('[DB]', error)
          })
        }
      },

      generateInviteCode: (groupId) => {
        const code = uid().toUpperCase().slice(0, 6)
        set((s) => ({
          groups: updateGroup(s.groups, groupId, (g) => ({ ...g, inviteCode: code })),
        }))
        if (!get().demoMode) db.dbUpdateGroup(groupId, { invite_code: code })
        return code
      },

      joinGroup: (inviteCode) => {
        const state = get()
        const group = state.groups.find((g) => g.inviteCode === inviteCode.toUpperCase())
        if (!group) return null
        if (group.members.includes(state.currentUser)) return group // already a member

        set((s) => ({
          groups: updateGroup(s.groups, group.id, (g) => ({
            ...g,
            members: [...g.members, s.currentUser],
            memberRoles: [...(g.memberRoles || []), { name: s.currentUser, role: 'member' as const }],
            feed: [{ id: uid(), type: 'system' as const, text: `${s.currentUser} ist der Gruppe beigetreten`, timestamp: Date.now() }, ...g.feed],
          })),
        }))
        if (!get().demoMode) {
          getCurrentUserId().then(uid => {
            if (uid) db.dbAddMember(group.id, uid, 'member').then(({ error: e }) => { if (e) console.error("[DB]", e.message) })
          })
        }
        return group
      },

      // V1
      addTodo: (groupId, todo) => {
        set((s) => ({ groups: updateGroup(s.groups, groupId, (g) => ({ ...g, todos: [...g.todos, todo] })) }))
        if (!get().demoMode) getCurrentUserId().then(uid => { if (uid) db.dbInsertTodo(groupId, todo, uid).then(({ error: e }) => { if (e) console.error("[DB]", e.message) }) })
      },
      updateTodo: (groupId, todoId, updates) => {
        set((s) => ({ groups: updateGroup(s.groups, groupId, (g) => ({ ...g, todos: g.todos.map((t) => (t.id === todoId ? { ...t, ...updates } : t)) })) }))
        if (!get().demoMode) db.dbUpdateTodo(todoId, updates).then(({ error: e }) => { if (e) console.error("[DB]", e.message) })
      },
      toggleTodo: (groupId, todoId) => {
        set((s) => ({ groups: updateGroup(s.groups, groupId, (g) => ({ ...g, todos: g.todos.map((t) => (t.id === todoId ? { ...t, done: !t.done } : t)) })) }))
        if (!get().demoMode) { const t = get().groups.find(g => g.id === groupId)?.todos.find(t => t.id === todoId); if (t) db.dbUpdateTodo(todoId, { done: t.done }).then(({ error: e }) => { if (e) console.error("[DB]", e.message) }) }
      },
      deleteTodo: (groupId, todoId) => {
        set((s) => ({ groups: updateGroup(s.groups, groupId, (g) => ({ ...g, todos: g.todos.filter((t) => t.id !== todoId) })) }))
        if (!get().demoMode) db.dbDeleteTodo(todoId).then(({ error: e }) => { if (e) console.error("[DB]", e.message) })
      },

      addTodoComment: (groupId, todoId, comment) => {
        set((s) => ({ groups: updateGroup(s.groups, groupId, (g) => ({
          ...g, todos: g.todos.map((t) => t.id === todoId ? { ...t, comments: [...(t.comments || []), comment] } : t)
        })) }))
        if (!get().demoMode) db.dbInsertTodoComment(todoId, groupId, comment).then(({ error: e }) => { if (e) console.error("[DB]", e.message) })
      },

      addExpense: (groupId, expense) => {
        set((s) => ({ groups: updateGroup(s.groups, groupId, (g) => ({ ...g, expenses: [...g.expenses, expense] })) }))
        if (!get().demoMode) db.dbInsertExpense(groupId, expense).then(({ error: e }) => { if (e) console.error("[DB]", e.message) })
      },
      updateExpense: (groupId, expenseId, updates) => {
        set((s) => ({ groups: updateGroup(s.groups, groupId, (g) => ({ ...g, expenses: g.expenses.map((e) => (e.id === expenseId ? { ...e, ...updates } : e)) })) }))
        if (!get().demoMode) db.dbUpdateExpense(expenseId, updates).then(({ error: e }) => { if (e) console.error("[DB]", e.message) })
      },
      deleteExpense: (groupId, expenseId) => {
        set((s) => ({ groups: updateGroup(s.groups, groupId, (g) => ({ ...g, expenses: g.expenses.filter((e) => e.id !== expenseId) })) }))
        if (!get().demoMode) db.dbDeleteExpense(expenseId).then(({ error: e }) => { if (e) console.error("[DB]", e.message) })
      },
      addPayment: (groupId, payment) => {
        set((s) => ({ groups: updateGroup(s.groups, groupId, (g) => ({ ...g, payments: [...(g.payments || []), payment] })) }))
        if (!get().demoMode) db.dbInsertPayment(groupId, payment).then(({ error: e }) => { if (e) console.error("[DB]", e.message) })
      },
      deletePayment: (groupId, paymentId) => {
        set((s) => ({ groups: updateGroup(s.groups, groupId, (g) => ({ ...g, payments: (g.payments || []).filter((p) => p.id !== paymentId) })) }))
        if (!get().demoMode) db.dbDeletePayment(paymentId).then(({ error: e }) => { if (e) console.error("[DB]", e.message) })
      },

      addSuggestion: (groupId, suggestion) => {
        set((s) => ({ groups: updateGroup(s.groups, groupId, (g) => ({ ...g, suggestions: [...g.suggestions, suggestion] })) }))
        if (!get().demoMode) db.dbInsertSuggestion(groupId, suggestion).then(({ error: e }) => { if (e) console.error("[DB]", e.message) })
      },
      updateSuggestion: (groupId, suggestionId, updates) => {
        set((s) => ({ groups: updateGroup(s.groups, groupId, (g) => ({ ...g, suggestions: g.suggestions.map((sg) => (sg.id === suggestionId ? { ...sg, ...updates } : sg)) })) }))
        if (!get().demoMode) db.dbUpdateSuggestion(suggestionId, updates).then(({ error: e }) => { if (e) console.error("[DB]", e.message) })
      },
      toggleVote: (groupId, suggestionId, userId) => {
        set((s) => ({
          groups: updateGroup(s.groups, groupId, (g) => ({
            ...g,
            suggestions: g.suggestions.map((sg) =>
              sg.id === suggestionId
                ? { ...sg, votes: sg.votes.includes(userId) ? sg.votes.filter((v) => v !== userId) : [...sg.votes, userId] }
                : sg
            ),
          })),
        }))
        if (!get().demoMode) { const s = get().groups.find(g => g.id === groupId)?.suggestions.find(s => s.id === suggestionId); if (s) db.dbUpdateSuggestion(suggestionId, { votes: s.votes }).then(({ error: e }) => { if (e) console.error("[DB]", e.message) }) }
      },
      toggleSuggestionDone: (groupId, suggestionId) => {
        set((s) => ({ groups: updateGroup(s.groups, groupId, (g) => ({ ...g, suggestions: g.suggestions.map((sg) => sg.id === suggestionId ? { ...sg, done: !sg.done } : sg) })) }))
        if (!get().demoMode) { const s = get().groups.find(g => g.id === groupId)?.suggestions.find(s => s.id === suggestionId); if (s) db.dbUpdateSuggestion(suggestionId, { done: s.done }).then(({ error: e }) => { if (e) console.error("[DB]", e.message) }) }
      },
      deleteSuggestion: (groupId, suggestionId) => {
        set((s) => ({ groups: updateGroup(s.groups, groupId, (g) => ({ ...g, suggestions: g.suggestions.filter((sg) => sg.id !== suggestionId) })) }))
        if (!get().demoMode) db.dbDeleteSuggestion(suggestionId).then(({ error: e }) => { if (e) console.error("[DB]", e.message) })
      },

      addMessage: (groupId, message) => {
        set((s) => ({ groups: updateGroup(s.groups, groupId, (g) => ({ ...g, messages: [...g.messages, message] })) }))
        if (!get().demoMode) db.dbInsertMessage(groupId, message).then(({ error: e }) => { if (e) console.error("[DB]", e.message) })
      },
      addFeedItem: (groupId, item) => {
        const itemId = uid()
        set((s) => ({ groups: updateGroup(s.groups, groupId, (g) => ({ ...g, feed: [{ ...item, id: itemId }, ...g.feed] })) }))
        if (!get().demoMode) db.dbInsertFeedItem(groupId, itemId, item.type, item.text).then(({ error: e }) => { if (e) console.error("[DB]", e.message) })
      },

      // V2: Events
      addEvent: (groupId, event) => {
        set((s) => ({ groups: updateGroup(s.groups, groupId, (g) => ({ ...g, events: [...(g.events || []), event] })) }))
        if (!get().demoMode) db.dbInsertEvent(groupId, event).then(({ error: e }) => { if (e) console.error("[DB]", e.message) })
      },
      updateEvent: (groupId, eventId, updates) => {
        set((s) => ({ groups: updateGroup(s.groups, groupId, (g) => ({ ...g, events: (g.events || []).map((e) => (e.id === eventId ? { ...e, ...updates } : e)) })) }))
        if (!get().demoMode) db.dbUpdateEvent(eventId, updates).then(({ error: e }) => { if (e) console.error("[DB]", e.message) })
      },
      deleteEvent: (groupId, eventId) => {
        set((s) => ({ groups: updateGroup(s.groups, groupId, (g) => ({ ...g, events: (g.events || []).filter((e) => e.id !== eventId) })) }))
        if (!get().demoMode) db.dbDeleteEvent(eventId).then(({ error: e }) => { if (e) console.error("[DB]", e.message) })
      },
      toggleRSVP: (groupId, eventId, userId) => {
        set((s) => ({
          groups: updateGroup(s.groups, groupId, (g) => ({
            ...g,
            events: (g.events || []).map((e) =>
              e.id === eventId
                ? { ...e, attendees: e.attendees.includes(userId) ? e.attendees.filter((a) => a !== userId) : [...e.attendees, userId] }
                : e
            ),
          })),
        }))
        if (!get().demoMode) { const e = get().groups.find(g => g.id === groupId)?.events?.find(e => e.id === eventId); if (e) db.dbUpdateEvent(eventId, { attendees: e.attendees }).then(({ error: e }) => { if (e) console.error("[DB]", e.message) }) }
      },

      // V2: Places
      addPlace: (groupId, place) => {
        set((s) => ({ groups: updateGroup(s.groups, groupId, (g) => ({ ...g, places: [...(g.places || []), place] })) }))
        if (!get().demoMode) db.dbInsertPlace(groupId, place).then(({ error: e }) => { if (e) console.error("[DB]", e.message) })
      },
      addPlaceRating: (groupId, placeId, rating) => {
        set((s) => ({
          groups: updateGroup(s.groups, groupId, (g) => ({
            ...g,
            places: (g.places || []).map((p) =>
              p.id === placeId ? { ...p, ratings: [...p.ratings, rating] } : p
            ),
          })),
        }))
        if (!get().demoMode) db.dbInsertPlaceRating(placeId, groupId, rating).then(({ error: e }) => { if (e) console.error("[DB]", e.message) })
      },
      deletePlace: (groupId, placeId) => {
        set((s) => ({ groups: updateGroup(s.groups, groupId, (g) => ({ ...g, places: (g.places || []).filter((p) => p.id !== placeId) })) }))
        if (!get().demoMode) db.dbDeletePlace(placeId).then(({ error: e }) => { if (e) console.error("[DB]", e.message) })
      },

      // V2: Roles & Settings
      updateMemberRole: (groupId, memberName, role) =>
        set((s) => ({
          groups: updateGroup(s.groups, groupId, (g) => ({
            ...g,
            memberRoles: (g.memberRoles || []).map((m) => (m.name === memberName ? role : m)),
          })),
        })),
      updateGroupSettings: (groupId, settings) => {
        set((s) => ({
          groups: updateGroup(s.groups, groupId, (g) => ({
            ...g,
            settings: { ...(g.settings || {}), ...settings },
          })),
        }))
        if (!get().demoMode) db.dbUpdateGroup(groupId, { settings: get().groups.find(g => g.id === groupId)?.settings }).then(({ error: e }) => { if (e) console.error("[DB]", e.message) })
      },
      updateGroupInfo: (groupId, updates) => {
        set((s) => ({
          groups: updateGroup(s.groups, groupId, (g) => ({
            ...g,
            ...(updates.name !== undefined && { name: updates.name }),
            ...(updates.emoji !== undefined && { emoji: updates.emoji }),
          })),
        }))
        if (!get().demoMode) db.dbUpdateGroup(groupId, updates).then(({ error: e }) => { if (e) console.error("[DB]", e.message) })
      },

      // V3: Map
      addMapPin: (groupId, pin) => {
        set((s) => ({ groups: updateGroup(s.groups, groupId, (g) => ({ ...g, mapPins: [...(g.mapPins || []), pin] })) }))
        if (!get().demoMode) db.dbInsertMapPin(groupId, pin).then(({ error: e }) => { if (e) console.error("[DB]", e.message) })
      },
      deleteMapPin: (groupId, pinId) => {
        set((s) => ({ groups: updateGroup(s.groups, groupId, (g) => ({ ...g, mapPins: (g.mapPins || []).filter((p) => p.id !== pinId) })) }))
        if (!get().demoMode) db.dbDeleteMapPin(pinId).then(({ error: e }) => { if (e) console.error("[DB]", e.message) })
      },
      updateLiveLocation: (groupId, loc) => {
        set((s) => ({
          groups: updateGroup(s.groups, groupId, (g) => ({
            ...g,
            liveLocations: [
              ...(g.liveLocations || []).filter((l) => l.userId !== loc.userId),
              loc,
            ],
          })),
        }))
        if (!get().demoMode) db.dbUpsertLiveLocation(groupId, loc).then(({ error: e }) => { if (e) console.error("[DB]", e.message) })
      },

      // Chat reactions
      toggleChatReaction: (groupId, messageId, emoji, userId) => {
        set((s) => ({
          groups: updateGroup(s.groups, groupId, (g) => ({
            ...g,
            messages: g.messages.map((m) => {
              if (m.id !== messageId) return m
              const reactions = [...(m.reactions || [])]
              const existing = reactions.find((r) => r.emoji === emoji)
              if (existing) {
                if (existing.users.includes(userId)) {
                  existing.users = existing.users.filter((u) => u !== userId)
                  if (existing.users.length === 0) {
                    return { ...m, reactions: reactions.filter((r) => r.emoji !== emoji) }
                  }
                } else {
                  existing.users = [...existing.users, userId]
                }
                return { ...m, reactions: [...reactions] }
              }
              return { ...m, reactions: [...reactions, { emoji, users: [userId] }] }
            }),
          })),
        }))
        if (!get().demoMode) { const m = get().groups.find(g => g.id === groupId)?.messages.find(m => m.id === messageId); if (m) db.dbUpdateMessage(messageId, { reactions: m.reactions }).then(({ error: e }) => { if (e) console.error("[DB]", e.message) }) }
      },

      // User group prefs
      groupPrefs: {} as Record<string, UserGroupPrefs>,
      updateGroupPrefs: (groupId, prefs) => {
        set((s) => ({
          groupPrefs: {
            ...s.groupPrefs,
            [groupId]: { ...s.groupPrefs[groupId] || { navTabs: ['feed', 'todos', 'expenses', 'chat'], startTab: '' }, ...prefs },
          },
        }))
        if (!get().demoMode) getCurrentUserId().then(uid => { if (uid) db.dbUpsertGroupPrefs(uid, groupId, get().groupPrefs[groupId]).then(({ error: e }) => { if (e) console.error("[DB]", e.message) }) })
      },
      getGroupPrefs: (groupId) => {
        const p = get().groupPrefs[groupId]
        return p || { navTabs: ['feed', 'todos', 'expenses', 'chat'], startTab: '' }
      },

      // V3: Notifications
      notifications: [] as Notification[],
      addNotification: (n) => {
        set((s) => ({ notifications: [n, ...s.notifications] }))
        if (!get().demoMode) db.dbInsertNotification(n).then(({ error: e }) => { if (e) console.error("[DB]", e.message) })
      },
      markNotificationRead: (id) => {
        set((s) => ({ notifications: s.notifications.map((n) => n.id === id ? { ...n, read: true } : n) }))
        if (!get().demoMode) db.dbUpdateNotification(id, { read: true }).then(({ error: e }) => { if (e) console.error("[DB]", e.message) })
      },
      clearNotifications: () => set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),

      // Profile
      profile: {
        name: '', emoji: '😊', status: undefined,
        shareLocation: false, notificationsEnabled: true, darkMode: true, language: 'de',
      },
      updateProfile: (updates) => {
        set((s) => ({
          profile: { ...s.profile, ...updates },
          currentUser: updates.name || s.currentUser,
        }))
        if (!get().demoMode) getCurrentUserId().then(uid => { if (uid) db.dbUpdateProfile(uid, updates).then(({ error: e }) => { if (e) console.error("[DB]", e.message) }) })
      },

      // Chat embeds
      voteChatPoll: (groupId, messageId, optionId, userId) => {
        set((s) => ({
          groups: updateGroup(s.groups, groupId, (g) => ({
            ...g,
            messages: g.messages.map((m) =>
              m.id === messageId && m.embed?.type === 'poll'
                ? {
                    ...m,
                    embed: {
                      ...m.embed,
                      pollOptions: m.embed.pollOptions?.map((o) =>
                        o.id === optionId
                          ? { ...o, votes: o.votes.includes(userId) ? o.votes.filter((v) => v !== userId) : [...o.votes, userId] }
                          : { ...o, votes: o.votes.filter((v) => v !== userId) } // single choice: remove from others
                      ),
                    },
                  }
                : m
            ),
          })),
        }))
        if (!get().demoMode) { const m = get().groups.find(g => g.id === groupId)?.messages.find(m => m.id === messageId); if (m) db.dbUpdateMessage(messageId, { embed: m.embed }).then(({ error: e }) => { if (e) console.error("[DB]", e.message) }) }
      },

      rsvpChatEvent: (groupId, messageId, userId) => {
        set((s) => ({
          groups: updateGroup(s.groups, groupId, (g) => ({
            ...g,
            messages: g.messages.map((m) =>
              m.id === messageId && m.embed?.type === 'event_invite'
                ? {
                    ...m,
                    embed: {
                      ...m.embed,
                      eventAttendees: m.embed.eventAttendees?.includes(userId)
                        ? m.embed.eventAttendees.filter((a) => a !== userId)
                        : [...(m.embed.eventAttendees || []), userId],
                    },
                  }
                : m
            ),
          })),
        }))
        if (!get().demoMode) { const m = get().groups.find(g => g.id === groupId)?.messages.find(m => m.id === messageId); if (m) db.dbUpdateMessage(messageId, { embed: m.embed }).then(({ error: e }) => { if (e) console.error("[DB]", e.message) }) }
      },

      toggleChatTodo: (groupId, messageId) => {
        set((s) => ({
          groups: updateGroup(s.groups, groupId, (g) => ({
            ...g,
            messages: g.messages.map((m) =>
              m.id === messageId && m.embed?.type === 'todo_assign'
                ? { ...m, embed: { ...m.embed, todoDone: !m.embed.todoDone } }
                : m
            ),
          })),
        }))
        if (!get().demoMode) { const m = get().groups.find(g => g.id === groupId)?.messages.find(m => m.id === messageId); if (m) db.dbUpdateMessage(messageId, { embed: m.embed }).then(({ error: e }) => { if (e) console.error("[DB]", e.message) }) }
      },

      loadDemoData: () => set((s) => {
        // Add demo groups that don't already exist (by id)
        const existingIds = new Set(s.groups.map((g) => g.id))
        const newGroups = DEMO_GROUPS.filter((g) => !existingIds.has(g.id))
        return {
          groups: [...s.groups, ...newGroups],
          onboarded: true,
          currentUser: s.currentUser || 'Nico',
          notifications: [...s.notifications, ...DEMO_NOTIFICATIONS.filter((n) => !s.notifications.some((en) => en.id === n.id))],
          profile: s.currentUser ? s.profile : { name: 'Nico', emoji: '😎', status: 'Auf der Suche nach Abenteuern', shareLocation: false, notificationsEnabled: true, darkMode: true, language: 'de' },
        }
      }),
      resetAppData: () => set({ groups: [], onboarded: false, currentUser: '', notifications: [], profile: { name: '', emoji: '😊', status: undefined, shareLocation: false, notificationsEnabled: true, darkMode: true, language: 'de' } }),

      getGroup: (groupId) => get().groups.find((g) => g.id === groupId),
    }),
    {
      name: 'friends-app-v7',
    }
  )
)

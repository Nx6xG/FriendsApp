import { LayoutDashboard, CheckSquare, Coins, MessageCircle, Calendar, MapPin, BarChart3, Globe, Lightbulb } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface TabDef {
  key: string
  icon: LucideIcon
  label: string
  path: string
  emoji: string
}

export const ALL_TABS: TabDef[] = [
  { key: 'feed', icon: LayoutDashboard, label: 'Feed', path: '', emoji: '📋' },
  { key: 'todos', icon: CheckSquare, label: 'Aufgaben', path: '/todos', emoji: '✅' },
  { key: 'expenses', icon: Coins, label: 'Kosten', path: '/expenses', emoji: '💰' },
  { key: 'chat', icon: MessageCircle, label: 'Chat', path: '/chat', emoji: '💬' },
  { key: 'ideas', icon: Lightbulb, label: 'Ideen', path: '/ideas', emoji: '💡' },
  { key: 'events', icon: Calendar, label: 'Events', path: '/events', emoji: '📅' },
  { key: 'places', icon: MapPin, label: 'Orte', path: '/places', emoji: '📍' },
  { key: 'map', icon: Globe, label: 'Karte', path: '/map', emoji: '🗺️' },
  { key: 'stats', icon: BarChart3, label: 'Stats', path: '/stats', emoji: '📊' },
]

export const DEFAULT_NAV_KEYS = ['feed', 'todos', 'expenses', 'chat']

export const DEFAULT_GROUP_PREFS = { navTabs: DEFAULT_NAV_KEYS, startTab: '' } as const

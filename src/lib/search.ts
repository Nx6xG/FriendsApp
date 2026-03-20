import type { Group } from '@/types'

export interface SearchResult {
  type: 'todo' | 'expense' | 'event' | 'place' | 'chat' | 'suggestion' | 'mapPin'
  id: string
  groupId: string
  groupName: string
  groupEmoji: string
  title: string
  subtitle?: string
  emoji: string
}

const TAB_MAP: Record<SearchResult['type'], string> = {
  todo: 'todos',
  expense: 'expenses',
  event: 'events',
  place: 'places',
  chat: 'chat',
  suggestion: 'ideas',
  mapPin: 'map',
}

export function getTabForType(type: SearchResult['type']): string {
  return TAB_MAP[type]
}

export function searchAll(groups: Group[], query: string): SearchResult[] {
  if (!query.trim()) return []
  const q = query.toLowerCase().trim()
  const results: SearchResult[] = []

  for (const group of groups) {
    const gCtx = { groupId: group.id, groupName: group.name, groupEmoji: group.emoji }

    // Todos
    for (const t of group.todos) {
      if (t.text.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q)) {
        results.push({ ...gCtx, type: 'todo', id: t.id, title: t.text, subtitle: `→ ${t.assigneeIds.join(', ')}`, emoji: '✅' })
      }
    }

    // Expenses
    for (const e of group.expenses) {
      if (e.title.toLowerCase().includes(q)) {
        results.push({ ...gCtx, type: 'expense', id: e.id, title: e.title, subtitle: `${e.paidById} · ${e.date}`, emoji: '💰' })
      }
    }

    // Events
    for (const e of (group.events || [])) {
      if (e.title.toLowerCase().includes(q) || e.location?.toLowerCase().includes(q) || e.description?.toLowerCase().includes(q)) {
        results.push({ ...gCtx, type: 'event', id: e.id, title: e.title, subtitle: `${e.date} · ${e.time}`, emoji: e.emoji })
      }
    }

    // Places
    for (const p of (group.places || [])) {
      if (p.name.toLowerCase().includes(q) || p.address?.toLowerCase().includes(q)) {
        results.push({ ...gCtx, type: 'place', id: p.id, title: p.name, subtitle: p.address || p.category, emoji: p.emoji })
      }
    }

    // Suggestions
    for (const s of group.suggestions) {
      if (s.text.toLowerCase().includes(q)) {
        results.push({ ...gCtx, type: 'suggestion', id: s.id, title: s.text, subtitle: s.authorId, emoji: '💡' })
      }
    }

    // Map pins
    for (const p of (group.mapPins || [])) {
      if (p.label.toLowerCase().includes(q)) {
        results.push({ ...gCtx, type: 'mapPin', id: p.id, title: p.label, subtitle: p.type === 'visited' ? 'Besucht' : 'Wunschliste', emoji: p.emoji })
      }
    }

    // Chat messages (limit to avoid too many results)
    let chatCount = 0
    for (const m of group.messages) {
      if (chatCount >= 5) break
      if (m.text.toLowerCase().includes(q)) {
        results.push({ ...gCtx, type: 'chat', id: m.id, title: m.text, subtitle: `${m.authorId} · ${new Date(m.timestamp).toLocaleDateString()}`, emoji: '💬' })
        chatCount++
      }
    }
  }

  // Sort: prefix matches first, then by title length (shorter = more relevant)
  results.sort((a, b) => {
    const aPrefix = a.title.toLowerCase().startsWith(q) ? 0 : 1
    const bPrefix = b.title.toLowerCase().startsWith(q) ? 0 : 1
    if (aPrefix !== bPrefix) return aPrefix - bPrefix
    return a.title.length - b.title.length
  })

  return results.slice(0, 50)
}

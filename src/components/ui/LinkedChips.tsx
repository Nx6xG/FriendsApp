import { Link2, Plus, X } from 'lucide-react'
import { getT } from '@/lib/i18n'
import type { Group, LinkedItem } from '@/types'

const TYPE_CONFIG: Record<LinkedItem['type'], { emoji: string; color: string; label: string }> = {
  event: { emoji: '📅', color: '#818cf8', label: 'Event' },
  place: { emoji: '📍', color: '#34d399', label: 'Ort' },
  mapPin: { emoji: '🗺️', color: '#fbbf24', label: 'Pin' },
  todo: { emoji: '✅', color: '#38bdf8', label: getT('linked.task') },
  expense: { emoji: '💰', color: '#f472b6', label: 'Kosten' },
  suggestion: { emoji: '💡', color: '#a78bfa', label: 'Idee' },
}

function resolveName(item: LinkedItem, group: Group): string | null {
  switch (item.type) {
    case 'event': return (group.events || []).find((e) => e.id === item.id)?.title ?? null
    case 'place': return (group.places || []).find((p) => p.id === item.id)?.name ?? null
    case 'mapPin': return (group.mapPins || []).find((p) => p.id === item.id)?.label ?? null
    case 'todo': return group.todos.find((t) => t.id === item.id)?.text ?? null
    case 'expense': return group.expenses.find((e) => e.id === item.id)?.title ?? null
    case 'suggestion': return group.suggestions.find((s) => s.id === item.id)?.text ?? null
  }
}

interface Props {
  linkedItems: LinkedItem[]
  group: Group
  onRemove?: (item: LinkedItem) => void
  onAdd?: () => void
}

export function LinkedChips({ linkedItems, group, onRemove, onAdd }: Props) {
  if (linkedItems.length === 0 && !onAdd) return null

  return (
    <div className="flex gap-1.5 flex-wrap items-center">
      {linkedItems.length > 0 && (
        <Link2 size={11} className="text-zinc-600 shrink-0" />
      )}
      {linkedItems.map((item) => {
        const name = resolveName(item, group)
        if (!name) return null
        const cfg = TYPE_CONFIG[item.type]
        return (
          <div key={`${item.type}-${item.id}`}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border"
            style={{ backgroundColor: `${cfg.color}10`, color: cfg.color, borderColor: `${cfg.color}20` }}>
            <span>{cfg.emoji}</span>
            <span className="max-w-[100px] truncate">{name}</span>
            {onRemove && (
              <button onClick={() => onRemove(item)} className="opacity-50 active:opacity-100 -mr-0.5">
                <X size={10} />
              </button>
            )}
          </div>
        )
      })}
      {onAdd && (
        <button onClick={onAdd}
          className="flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-medium text-zinc-500 border border-white/[0.06] active:bg-white/[0.03] transition-colors">
          <Plus size={10} />
        </button>
      )}
    </div>
  )
}

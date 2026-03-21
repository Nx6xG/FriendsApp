import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, X, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getT } from '@/lib/i18n'
import type { Group, LinkedItem } from '@/types'

const SECTIONS: { type: LinkedItem['type']; label: string; emoji: string }[] = [
  { type: 'event', label: 'Events', emoji: '📅' },
  { type: 'place', label: 'Orte', emoji: '📍' },
  { type: 'mapPin', label: 'Karten-Pins', emoji: '🗺️' },
  { type: 'todo', label: getT('linked.tasks'), emoji: '✅' },
  { type: 'expense', label: 'Kosten', emoji: '💰' },
  { type: 'suggestion', label: 'Ideen', emoji: '💡' },
]

function getItemsForType(type: LinkedItem['type'], group: Group): { id: string; label: string; emoji: string }[] {
  switch (type) {
    case 'event': return (group.events || []).map((e) => ({ id: e.id, label: e.title, emoji: e.emoji }))
    case 'place': return (group.places || []).map((p) => ({ id: p.id, label: p.name, emoji: p.emoji }))
    case 'mapPin': return (group.mapPins || []).map((p) => ({ id: p.id, label: p.label, emoji: p.emoji }))
    case 'todo': return group.todos.map((t) => ({ id: t.id, label: t.text, emoji: '✅' }))
    case 'expense': return group.expenses.map((e) => ({ id: e.id, label: e.title, emoji: '💰' }))
    case 'suggestion': return group.suggestions.map((s) => ({ id: s.id, label: s.text, emoji: '💡' }))
  }
}

interface Props {
  group: Group
  availableTypes: LinkedItem['type'][]
  selected: LinkedItem[]
  onConfirm: (items: LinkedItem[]) => void
  onClose: () => void
}

export function LinkPicker({ group, availableTypes, selected, onConfirm, onClose }: Props) {
  const [sel, setSel] = useState<LinkedItem[]>(selected)
  const [search, setSearch] = useState('')

  const query = search.toLowerCase().trim()

  const isSelected = (type: LinkedItem['type'], id: string) =>
    sel.some((s) => s.type === type && s.id === id)

  const toggle = (type: LinkedItem['type'], id: string) => {
    if (isSelected(type, id)) {
      setSel(sel.filter((s) => !(s.type === type && s.id === id)))
    } else {
      setSel([...sel, { type, id }])
    }
  }

  const sections = SECTIONS.filter((s) => availableTypes.includes(s.type))

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full bg-[#161822] rounded-t-3xl px-5 pt-5 pb-8 pb-safe max-h-[70vh] flex flex-col"
      >
        <div className="w-10 h-1 rounded-full bg-zinc-700 mx-auto mb-4" />
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[15px] font-bold">Verknüpfen</h3>
          <button onClick={onClose} className="text-zinc-500 p-1"><X size={18} /></button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Suchen..."
            className="w-full pl-9 pr-3 py-2.5 bg-[#0e1015] border border-white/[0.08] rounded-xl text-white text-sm outline-none focus:border-indigo-500/50 placeholder:text-zinc-600"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-4">
          {sections.map((section) => {
            const allItems = getItemsForType(section.type, group)
            const items = query ? allItems.filter((item) => item.label.toLowerCase().includes(query)) : allItems
            if (items.length === 0) return null
            return (
              <div key={section.type}>
                <h4 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                  {section.emoji} {section.label}
                </h4>
                <div className="flex flex-col gap-1">
                  {items.map((item) => {
                    const checked = isSelected(section.type, item.id)
                    return (
                      <button key={item.id} onClick={() => toggle(section.type, item.id)}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors w-full',
                          checked ? 'bg-indigo-500/10 border border-indigo-500/20' : 'bg-[#0e1015] border border-white/[0.06]'
                        )}>
                        <span className="text-base">{item.emoji}</span>
                        <span className="text-[13px] font-medium flex-1 truncate">{item.label}</span>
                        {checked && (
                          <div className="w-5 h-5 rounded-md bg-indigo-500 flex items-center justify-center">
                            <Check size={12} strokeWidth={3} className="text-white" />
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        <button onClick={() => onConfirm(sel)}
          className="mt-4 w-full py-3 bg-indigo-500 text-white rounded-xl font-bold text-sm active:scale-[0.98] transition-all">
          Fertig ({sel.length} verknüpft)
        </button>
      </motion.div>
    </div>
  )
}

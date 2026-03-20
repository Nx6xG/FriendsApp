import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { timeAgo } from '@/lib/utils'
import { useT } from '@/lib/i18n'
import type { Group } from '@/types'

const TYPE_ICONS: Record<string, string> = {
  expense: '💰', todo: '✅', vote: '🗳️', suggestion: '💡',
  chat: '💬', system: '⚙️', event: '📅', place: '📍',
}

const INITIAL_COUNT = 8
const LOAD_MORE = 6

export function FeedPage() {
  const { group } = useOutletContext<{ group: Group }>()
  const t = useT()
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT)

  const visible = group.feed.slice(0, visibleCount)
  const hasMore = visibleCount < group.feed.length

  return (
    <div className="p-4 flex flex-col h-full">
      <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-3 shrink-0">
        {t('feed.timeline')}
      </h3>

      {group.feed.length === 0 && (
        <p className="text-zinc-600 text-sm py-8 text-center">{t('feed.empty')}</p>
      )}

      <div className="flex flex-col gap-2">
        {visible.map((f, i) => (
          <motion.div
            key={f.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: Math.min(i, 6) * 0.03 }}
            className="flex gap-3 p-3 bg-[#161822] border border-white/[0.06] rounded-2xl"
          >
            <span className="text-base shrink-0 mt-0.5">{TYPE_ICONS[f.type] || '📌'}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] leading-relaxed">{f.text}</p>
              <p className="text-[10px] text-zinc-700 mt-1">{timeAgo(f.timestamp)}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {hasMore && (
        <button
          onClick={() => setVisibleCount((c) => c + LOAD_MORE)}
          className="mt-3 py-2.5 text-center text-[12px] text-indigo-400 font-semibold flex items-center justify-center gap-1.5 active:opacity-70"
        >
          <ChevronDown size={14} /> {t('feed.load_more')} ({group.feed.length - visibleCount})
        </button>
      )}
    </div>
  )
}

import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Plus, Trash2, ThumbsUp, Check, Vote, ListChecks, Link2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/stores/appStore'
import { uid, cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/Avatar'
import { LinkedChips } from '@/components/ui/LinkedChips'
import { LinkPicker } from '@/components/ui/LinkPicker'
import type { Group } from '@/types'

type Mode = 'voting' | 'bucket'

export function IdeasPage() {
  const { group } = useOutletContext<{ group: Group }>()
  const { currentUser, addSuggestion, toggleVote, toggleSuggestionDone, deleteSuggestion, addFeedItem, updateSuggestion } = useAppStore()
  const [text, setText] = useState('')
  const [mode, setMode] = useState<Mode>('voting')
  const [linkingSuggestionId, setLinkingSuggestionId] = useState<string | null>(null)

  const handleAdd = () => {
    if (!text.trim()) return
    addSuggestion(group.id, {
      id: uid(),
      text: text.trim(),
      authorId: currentUser,
      votes: [],
      mode,
      createdAt: Date.now(),
    })
    addFeedItem(group.id, {
      type: mode === 'bucket' ? 'suggestion' : 'suggestion',
      text: mode === 'bucket'
        ? `${currentUser} hat "${text.trim()}" auf die Bucket List gesetzt`
        : `${currentUser} hat "${text.trim()}" vorgeschlagen`,
      timestamp: Date.now(),
    })
    setText('')
  }

  const handleVote = (id: string) => {
    toggleVote(group.id, id, currentUser)
    const s = group.suggestions.find((sg) => sg.id === id)
    if (s && !s.votes.includes(currentUser)) {
      addFeedItem(group.id, {
        type: 'vote',
        text: `${currentUser} hat für "${s.text}" gestimmt`,
        // eslint-disable-next-line react-hooks/purity
        timestamp: Date.now(),
      })
    }
  }

  const handleToggleDone = (id: string) => {
    const s = group.suggestions.find((sg) => sg.id === id)
    toggleSuggestionDone(group.id, id)
    if (s && !s.done) {
      addFeedItem(group.id, {
        type: 'suggestion',
        text: `"${s.text}" wurde von der Bucket List abgehakt ✓`,
        // eslint-disable-next-line react-hooks/purity
        timestamp: Date.now(),
      })
    }
  }

  // Filter by mode
  const items = group.suggestions.filter((s) => (s.mode || 'voting') === mode)
  const votingSorted = [...items].sort((a, b) => b.votes.length - a.votes.length)
  const maxVotes = Math.max(1, ...votingSorted.map((s) => s.votes.length))

  const bucketOpen = items.filter((s) => !s.done)
  const bucketDone = items.filter((s) => s.done)

  return (
    <div className="p-4">
      {/* Mode toggle */}
      <div className="flex bg-[#161822] border border-white/[0.06] rounded-xl p-1 mb-5">
        <button onClick={() => setMode('voting')}
          className={cn('flex-1 flex items-center justify-center gap-1.5 py-3 rounded-lg text-[13px] font-semibold transition-colors',
            mode === 'voting' ? 'bg-indigo-500/15 text-indigo-300' : 'text-zinc-500'
          )}>
          <Vote size={15} /> Voting
        </button>
        <button onClick={() => setMode('bucket')}
          className={cn('flex-1 flex items-center justify-center gap-1.5 py-3 rounded-lg text-[13px] font-semibold transition-colors',
            mode === 'bucket' ? 'bg-emerald-500/15 text-emerald-300' : 'text-zinc-500'
          )}>
          <ListChecks size={15} /> Bucket List
        </button>
      </div>

      {/* Add */}
      <div className="flex gap-2 mb-6">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder={mode === 'voting' ? 'Neuer Vorschlag...' : 'Was wollt ihr mal machen...'}
          className="flex-1 min-w-0 px-3.5 py-3 bg-[#161822] border border-white/[0.08] rounded-xl text-white text-sm outline-none focus:border-indigo-500/50 transition-colors placeholder:text-zinc-600"
        />
        <button onClick={handleAdd}
          className={cn('px-3.5 text-white rounded-xl active:scale-95 transition-transform',
            mode === 'voting' ? 'bg-indigo-500' : 'bg-emerald-500'
          )}>
          <Plus size={18} />
        </button>
      </div>

      {/* ─── Voting Mode ──────────────────────────────────── */}
      {mode === 'voting' && (
        <>
          <h4 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-3">
            Vorschläge ({votingSorted.length})
          </h4>
          <div className="flex flex-col gap-2.5">
            <AnimatePresence>
              {votingSorted.map((s, i) => {
                const voted = s.votes.includes(currentUser)
                const pct = (s.votes.length / maxVotes) * 100
                return (
                  <motion.div key={s.id} layout
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.04 }}
                    className="relative overflow-hidden bg-[#161822] border border-white/[0.06] rounded-2xl">
                    <div className="absolute inset-y-0 left-0 bg-indigo-500/[0.07] transition-all duration-500"
                      style={{ width: `${pct}%` }} />
                    <div className="relative flex items-start gap-3 p-4">
                      <button onClick={() => handleVote(s.id)}
                        className={cn('shrink-0 flex flex-col items-center gap-0.5 pt-0.5 min-w-[44px] transition-colors',
                          voted ? 'text-indigo-400' : 'text-zinc-600 active:text-indigo-400'
                        )}>
                        <ThumbsUp size={18} fill={voted ? 'currentColor' : 'none'} />
                        <span className="text-[11px] font-bold tabular-nums">{s.votes.length}</span>
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-medium leading-snug">{s.text}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Avatar name={s.authorId} size={18} />
                          <span className="text-[11px] text-zinc-500">{s.authorId}</span>
                        </div>
                        {s.votes.length > 0 && (
                          <div className="flex -space-x-1.5 mt-2">
                            {s.votes.map((v) => <Avatar key={v} name={v} size={20} />)}
                          </div>
                        )}
                      </div>
                      {s.authorId === currentUser && (
                        <button onClick={() => deleteSuggestion(group.id, s.id)}
                          className="text-zinc-700 active:text-red-400 p-1 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
            {votingSorted.length === 0 && (
              <p className="text-zinc-600 text-sm py-8 text-center">
                Noch keine Vorschläge — sei der Erste! 💡
              </p>
            )}
          </div>
        </>
      )}

      {/* ─── Bucket List Mode ─────────────────────────────── */}
      {mode === 'bucket' && (
        <>
          {/* Open */}
          <h4 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-3">
            Bucket List ({bucketOpen.length})
          </h4>
          <div className="flex flex-col gap-2 mb-6">
            <AnimatePresence>
              {bucketOpen.map((s, i) => (
                <motion.div key={s.id} layout
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -30 }} transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-3 p-3.5 bg-[#161822] border border-white/[0.06] rounded-2xl">
                  <button onClick={() => handleToggleDone(s.id)}
                    className="w-[22px] h-[22px] rounded-full border-2 border-emerald-500/40 shrink-0 flex items-center justify-center active:border-emerald-400 transition-colors" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium">{s.text}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Avatar name={s.authorId} size={16} />
                      <span className="text-[11px] text-zinc-600">{s.authorId}</span>
                    </div>
                    {s.linkedItems && s.linkedItems.length > 0 && (
                      <div className="mt-1.5">
                        <LinkedChips linkedItems={s.linkedItems} group={group} />
                      </div>
                    )}
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); setLinkingSuggestionId(s.id) }}
                    className="text-zinc-700 active:text-indigo-400 p-1 transition-colors shrink-0">
                    <Link2 size={13} />
                  </button>
                  {s.authorId === currentUser && (
                    <button onClick={() => deleteSuggestion(group.id, s.id)}
                      className="text-zinc-700 active:text-red-400 p-1 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            {bucketOpen.length === 0 && (
              <p className="text-zinc-600 text-sm py-6 text-center">
                Keine offenen Einträge — füg was hinzu! ✨
              </p>
            )}
          </div>

          {/* Done */}
          {bucketDone.length > 0 && (
            <>
              <h4 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-3">
                Erledigt ({bucketDone.length}) 🎉
              </h4>
              <div className="flex flex-col gap-2">
                {bucketDone.map((s) => (
                  <div key={s.id}
                    className="flex items-center gap-3 p-3.5 bg-[#161822] border border-white/[0.06] rounded-2xl opacity-40">
                    <button onClick={() => handleToggleDone(s.id)}
                      className="w-[22px] h-[22px] rounded-full bg-emerald-500 shrink-0 flex items-center justify-center">
                      <Check size={13} strokeWidth={3} className="text-white" />
                    </button>
                    <p className="text-[14px] line-through flex-1">{s.text}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {linkingSuggestionId && (
        <LinkPicker
          group={group}
          availableTypes={['event', 'mapPin', 'place']}
          selected={group.suggestions.find((s) => s.id === linkingSuggestionId)?.linkedItems || []}
          onConfirm={(items) => { updateSuggestion(group.id, linkingSuggestionId, { linkedItems: items }); setLinkingSuggestionId(null) }}
          onClose={() => setLinkingSuggestionId(null)}
        />
      )}
    </div>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAppStore } from '@/stores/appStore'
import { uid } from '@/lib/utils'
import { isMe } from '@/lib/users'
import type { Group } from '@/types'

const EMOJIS = ['👥', '🏙️', '🏖️', '🎮', '🍕', '⚽', '🎵', '📸', '🧗', '🎲', '🏠', '💼', '🎓', '🏋️', '🚗', '🍺', '🎭', '🌍', '❤️', '🎪']

interface Props {
  onClose: () => void
}

export function NewGroupSheet({ onClose }: Props) {
  const [name, setName] = useState('')
  const [membersStr, setMembersStr] = useState('')
  const [emoji, setEmoji] = useState(EMOJIS[0])
  const { currentUser, addGroup } = useAppStore()
  const navigate = useNavigate()

  const handleCreate = () => {
    if (!name.trim()) return
    const parsed = membersStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    const members = [...new Set([currentUser, ...parsed])]

    const group: Group = {
      id: uid(),
      name: name.trim(),
      emoji,
      members,
      memberRoles: members.map((m) => ({
        name: m,
        role: isMe(m) ? 'admin' as const : 'member' as const,
      })),
      todos: [],
      expenses: [],
      suggestions: [],
      messages: [],
      feed: [
        {
          id: uid(),
          type: 'system',
          text: `Gruppe "${name.trim()}" wurde erstellt`,
          timestamp: Date.now(),
        },
      ],
      createdAt: Date.now(),
    }

    addGroup(group)
    onClose()
    navigate(`/group/${group.id}`)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" data-sheet onClick={onClose}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full bg-[#161822] rounded-t-3xl px-5 pt-6 pb-10 pb-safe"
      >
        <div className="w-10 h-1 rounded-full bg-zinc-700 mx-auto mb-6" />
        <h3 className="font-bold text-lg mb-5">Neue Gruppe</h3>

        {/* Emoji picker */}
        <div className="flex gap-2 flex-wrap mb-2">
          {EMOJIS.map((e) => (
            <button
              key={e}
              onClick={() => setEmoji(e)}
              className={`text-2xl p-1.5 rounded-xl border transition-colors ${
                emoji === e
                  ? 'border-indigo-500 bg-indigo-500/10'
                  : 'border-white/[0.06] bg-[#0e1015]'
              }`}
            >
              {e}
            </button>
          ))}
          <input
            type="text"
            placeholder="✏️"
            maxLength={2}
            className="w-[46px] h-[46px] text-center text-2xl bg-[#0e1015] border border-white/[0.06] rounded-xl outline-none focus:border-indigo-500/50"
            onInput={(e) => {
              const val = (e.target as HTMLInputElement).value
              if (val && /\p{Emoji}/u.test(val)) setEmoji(val)
            }}
          />
        </div>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Gruppenname"
          autoFocus
          className="w-full px-4 py-3 bg-[#0e1015] border border-white/[0.08] rounded-xl text-white text-sm outline-none focus:border-indigo-500/50 transition-colors placeholder:text-zinc-600 mb-3"
        />

        <input
          value={membersStr}
          onChange={(e) => setMembersStr(e.target.value)}
          placeholder="Mitglieder (Komma getrennt)"
          className="w-full px-4 py-3 bg-[#0e1015] border border-white/[0.08] rounded-xl text-white text-sm outline-none focus:border-indigo-500/50 transition-colors placeholder:text-zinc-600 mb-6"
        />

        <button
          onClick={handleCreate}
          disabled={!name.trim()}
          className="w-full py-3.5 bg-indigo-500 text-white rounded-2xl font-bold text-[15px] active:scale-[0.98] transition-all disabled:opacity-30"
        >
          Erstellen
        </button>
      </motion.div>
    </div>
  )
}

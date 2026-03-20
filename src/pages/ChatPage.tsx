import { useState, useRef, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Send, Vote, Calendar, CheckSquare, Plus, X, Check, Link2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/stores/appStore'
import { uid, timeAgo, cn } from '@/lib/utils'
import { hapticLight } from '@/lib/haptics'
import { Avatar } from '@/components/ui/Avatar'
import { LinkPicker } from '@/components/ui/LinkPicker'
import type { Group, ChatEmbed, ChatMessage } from '@/types'

const REACTIONS = ['❤️', '😂', '👍', '😮', '😢', '🔥']

// ─── Embed Cards ────────────────────────────────────────────────

function PollEmbed({ message, groupId }: { message: ChatMessage; groupId: string }) {
  const { currentUser, voteChatPoll } = useAppStore()
  const embed = message.embed!
  const options = embed.pollOptions || []
  const totalVotes = options.reduce((s, o) => s + o.votes.length, 0)

  return (
    <div className="mt-2 bg-[#0e1015]/60 rounded-xl p-3 border border-violet-500/15">
      <div className="flex items-center gap-1.5 mb-2">
        <Vote size={12} className="text-violet-400" />
        <span className="text-[10px] font-bold text-violet-400 uppercase tracking-wider">Abstimmung</span>
      </div>
      <p className="text-[12px] font-semibold mb-2.5">{embed.pollQuestion}</p>
      <div className="space-y-1.5">
        {options.map((opt) => {
          const voted = opt.votes.includes(currentUser)
          const pct = totalVotes > 0 ? Math.round((opt.votes.length / totalVotes) * 100) : 0
          return (
            <button key={opt.id} onClick={() => voteChatPoll(groupId, message.id, opt.id, currentUser)}
              className="w-full relative overflow-hidden rounded-lg text-left">
              <div className="absolute inset-y-0 left-0 bg-violet-500/10 transition-all duration-500"
                style={{ width: `${pct}%` }} />
              <div className={cn(
                'relative flex items-center justify-between px-3 py-2 rounded-lg border transition-colors',
                voted ? 'border-violet-500/30 bg-violet-500/5' : 'border-white/[0.06] active:bg-white/[0.02]'
              )}>
                <div className="flex items-center gap-2">
                  {voted && <Check size={11} className="text-violet-400" />}
                  <span className="text-[12px]">{opt.text}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="flex -space-x-1">
                    {opt.votes.slice(0, 3).map((v) => <Avatar key={v} name={v} size={14} />)}
                  </div>
                  <span className="text-[10px] text-zinc-500 tabular-nums">{pct}%</span>
                </div>
              </div>
            </button>
          )
        })}
      </div>
      <p className="text-[10px] text-zinc-600 mt-2">{totalVotes} Stimme{totalVotes !== 1 && 'n'}</p>
    </div>
  )
}

function EventEmbed({ message, groupId }: { message: ChatMessage; groupId: string }) {
  const { currentUser, rsvpChatEvent } = useAppStore()
  const embed = message.embed!
  const going = embed.eventAttendees?.includes(currentUser) || false

  return (
    <div className="mt-2 bg-[#0e1015]/60 rounded-xl p-3 border border-indigo-500/15">
      <div className="flex items-center gap-1.5 mb-2">
        <Calendar size={12} className="text-indigo-400" />
        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Event-Einladung</span>
      </div>
      <p className="text-[13px] font-semibold">{embed.eventTitle}</p>
      <p className="text-[11px] text-zinc-500 mt-1">
        📅 {embed.eventDate} · 🕐 {embed.eventTime}
      </p>
      <div className="flex items-center justify-between mt-2.5">
        <div className="flex -space-x-1.5">
          {(embed.eventAttendees || []).map((a) => <Avatar key={a} name={a} size={20} />)}
          <span className="text-[10px] text-zinc-500 ml-2">{(embed.eventAttendees || []).length} dabei</span>
        </div>
        <button onClick={() => rsvpChatEvent(groupId, message.id, currentUser)}
          className={cn(
            'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-colors',
            going ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
              : 'bg-white/[0.04] text-zinc-400 border border-white/[0.08] active:bg-indigo-500/10'
          )}>
          {going ? <><Check size={10} /> Dabei</> : <><Plus size={10} /> Zusagen</>}
        </button>
      </div>
    </div>
  )
}

function TodoEmbed({ message, groupId }: { message: ChatMessage; groupId: string }) {
  const { toggleChatTodo } = useAppStore()
  const embed = message.embed!
  const done = embed.todoDone || false

  return (
    <div className="mt-2 bg-[#0e1015]/60 rounded-xl p-3 border border-cyan-500/15">
      <div className="flex items-center gap-1.5 mb-2">
        <CheckSquare size={12} className="text-cyan-400" />
        <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Aufgabe</span>
      </div>
      <button onClick={() => toggleChatTodo(groupId, message.id)}
        className="w-full flex items-center gap-2.5 text-left">
        <div className={cn(
          'w-5 h-5 rounded-md border-2 shrink-0 flex items-center justify-center transition-colors',
          done ? 'bg-emerald-500 border-emerald-500' : 'border-zinc-600'
        )}>
          {done && <Check size={11} strokeWidth={3} className="text-white" />}
        </div>
        <div>
          <p className={cn('text-[12px] font-medium', done && 'line-through text-zinc-500')}>{embed.todoText}</p>
          <p className="text-[10px] text-zinc-600 mt-0.5">→ {embed.todoAssignee}</p>
        </div>
      </button>
    </div>
  )
}

function LinkEmbed({ message, group }: { message: ChatMessage; group: Group }) {
  const embed = message.embed!
  const linked = embed.linkedItem
  if (!linked) return null

  let name = ''
  let emoji = '🔗'
  let color = '#818cf8'
  let sub = ''

  switch (linked.type) {
    case 'event': {
      const ev = (group.events || []).find((e) => e.id === linked.id)
      if (!ev) return null
      name = ev.title; emoji = ev.emoji; color = '#818cf8'; sub = `📅 ${ev.date} · 🕐 ${ev.time}`
      break
    }
    case 'place': {
      const pl = (group.places || []).find((p) => p.id === linked.id)
      if (!pl) return null
      name = pl.name; emoji = pl.emoji; color = '#34d399'; sub = pl.address || pl.category
      break
    }
    case 'mapPin': {
      const pin = (group.mapPins || []).find((p) => p.id === linked.id)
      if (!pin) return null
      name = pin.label; emoji = pin.emoji; color = '#fbbf24'; sub = pin.type === 'visited' ? '✅ Besucht' : '✨ Wunschliste'
      break
    }
    case 'todo': {
      const todo = group.todos.find((t) => t.id === linked.id)
      if (!todo) return null
      name = todo.text; emoji = '✅'; color = '#38bdf8'; sub = `→ ${todo.assigneeIds.join(', ')}`
      break
    }
    case 'expense': {
      const exp = group.expenses.find((e) => e.id === linked.id)
      if (!exp) return null
      name = exp.title; emoji = '💰'; color = '#f472b6'; sub = `${exp.paidById} · ${exp.date}`
      break
    }
    case 'suggestion': {
      const sug = group.suggestions.find((s) => s.id === linked.id)
      if (!sug) return null
      name = sug.text; emoji = '💡'; color = '#a78bfa'; sub = sug.authorId
      break
    }
  }

  return (
    <div className="mt-2 rounded-xl p-3 border" style={{ backgroundColor: `${color}08`, borderColor: `${color}20` }}>
      <div className="flex items-center gap-1.5 mb-1.5">
        <Link2 size={11} style={{ color }} />
        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color }}>Verknüpft</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-lg">{emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold truncate">{name}</p>
          {sub && <p className="text-[11px] text-zinc-500 truncate">{sub}</p>}
        </div>
      </div>
    </div>
  )
}

// ─── Embed Creator Toolbar ──────────────────────────────────────

type CreatorMode = null | 'poll' | 'event' | 'todo'

function EmbedCreator({ group, mode, onClose, onSend }: {
  group: Group; mode: CreatorMode; onClose: () => void
  onSend: (text: string, embed: ChatEmbed) => void
}) {
  // Poll
  const [pollQ, setPollQ] = useState('')
  const [pollOpts, setPollOpts] = useState(['', ''])

  // Event
  const [evTitle, setEvTitle] = useState('')
  const [evDate, setEvDate] = useState('')
  const [evTime, setEvTime] = useState('18:00')

  // Todo
  const [todoText, setTodoText] = useState('')
  const [todoAssignee, setTodoAssignee] = useState('')

  const sendPoll = () => {
    const opts = pollOpts.filter((o) => o.trim())
    if (!pollQ.trim() || opts.length < 2) return
    onSend(pollQ.trim(), {
      type: 'poll', pollQuestion: pollQ.trim(),
      pollOptions: opts.map((o) => ({ id: uid(), text: o.trim(), votes: [] })),
    })
    onClose()
  }

  const sendEvent = () => {
    if (!evTitle.trim() || !evDate) return
    onSend(`Wer kommt mit? ${evTitle.trim()}`, {
      type: 'event_invite', eventTitle: evTitle.trim(),
      eventDate: evDate, eventTime: evTime, eventAttendees: [],
    })
    onClose()
  }

  const sendTodo = () => {
    if (!todoText.trim() || !todoAssignee) return
    onSend(`${todoText.trim()}`, {
      type: 'todo_assign', todoText: todoText.trim(),
      todoAssignee, todoDone: false,
    })
    onClose()
  }

  if (mode === 'poll') return (
    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
      className="overflow-hidden border-t border-violet-500/10 bg-[#12141e] px-3 py-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold text-violet-400 flex items-center gap-1"><Vote size={12} /> Abstimmung erstellen</span>
        <button onClick={onClose} className="text-zinc-600 p-0.5"><X size={14} /></button>
      </div>
      <input value={pollQ} onChange={(e) => setPollQ(e.target.value)} placeholder="Frage..."
        className="w-full px-3 py-2 bg-[#0e1015] border border-white/[0.08] rounded-lg text-white text-[12px] outline-none placeholder:text-zinc-600 mb-2" />
      {pollOpts.map((opt, i) => (
        <input key={i} value={opt} onChange={(e) => { const n = [...pollOpts]; n[i] = e.target.value; setPollOpts(n) }}
          placeholder={`Option ${i + 1}`}
          className="w-full px-3 py-1.5 bg-[#0e1015] border border-white/[0.06] rounded-lg text-white text-[12px] outline-none placeholder:text-zinc-700 mb-1" />
      ))}
      <div className="flex gap-2 mt-2">
        {pollOpts.length < 5 && (
          <button onClick={() => setPollOpts([...pollOpts, ''])} className="text-[10px] text-zinc-500 active:text-zinc-300">+ Option</button>
        )}
        <div className="flex-1" />
        <button onClick={sendPoll} className="px-3 py-1.5 bg-violet-500 text-white rounded-lg text-[11px] font-semibold active:scale-95">
          Senden
        </button>
      </div>
    </motion.div>
  )

  if (mode === 'event') return (
    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
      className="overflow-hidden border-t border-indigo-500/10 bg-[#12141e] px-3 py-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold text-indigo-400 flex items-center gap-1"><Calendar size={12} /> Event teilen</span>
        <button onClick={onClose} className="text-zinc-600 p-0.5"><X size={14} /></button>
      </div>
      <input value={evTitle} onChange={(e) => setEvTitle(e.target.value)} placeholder="Event Name"
        className="w-full px-3 py-2 bg-[#0e1015] border border-white/[0.08] rounded-lg text-white text-[12px] outline-none placeholder:text-zinc-600 mb-1.5" />
      <div className="flex gap-1.5">
        <input type="date" value={evDate} onChange={(e) => setEvDate(e.target.value)}
          className="flex-1 px-3 py-1.5 bg-[#0e1015] border border-white/[0.08] rounded-lg text-zinc-400 text-[12px] outline-none" />
        <input type="time" value={evTime} onChange={(e) => setEvTime(e.target.value)}
          className="w-24 px-3 py-1.5 bg-[#0e1015] border border-white/[0.08] rounded-lg text-zinc-400 text-[12px] outline-none" />
      </div>
      <div className="flex justify-end mt-2">
        <button onClick={sendEvent} className="px-3 py-1.5 bg-indigo-500 text-white rounded-lg text-[11px] font-semibold active:scale-95">
          Senden
        </button>
      </div>
    </motion.div>
  )

  if (mode === 'todo') return (
    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
      className="overflow-hidden border-t border-cyan-500/10 bg-[#12141e] px-3 py-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold text-cyan-400 flex items-center gap-1"><CheckSquare size={12} /> Aufgabe zuweisen</span>
        <button onClick={onClose} className="text-zinc-600 p-0.5"><X size={14} /></button>
      </div>
      <input value={todoText} onChange={(e) => setTodoText(e.target.value)} placeholder="Aufgabe..."
        className="w-full px-3 py-2 bg-[#0e1015] border border-white/[0.08] rounded-lg text-white text-[12px] outline-none placeholder:text-zinc-600 mb-1.5" />
      <select value={todoAssignee} onChange={(e) => setTodoAssignee(e.target.value)}
        className="w-full px-3 py-1.5 bg-[#0e1015] border border-white/[0.08] rounded-lg text-zinc-400 text-[12px] outline-none">
        <option value="">Zuweisen an...</option>
        {group.members.map((m) => <option key={m} value={m}>{m}</option>)}
      </select>
      <div className="flex justify-end mt-2">
        <button onClick={sendTodo} className="px-3 py-1.5 bg-cyan-500 text-white rounded-lg text-[11px] font-semibold active:scale-95">
          Senden
        </button>
      </div>
    </motion.div>
  )

  return null
}

// ─── Main Chat Page ─────────────────────────────────────────────

export function ChatPage() {
  const { group } = useOutletContext<{ group: Group }>()
  const { currentUser, addMessage, addFeedItem, toggleChatReaction } = useAppStore()
  const [text, setText] = useState('')
  const [creatorMode, setCreatorMode] = useState<CreatorMode>(null)
  const [showLinkPicker, setShowLinkPicker] = useState(false)
  const [reactingTo, setReactingTo] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom on new messages and when keyboard opens (layout resize)
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [group.messages.length])

  useEffect(() => {
    const root = document.getElementById('root')
    if (!root) return
    const observer = new ResizeObserver(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    })
    observer.observe(root)
    return () => observer.disconnect()
  }, [])

  const handleSend = () => {
    if (!text.trim()) return
    addMessage(group.id, {
      id: uid(), authorId: currentUser, text: text.trim(), timestamp: Date.now(),
    })
    setText('')
  }

  const handleSendWithEmbed = (msgText: string, embed: ChatEmbed) => {
    addMessage(group.id, {
      id: uid(), authorId: currentUser, text: msgText, embed, timestamp: Date.now(),
    })
    const labels: Record<string, string> = { poll: 'eine Abstimmung', event_invite: 'ein Event', todo_assign: 'eine Aufgabe' }
    addFeedItem(group.id, {
      type: 'chat', text: `${currentUser} hat ${labels[embed.type] || 'etwas'} im Chat geteilt`,
      timestamp: Date.now(),
    })
  }

  const renderEmbed = (msg: ChatMessage) => {
    if (!msg.embed) return null
    switch (msg.embed.type) {
      case 'poll': return <PollEmbed message={msg} groupId={group.id} />
      case 'event_invite': return <EventEmbed message={msg} groupId={group.id} />
      case 'todo_assign': return <TodoEmbed message={msg} groupId={group.id} />
      case 'link': return <LinkEmbed message={msg} group={group} />
      default: return null
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-1.5">
        {group.messages.length === 0 && (
          <p className="text-zinc-600 text-sm text-center py-12">Starte die Konversation! 💬</p>
        )}
        {group.messages.map((m, i) => {
          const isOwn = m.authorId === currentUser
          const showAvatar = i === 0 || group.messages[i - 1].authorId !== m.authorId

          return (
            <motion.div key={m.id}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              onDoubleClick={() => setReactingTo(reactingTo === m.id ? null : m.id)}
              className={cn(
                'flex gap-2 select-none',
                isOwn ? 'self-end flex-row-reverse max-w-[88%]' : 'self-start max-w-[88%]',
                !showAvatar && !isOwn && 'ml-9'
              )}>
              {showAvatar && !isOwn && <Avatar name={m.authorId} size={28} className="mt-1" />}
              <div className={cn('min-w-0', m.embed && 'w-full')}>
                {showAvatar && !isOwn && (
                  <p className="text-[10px] text-zinc-600 mb-0.5 ml-1">{m.authorId}</p>
                )}
                <div className={cn(
                  'px-3.5 py-2.5 rounded-2xl text-[13.5px] leading-relaxed',
                  isOwn ? 'bg-indigo-500 text-white rounded-tr-md' : 'bg-[#1c1f2e] text-zinc-200 rounded-tl-md'
                )}>
                  {m.text}
                </div>
                {renderEmbed(m)}
                <p className={cn('text-[10px] text-zinc-700 mt-0.5', isOwn ? 'text-right mr-1' : 'ml-1')}>
                  {timeAgo(m.timestamp)}
                </p>
                {/* Reactions display */}
                {m.reactions && m.reactions.length > 0 && (
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {m.reactions.map((r) => (
                      <button key={r.emoji} onClick={() => { toggleChatReaction(group.id, m.id, r.emoji, currentUser); hapticLight() }}
                        className={cn('flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[11px] border transition-colors',
                          r.users.includes(currentUser) ? 'bg-indigo-500/15 border-indigo-500/25' : 'bg-white/[0.03] border-white/[0.06]'
                        )}>
                        <span>{r.emoji}</span>
                        <span className="text-[10px] text-zinc-500">{r.users.length}</span>
                      </button>
                    ))}
                  </div>
                )}
                {/* Reaction picker */}
                {reactingTo === m.id && (
                  <div className="flex gap-1 mt-1.5">
                    {REACTIONS.map((emoji) => (
                      <button key={emoji} onClick={() => { toggleChatReaction(group.id, m.id, emoji, currentUser); hapticLight(); setReactingTo(null) }}
                        className="text-lg p-1 rounded-lg active:scale-125 transition-transform active:bg-white/[0.05]">
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Embed creator */}
      <AnimatePresence>
        {creatorMode && (
          <EmbedCreator group={group} mode={creatorMode}
            onClose={() => setCreatorMode(null)} onSend={handleSendWithEmbed} />
        )}
      </AnimatePresence>

      {/* Input area */}
      <div className="shrink-0 border-t border-white/[0.06] bg-[#0e1015]">
        {/* Quick-attach bar */}
        <div className="flex gap-1 px-3 pt-2">
          {([
            { mode: 'poll' as const, icon: Vote, label: 'Abstimmung', color: 'text-violet-400 bg-violet-500/10 border-violet-500/15' },
            { mode: 'event' as const, icon: Calendar, label: 'Event', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/15' },
            { mode: 'todo' as const, icon: CheckSquare, label: 'Aufgabe', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/15' },
          ] as const).map((item) => (
            <button key={item.mode}
              onClick={() => setCreatorMode(creatorMode === item.mode ? null : item.mode)}
              className={cn(
                'flex items-center gap-1 px-2.5 py-2 rounded-lg text-[11px] font-semibold border transition-colors',
                creatorMode === item.mode ? item.color : 'text-zinc-600 bg-transparent border-transparent active:bg-white/[0.03]'
              )}>
              <item.icon size={13} /> {item.label}
            </button>
          ))}
          <button onClick={() => setShowLinkPicker(true)}
            className={cn(
              'flex items-center gap-1 px-2.5 py-2 rounded-lg text-[11px] font-semibold border transition-colors',
              showLinkPicker ? 'text-amber-400 bg-amber-500/10 border-amber-500/15' : 'text-zinc-600 bg-transparent border-transparent active:bg-white/[0.03]'
            )}>
            <Link2 size={13} /> Link
          </button>
        </div>
        {/* Text input */}
        <div className="flex gap-2 p-3 pb-safe">
          <input value={text} onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Nachricht..."
            className="flex-1 px-4 py-3 bg-[#161822] border border-white/[0.08] rounded-2xl text-white text-sm outline-none focus:border-indigo-500/50 transition-colors placeholder:text-zinc-600" />
          <button onClick={handleSend} disabled={!text.trim()}
            className="px-4 bg-indigo-500 text-white rounded-2xl active:scale-95 transition-all disabled:opacity-30">
            <Send size={16} />
          </button>
        </div>
      </div>

      {/* Link picker */}
      {showLinkPicker && (
        <LinkPicker
          group={group}
          availableTypes={['event', 'place', 'mapPin', 'todo', 'expense', 'suggestion']}
          selected={[]}
          onConfirm={(items) => {
            items.forEach((item) => {
              addMessage(group.id, {
                id: uid(), authorId: currentUser,
                text: '🔗',
                embed: { type: 'link', linkedItem: item },
                timestamp: Date.now(),
              })
            })
            if (items.length > 0) {
              addFeedItem(group.id, {
                type: 'chat',
                text: `${currentUser} hat ${items.length === 1 ? 'eine Verknüpfung' : `${items.length} Verknüpfungen`} im Chat geteilt`,
                timestamp: Date.now(),
              })
            }
            setShowLinkPicker(false)
          }}
          onClose={() => setShowLinkPicker(false)}
        />
      )}
    </div>
  )
}

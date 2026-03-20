import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Plus, Trash2, Check, X, ChevronRight, Calendar, Tag, MessageCircle, Send, Link2 } from 'lucide-react'
import { motion, AnimatePresence, type PanInfo } from 'framer-motion'
import { useAppStore } from '@/stores/appStore'
import { uid, cn, timeAgo } from '@/lib/utils'
import { Avatar } from '@/components/ui/Avatar'
import { LinkedChips } from '@/components/ui/LinkedChips'
import { notifyTodoAssigned } from '@/lib/notifications'
import { hapticSuccess, hapticLight } from '@/lib/haptics'
import { getAuthorId, getUserName } from '@/lib/users'
import { LinkPicker } from '@/components/ui/LinkPicker'
import { useT } from '@/lib/i18n'
import type { Group, TodoItem } from '@/types'

const PRIORITY_CONFIG = {
  low: { label: 'Niedrig', color: 'text-zinc-400', bg: 'bg-zinc-500/10', dot: 'bg-zinc-400' },
  medium: { label: 'Mittel', color: 'text-amber-400', bg: 'bg-amber-500/10', dot: 'bg-amber-400' },
  high: { label: 'Hoch', color: 'text-red-400', bg: 'bg-red-500/10', dot: 'bg-red-400' },
}

// ─── Todo Detail Sheet ────────────────────────────────────────

function TodoDetail({ todo, group, onClose }: { todo: TodoItem; group: Group; onClose: () => void }) {
  const { currentUser, updateTodo, toggleTodo, deleteTodo, addFeedItem, addTodoComment } = useAppStore()
  const t = useT()
  const [desc, setDesc] = useState(todo.description || '')
  const [assignees, setAssignees] = useState<string[]>(todo.assigneeIds)
  const [priority, setPriority] = useState(todo.priority || 'medium')
  const [dueDate, setDueDate] = useState(todo.dueDate || '')
  const [selectedTags, setSelectedTags] = useState<string[]>(todo.tags || [])
  const [editingDesc, setEditingDesc] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [showLinkPicker, setShowLinkPicker] = useState(false)

  const availableTags = group.settings?.todoTags || []

  const save = (updates: Partial<TodoItem>) => {
    updateTodo(group.id, todo.id, updates)
  }

  const handleToggleTag = (tag: string) => {
    const next = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag]
    setSelectedTags(next)
    save({ tags: next })
  }

  const handleToggle = () => {
    toggleTodo(group.id, todo.id)
    if (!todo.done) {
      addFeedItem(group.id, {
        type: 'todo',
        text: `${currentUser} hat "${todo.text}" erledigt ✓`,
        timestamp: Date.now(),
      })
    }
    onClose()
  }

  const handleDelete = () => {
    deleteTodo(group.id, todo.id)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" data-sheet onClick={onClose}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full bg-[#161822] rounded-t-3xl px-5 pt-5 pb-8 pb-safe max-h-[85vh] overflow-y-auto"
      >
        <div className="w-10 h-1 rounded-full bg-zinc-700 mx-auto mb-5" />

        {/* Header */}
        <div className="flex items-start gap-3 mb-5">
          <button onClick={handleToggle}
            className={cn('w-6 h-6 rounded-lg border-2 shrink-0 flex items-center justify-center mt-0.5 transition-colors',
              todo.done ? 'bg-emerald-500 border-emerald-500' : 'border-zinc-600 active:border-indigo-500'
            )}>
            {todo.done && <Check size={14} strokeWidth={3} className="text-white" />}
          </button>
          <div className="flex-1 min-w-0">
            <h3 className={cn('text-[16px] font-bold', todo.done && 'line-through text-zinc-500')}>{todo.text}</h3>
            <p className="text-[11px] text-zinc-600 mt-0.5">{timeAgo(todo.createdAt)}</p>
          </div>
          <button onClick={onClose} className="text-zinc-500 p-1"><X size={18} /></button>
        </div>

        {/* Assignees */}
        <div className="mb-4">
          <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block">{t('todos.assigned_to')}</label>
          <div className="flex gap-2 flex-wrap">
            {group.members.map((m) => {
              const selected = assignees.includes(m)
              return (
                <button key={m} onClick={() => {
                  const next = selected
                    ? assignees.filter((a) => a !== m)
                    : [...assignees, m]
                  if (next.length === 0) return // mind. 1 Person
                  setAssignees(next)
                  save({ assigneeIds: next })
                }}
                  className={cn('flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-medium transition-colors',
                    selected ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/20' : 'bg-[#0e1015] text-zinc-400 border border-white/[0.06]'
                  )}>
                  <Avatar name={m} size={18} />
                  {getUserName(m)}
                  {selected && <Check size={12} />}
                </button>
              )
            })}
          </div>
        </div>

        {/* Priority */}
        <div className="mb-4">
          <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block">{t('todos.priority')}</label>
          <div className="flex gap-2">
            {(['low', 'medium', 'high'] as const).map((p) => {
              const cfg = PRIORITY_CONFIG[p]
              return (
                <button key={p} onClick={() => { setPriority(p); save({ priority: p }) }}
                  className={cn('flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-medium transition-colors',
                    priority === p ? `${cfg.bg} ${cfg.color} border border-current/20` : 'bg-[#0e1015] text-zinc-500 border border-white/[0.06]'
                  )}>
                  <div className={cn('w-2 h-2 rounded-full', cfg.dot)} />
                  {t(`todos.priority_${p}`)}
                </button>
              )
            })}
          </div>
        </div>

        {/* Due date */}
        <div className="mb-4">
          <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block">{t('todos.due_date')}</label>
          <div className="flex gap-2">
            <input type="date" value={dueDate}
              onChange={(e) => { setDueDate(e.target.value); save({ dueDate: e.target.value || undefined }) }}
              className="flex-1 px-3 py-2.5 bg-[#0e1015] border border-white/[0.08] rounded-xl text-zinc-300 text-sm outline-none" />
            {dueDate && (
              <button onClick={() => { setDueDate(''); save({ dueDate: undefined }) }}
                className="px-3 py-2.5 bg-[#0e1015] border border-white/[0.06] rounded-xl text-zinc-500 text-xs">
                {t('delete')}
              </button>
            )}
          </div>
        </div>

        {/* Tags */}
        {availableTags.length > 0 && (
          <div className="mb-4">
            <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block">{t('todos.tags')}</label>
            <div className="flex gap-1.5 flex-wrap">
              {availableTags.map((tag) => {
                const selected = selectedTags.includes(tag.name)
                return (
                  <button key={tag.name} onClick={() => handleToggleTag(tag.name)}
                    className="px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors border"
                    style={selected
                      ? { backgroundColor: `${tag.color}15`, color: tag.color, borderColor: `${tag.color}25` }
                      : { backgroundColor: '#0e1015', color: '#71717a', borderColor: 'rgba(255,255,255,0.06)' }
                    }>
                    {tag.name}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Links */}
        <div className="mb-4">
          <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block">{t('todos.linked')}</label>
          <LinkedChips
            linkedItems={todo.linkedItems || []}
            group={group}
            onRemove={(item) => save({ linkedItems: (todo.linkedItems || []).filter((l) => !(l.type === item.type && l.id === item.id)) })}
            onAdd={() => setShowLinkPicker(true)}
          />
        </div>

        {/* Description */}
        <div className="mb-6">
          <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block">{t('todos.description')}</label>
          {editingDesc ? (
            <div>
              <textarea value={desc} onChange={(e) => setDesc(e.target.value)}
                rows={3} autoFocus
                className="w-full px-3 py-2.5 bg-[#0e1015] border border-white/[0.08] rounded-xl text-white text-sm outline-none focus:border-indigo-500/50 placeholder:text-zinc-600 resize-none"
                placeholder={t('todos.desc_placeholder')} />
              <div className="flex justify-end gap-2 mt-2">
                <button onClick={() => { setDesc(todo.description || ''); setEditingDesc(false) }}
                  className="px-3 py-1.5 text-[11px] text-zinc-500">{t('cancel')}</button>
                <button onClick={() => { save({ description: desc.trim() || undefined }); setEditingDesc(false) }}
                  className="px-3 py-1.5 bg-indigo-500 text-white rounded-lg text-[11px] font-semibold">{t('save')}</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setEditingDesc(true)}
              className="w-full text-left px-3 py-2.5 bg-[#0e1015] border border-white/[0.06] rounded-xl text-sm transition-colors active:bg-white/[0.02]">
              {desc ? (
                <span className="text-zinc-300">{desc}</span>
              ) : (
                <span className="text-zinc-600">{t('todos.add_desc')}</span>
              )}
            </button>
          )}
        </div>

        {/* Comments */}
        <div className="mb-6">
          <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block">{t('todos.comments')}</label>
          {(todo.comments || []).length > 0 && (
            <div className="flex flex-col gap-2 mb-3">
              {(todo.comments || []).map((c) => (
                <div key={c.id} className="flex items-start gap-2 px-3 py-2 bg-[#0e1015] border border-white/[0.06] rounded-xl">
                  <Avatar name={c.authorId} size={20} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-semibold text-zinc-300">{getUserName(c.authorId)}</span>
                      <span className="text-[10px] text-zinc-600">{timeAgo(c.createdAt)}</span>
                    </div>
                    <p className="text-[12px] text-zinc-400 mt-0.5 break-words">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && commentText.trim()) {
                  addTodoComment(group.id, todo.id, { id: uid(), authorId: getAuthorId(), text: commentText.trim(), createdAt: Date.now() })
                  setCommentText('')
                }
              }}
              placeholder={t('todos.comment_placeholder')}
              className="flex-1 min-w-0 px-3 py-2.5 bg-[#0e1015] border border-white/[0.08] rounded-xl text-white text-sm outline-none focus:border-indigo-500/50 transition-colors placeholder:text-zinc-600"
            />
            <button
              onClick={() => {
                if (!commentText.trim()) return
                addTodoComment(group.id, todo.id, { id: uid(), authorId: getAuthorId(), text: commentText.trim(), createdAt: Date.now() })
                setCommentText('')
              }}
              className="px-3 bg-indigo-500 text-white rounded-xl active:scale-95 transition-transform"
            >
              <Send size={14} />
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button onClick={handleToggle}
            className={cn('flex-1 py-3 rounded-xl font-bold text-sm active:scale-[0.98] transition-all',
              todo.done ? 'bg-zinc-700 text-zinc-300' : 'bg-emerald-500 text-white'
            )}>
            {todo.done ? t('todos.reopen') : t('todos.mark_done')}
          </button>
          <button onClick={handleDelete}
            className="px-4 py-3 bg-red-500/10 text-red-400 rounded-xl active:scale-[0.98] transition-all">
            <Trash2 size={16} />
          </button>
        </div>
      </motion.div>
      {showLinkPicker && (
        <LinkPicker
          group={group}
          availableTypes={['event', 'place', 'mapPin', 'expense']}
          selected={todo.linkedItems || []}
          onConfirm={(items) => { save({ linkedItems: items }); setShowLinkPicker(false) }}
          onClose={() => setShowLinkPicker(false)}
        />
      )}
    </div>
  )
}

// ─── Main Todos Page ─────────────────────────────────────────

export function TodosPage() {
  const { group } = useOutletContext<{ group: Group }>()
  const { currentUser, addTodo, toggleTodo, addFeedItem } = useAppStore()
  const tr = useT()
  const [text, setText] = useState('')
  const [assignee, setAssignee] = useState('')
  const [selectedTodo, setSelectedTodo] = useState<TodoItem | null>(null)

  const handleAdd = () => {
    if (!text.trim()) return
    const assignees = assignee ? [assignee] : [currentUser]
    const t: TodoItem = {
      id: uid(),
      text: text.trim(),
      assigneeIds: assignees,
      priority: 'medium',
      done: false,
      createdAt: Date.now(),
    }
    addTodo(group.id, t)
    notifyTodoAssigned(t, group.id)
    addFeedItem(group.id, {
      type: 'todo',
      text: `${currentUser} hat "${t.text}" erstellt → ${assignees.map(getUserName).join(', ')}`,
      timestamp: Date.now(),
    })
    setText('')
    setAssignee('')
    hapticLight()
  }

  const handleToggle = (id: string) => {
    const todo = group.todos.find((t) => t.id === id)
    toggleTodo(group.id, id)
    if (todo && !todo.done) {
      addFeedItem(group.id, {
        type: 'todo',
        text: `${currentUser} hat "${todo.text}" erledigt ✓`,
        // eslint-disable-next-line react-hooks/purity
        timestamp: Date.now(),
      })
    }
  }

  // Refresh selectedTodo from store
  const activeTodo = selectedTodo ? group.todos.find((t) => t.id === selectedTodo.id) || null : null

  const open = group.todos.filter((t) => !t.done)
  const done = group.todos.filter((t) => t.done)

  return (
    <div className="p-4">
      {/* Add form */}
      <div className="flex gap-2 mb-6">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder={tr('todos.new')}
          className="flex-1 min-w-0 px-3.5 py-3 bg-[#161822] border border-white/[0.08] rounded-xl text-white text-sm outline-none focus:border-indigo-500/50 transition-colors placeholder:text-zinc-600"
        />
        <select
          value={assignee}
          onChange={(e) => setAssignee(e.target.value)}
          className="w-24 px-2 py-3 bg-[#161822] border border-white/[0.08] rounded-xl text-zinc-400 text-xs outline-none"
        >
          <option value="">{tr('todos.who')}</option>
          {group.members.map((m) => (
            <option key={m} value={m}>{getUserName(m)}</option>
          ))}
        </select>
        <button
          onClick={handleAdd}
          className="px-3.5 bg-indigo-500 text-white rounded-xl active:scale-95 transition-transform"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Open */}
      <h4 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2.5">
        {tr('open')} ({open.length})
      </h4>
      <div className="flex flex-col gap-2 mb-6">
        <AnimatePresence>
          {open.map((t) => {
            const prio = t.priority ? PRIORITY_CONFIG[t.priority] : null
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -40 }}
                drag="x"
                dragConstraints={{ left: -100, right: 0 }}
                dragElastic={0.1}
                onDragEnd={(_: unknown, info: PanInfo) => {
                  if (info.offset.x < -80) {
                    handleToggle(t.id)
                    hapticSuccess()
                  }
                }}
                className="flex items-center gap-3 p-3.5 bg-[#161822] border border-white/[0.06] rounded-2xl active:bg-white/[0.02] transition-colors"
              >
                <button
                  onClick={(e) => { e.stopPropagation(); handleToggle(t.id); hapticSuccess() }}
                  className="w-[22px] h-[22px] rounded-md border-2 border-zinc-600 shrink-0 flex items-center justify-center active:border-indigo-500 transition-colors"
                />
                <button onClick={() => setSelectedTodo(t)} className="flex-1 min-w-0 text-left">
                  <div className="flex items-center gap-2">
                    <p className="text-[13px] font-medium truncate">{t.text}</p>
                    {prio && <div className={cn('w-1.5 h-1.5 rounded-full shrink-0', prio.dot)} />}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-zinc-600">→ {(t.assigneeIds || []).map(getUserName).join(', ')}</span>
                    {t.dueDate && (
                      <span className="text-[10px] text-zinc-600 flex items-center gap-0.5">
                        <Calendar size={9} /> {t.dueDate}
                      </span>
                    )}
                    {t.tags && t.tags.length > 0 && (
                      <span className="text-[10px] text-indigo-400/70 flex items-center gap-0.5">
                        <Tag size={9} /> {t.tags.length}
                      </span>
                    )}
                    {t.comments && t.comments.length > 0 && (
                      <span className="text-[10px] text-zinc-500 flex items-center gap-0.5">
                        <MessageCircle size={9} /> {t.comments.length}
                      </span>
                    )}
                    {t.linkedItems && t.linkedItems.length > 0 && (
                      <span className="text-[10px] text-zinc-500 flex items-center gap-0.5">
                        <Link2 size={9} /> {t.linkedItems.length}
                      </span>
                    )}
                  </div>
                </button>
                <ChevronRight size={14} className="text-zinc-700 shrink-0" />
              </motion.div>
            )
          })}
        </AnimatePresence>
        {open.length === 0 && (
          <p className="text-zinc-600 text-sm py-4 text-center">{tr('todos.all_done')}</p>
        )}
      </div>

      {/* Done */}
      {done.length > 0 && (
        <>
          <h4 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2.5">
            {tr('done')} ({done.length})
          </h4>
          <div className="flex flex-col gap-2">
            {done.map((t) => (
              <div
                key={t.id}
                onClick={() => setSelectedTodo(t)}
                className="flex items-center gap-3 p-3.5 bg-[#161822] border border-white/[0.06] rounded-2xl opacity-40 active:opacity-60 transition-opacity"
              >
                <button
                  onClick={(e) => { e.stopPropagation(); handleToggle(t.id) }}
                  className="w-[22px] h-[22px] rounded-md bg-emerald-500/80 shrink-0 flex items-center justify-center"
                >
                  <Check size={13} strokeWidth={3} className="text-white" />
                </button>
                <p className="text-[13px] line-through flex-1 truncate">{t.text}</p>
                <ChevronRight size={14} className="text-zinc-700 shrink-0" />
              </div>
            ))}
          </div>
        </>
      )}

      {/* Detail sheet */}
      <AnimatePresence>
        {activeTodo && (
          <TodoDetail todo={activeTodo} group={group} onClose={() => setSelectedTodo(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}

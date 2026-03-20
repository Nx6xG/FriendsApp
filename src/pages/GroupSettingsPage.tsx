import { useState } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import { Plus, X, Trash2, Shield, Crown, Eye, Pencil, Share2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAppStore } from '@/stores/appStore'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/Avatar'
import { getUserName } from '@/lib/users'
import { ALL_TABS, DEFAULT_GROUP_PREFS } from '@/lib/tabs'
import { useT } from '@/lib/i18n'
import type { Group, MemberRole, TagDef } from '@/types'

const EMOJIS = ['👥', '🏙️', '🏖️', '🎮', '🍕', '⚽', '🎵', '📸', '🧗', '🎲', '🏠', '💼', '🎓', '🏋️', '🚗', '🍺', '🎭', '🌍', '❤️', '🎪']

const TAG_COLORS = ['#818cf8', '#f472b6', '#34d399', '#fbbf24', '#f87171', '#38bdf8', '#a78bfa', '#fb923c']

const ROLE_CONFIG: Record<MemberRole, { label: string; icon: typeof Shield; color: string }> = {
  admin: { label: 'Admin', icon: Crown, color: 'text-amber-400' },
  member: { label: 'Mitglied', icon: Shield, color: 'text-indigo-400' },
  viewer: { label: 'Zuschauer', icon: Eye, color: 'text-zinc-400' },
}

export function GroupSettingsPage() {
  const { group } = useOutletContext<{ group: Group }>()
  const navigate = useNavigate()
  const { currentUser, currentUserId, updateGroupInfo, updateGroupSettings, updateMemberRole, deleteGroup, groupPrefs, updateGroupPrefs, generateInviteCode } = useAppStore()
  const t = useT()
  const [name, setName] = useState(group.name)
  const [emoji, setEmoji] = useState(group.emoji)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [newTag, setNewTag] = useState('')
  const [selectedColor, setSelectedColor] = useState(TAG_COLORS[0])
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [editingTag, setEditingTag] = useState<string | null>(null)
  const [editTagName, setEditTagName] = useState('')
  const [editTagColor, setEditTagColor] = useState('')

  const prefs = groupPrefs[group.id] ?? DEFAULT_GROUP_PREFS

  const tags = group.settings?.todoTags || []
  const memberRoles = group.memberRoles || group.members.map((m) => ({ name: m, role: 'member' as MemberRole, funRole: undefined }))
  const isAdmin = memberRoles.find((m) => m.name === currentUserId || m.name === currentUser)?.role === 'admin'

  const handleSaveName = () => {
    if (name.trim() && name.trim() !== group.name) {
      updateGroupInfo(group.id, { name: name.trim() })
    }
  }

  const handleEmojiSelect = (e: string) => {
    setEmoji(e)
    updateGroupInfo(group.id, { emoji: e })
    setShowEmojiPicker(false)
  }

  const handleAddTag = () => {
    const trimmed = newTag.trim()
    if (!trimmed || tags.some((t) => t.name === trimmed)) return
    const tagDef: TagDef = { name: trimmed, color: selectedColor }
    updateGroupSettings(group.id, { todoTags: [...tags, tagDef] })
    setNewTag('')
    setSelectedColor(TAG_COLORS[(tags.length + 1) % TAG_COLORS.length])
  }

  const handleRemoveTag = (tagName: string) => {
    updateGroupSettings(group.id, { todoTags: tags.filter((t) => t.name !== tagName) })
  }

  const handleUpdateTag = (oldName: string, newName: string, newColor: string) => {
    const trimmed = newName.trim()
    if (!trimmed) return
    if (trimmed !== oldName && tags.some((t) => t.name === trimmed)) return
    updateGroupSettings(group.id, {
      todoTags: tags.map((t) => (t.name === oldName ? { name: trimmed, color: newColor } : t)),
    })
    setEditingTag(null)
  }

  const startEditTag = (tag: TagDef) => {
    setEditingTag(tag.name)
    setEditTagName(tag.name)
    setEditTagColor(tag.color)
  }

  const handleRoleChange = (memberName: string, newRole: MemberRole) => {
    const existing = memberRoles.find((m) => m.name === memberName)
    updateMemberRole(group.id, memberName, {
      name: memberName,
      role: newRole,
      funRole: existing?.funRole,
    })
  }

  const handleDeleteGroup = () => {
    deleteGroup(group.id)
    navigate('/')
  }

  return (
    <div className="p-4">
      {/* Group info */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-[#161822] border border-white/[0.06] rounded-2xl p-4 mb-5">
        <h4 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Gruppe</h4>

        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-2xl active:scale-95 transition-transform shrink-0">
            {emoji}
          </button>
          <input value={name} onChange={(e) => setName(e.target.value)}
            onBlur={handleSaveName}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
            className="flex-1 px-3 py-2.5 bg-[#0e1015] border border-white/[0.08] rounded-xl text-white text-sm outline-none focus:border-indigo-500/50" />
        </div>

        {showEmojiPicker && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            className="overflow-hidden pt-3 border-t border-white/[0.06]">
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map((e) => (
                <button key={e} onClick={() => handleEmojiSelect(e)}
                  className={cn('text-2xl p-1.5 rounded-xl border transition-colors',
                    emoji === e ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/[0.06] bg-[#0e1015]'
                  )}>{e}</button>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Invite Code */}
      {isAdmin && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 }}
          className="bg-[#161822] border border-white/[0.06] rounded-2xl p-4 mb-5">
          <button onClick={() => {
            const code = group.inviteCode || generateInviteCode(group.id)
            const url = `${window.location.origin}/join/${code}`
            if (navigator.share) {
              navigator.share({ title: `${group.emoji} ${group.name}`, text: `Tritt unserer Gruppe "${group.name}" bei!`, url })
            } else {
              navigator.clipboard.writeText(url)
            }
          }}
            className="w-full py-3.5 bg-indigo-500 text-white rounded-xl font-bold text-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2">
            <Share2 size={16} />
            Mitglieder einladen
          </button>
        </motion.div>
      )}

      {/* Todo Tags */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="bg-[#161822] border border-white/[0.06] rounded-2xl p-4 mb-5">
        <h4 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Aufgaben-Tags</h4>
        <p className="text-[11px] text-zinc-600 mb-3">Tags können Aufgaben zugewiesen werden um sie zu kategorisieren.</p>

        {/* Existing tags */}
        <div className="flex gap-1.5 flex-wrap mb-3">
          {tags.map((tag) =>
            editingTag === tag.name ? (
              <div key={tag.name}
                className="flex flex-col gap-2 p-2.5 rounded-xl bg-[#0e1015] border border-white/[0.08] w-full">
                <input
                  value={editTagName}
                  onChange={(e) => setEditTagName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleUpdateTag(tag.name, editTagName, editTagColor)
                    if (e.key === 'Escape') setEditingTag(null)
                  }}
                  autoFocus
                  className="px-2.5 py-1.5 bg-[#161822] border border-white/[0.08] rounded-lg text-white text-[12px] outline-none focus:border-indigo-500/50"
                />
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-zinc-600 mr-1">Farbe:</span>
                  {TAG_COLORS.map((color) => (
                    <button key={color} onClick={() => setEditTagColor(color)}
                      className={cn('w-5 h-5 rounded-full transition-transform', editTagColor === color && 'ring-2 ring-white/30 scale-110')}
                      style={{ backgroundColor: color }} />
                  ))}
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => handleUpdateTag(tag.name, editTagName, editTagColor)}
                    disabled={!editTagName.trim()}
                    className="px-2.5 py-1 rounded-lg bg-indigo-500 text-white text-[11px] font-semibold active:scale-95 transition-transform disabled:opacity-30">
                    Speichern
                  </button>
                  <button onClick={() => setEditingTag(null)}
                    className="px-2.5 py-1 rounded-lg border border-white/[0.08] text-zinc-400 text-[11px] font-medium">
                    Abbrechen
                  </button>
                </div>
              </div>
            ) : (
              <div key={tag.name}
                className={cn('flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[12px] font-medium border group', isAdmin && 'cursor-pointer')}
                style={{ backgroundColor: `${tag.color}15`, color: tag.color, borderColor: `${tag.color}25` }}
                onClick={() => isAdmin && startEditTag(tag)}>
                {tag.name}
                {isAdmin && (
                  <>
                    <Pencil size={10} className="opacity-0 group-hover:opacity-50 transition-opacity ml-0.5" />
                    <button onClick={(e) => { e.stopPropagation(); handleRemoveTag(tag.name) }} className="opacity-50 active:text-red-400 ml-0.5">
                      <X size={12} />
                    </button>
                  </>
                )}
              </div>
            )
          )}
          {tags.length === 0 && (
            <p className="text-[12px] text-zinc-600">Noch keine Tags erstellt</p>
          )}
        </div>

        {/* Add tag */}
        {isAdmin && (
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <input value={newTag} onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                placeholder="Neuen Tag erstellen..."
                className="flex-1 px-3 py-2.5 bg-[#0e1015] border border-white/[0.08] rounded-xl text-white text-sm outline-none focus:border-indigo-500/50 placeholder:text-zinc-600" />
              <button onClick={handleAddTag} disabled={!newTag.trim()}
                className="px-3 rounded-xl text-white active:scale-95 transition-transform disabled:opacity-30"
                style={{ backgroundColor: selectedColor }}>
                <Plus size={16} />
              </button>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-zinc-600 mr-1">Farbe:</span>
              {TAG_COLORS.map((color) => (
                <button key={color} onClick={() => setSelectedColor(color)}
                  className={cn('w-6 h-6 rounded-full transition-transform', selectedColor === color && 'ring-2 ring-white/30 scale-110')}
                  style={{ backgroundColor: color }} />
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Member Roles */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-[#161822] border border-white/[0.06] rounded-2xl p-4 mb-5">
        <h4 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Mitglieder & Rollen</h4>

        <div className="flex flex-col gap-2">
          {memberRoles.map((member) => {
            const roleCfg = ROLE_CONFIG[member.role]
            const Icon = roleCfg.icon
            return (
              <div key={member.name}
                className="flex items-center gap-3 p-3 bg-[#0e1015] border border-white/[0.06] rounded-xl">
                <Avatar name={member.name} size={32} />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium">{getUserName(member.name)}</p>
                  {member.funRole && (
                    <p className="text-[10px] text-zinc-600">"{member.funRole}"</p>
                  )}
                </div>
                {isAdmin && member.name !== currentUserId && member.name !== currentUser ? (
                  <select
                    value={member.role}
                    onChange={(e) => handleRoleChange(member.name, e.target.value as MemberRole)}
                    className={cn('px-2 py-1.5 rounded-lg text-[11px] font-semibold border border-white/[0.06] bg-[#161822] outline-none', roleCfg.color)}
                  >
                    <option value="admin">{t('role.admin')}</option>
                    <option value="member">{t('role.member')}</option>
                    <option value="viewer">{t('role.viewer')}</option>
                  </select>
                ) : (
                  <div className={cn('flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-semibold', roleCfg.color)}>
                    <Icon size={12} />
                    {t(`role.${member.role}`)}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* My Preferences */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="bg-[#161822] border border-white/[0.06] rounded-2xl p-4 mb-5">
        <h4 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Meine Einstellungen</h4>
        <p className="text-[11px] text-zinc-600 mb-4">Gilt nur für dich in dieser Gruppe.</p>

        {/* Navbar tabs */}
        <div className="mb-4">
          <label className="text-[11px] font-semibold text-zinc-400 mb-2 block">Navigation (max. 4 Tabs)</label>
          <div className="flex flex-col gap-1.5">
            {ALL_TABS.map((tab) => {
              const selected = prefs.navTabs.includes(tab.key)
              return (
                <button key={tab.key}
                  onClick={() => {
                    let next: string[]
                    if (selected) {
                      next = prefs.navTabs.filter((k) => k !== tab.key)
                      if (next.length === 0) return
                    } else {
                      if (prefs.navTabs.length >= 4) return
                      next = [...prefs.navTabs, tab.key]
                    }
                    updateGroupPrefs(group.id, { navTabs: next })
                  }}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors',
                    selected ? 'bg-indigo-500/10 border border-indigo-500/20' : 'bg-[#0e1015] border border-white/[0.06]',
                    !selected && prefs.navTabs.length >= 4 && 'opacity-30'
                  )}>
                  <span className="text-base">{tab.emoji}</span>
                  <span className={cn('text-[13px] font-medium flex-1', selected ? 'text-indigo-300' : 'text-zinc-400')}>
                    {tab.label}
                  </span>
                  {selected && (
                    <div className="w-5 h-5 rounded-md bg-indigo-500 flex items-center justify-center">
                      <span className="text-white text-[10px] font-bold">{prefs.navTabs.indexOf(tab.key) + 1}</span>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Start tab */}
        <div>
          <label className="text-[11px] font-semibold text-zinc-400 mb-2 block">Start-Tab beim Öffnen</label>
          <div className="flex gap-1.5 flex-wrap">
            {ALL_TABS.map((tab) => (
              <button key={tab.key}
                onClick={() => updateGroupPrefs(group.id, { startTab: tab.path })}
                className={cn('px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors',
                  prefs.startTab === tab.path
                    ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/20'
                    : 'bg-[#0e1015] text-zinc-500 border border-white/[0.06]'
                )}>
                {tab.emoji} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Danger zone */}
      {isAdmin && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-[#161822] border border-white/[0.06] rounded-2xl p-4 mb-8">
          <h4 className="text-[11px] font-bold text-red-400/60 uppercase tracking-widest mb-3">Gefahrenzone</h4>
          <button onClick={() => setShowDeleteConfirm(true)}
            className="w-full flex items-center gap-3 p-3 bg-red-500/5 border border-red-500/10 rounded-xl text-left active:bg-red-500/10 transition-colors">
            <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center">
              <Trash2 size={14} className="text-red-400" />
            </div>
            <div>
              <p className="text-[13px] font-medium text-red-400">Gruppe löschen</p>
              <p className="text-[11px] text-zinc-600">Alle Daten dieser Gruppe werden gelöscht</p>
            </div>
          </button>
        </motion.div>
      )}

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-8" onClick={() => setShowDeleteConfirm(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-[#1a1d2a] border border-white/[0.08] rounded-2xl p-5 w-full max-w-[320px] text-center">
            <p className="text-lg font-bold">"{group.name}" löschen?</p>
            <p className="text-[13px] text-zinc-500 mt-2">Alle Aufgaben, Ausgaben, Nachrichten und Events werden unwiderruflich gelöscht.</p>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-[13px] font-medium text-zinc-400">
                Abbrechen
              </button>
              <button onClick={handleDeleteGroup}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-[13px] font-bold active:scale-95">
                Löschen
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, User, Bell, Moon, Globe, Trash2, LogOut, Shield, Info, EyeOff, Eye, HelpCircle, Zap, Heart, Share2, Gift, Copy } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAppStore } from '@/stores/appStore'
import { supabase } from '@/lib/supabase'
import { cleanup } from '@/lib/sync'
import { cn } from '@/lib/utils'
import { useT } from '@/lib/i18n'

const EMOJIS = ['😎', '🤙', '🔥', '✨', '🎯', '🧠', '💜', '🌊', '🎮', '🎵', '🏔️', '☕', '🦊', '🐻', '🌸', '🍀', '⭐', '🎨', '🚀', '🌈', '🦁', '🐱', '🎭', '🏄']
const STATUSES_DE = [
  'Auf der Suche nach Abenteuern',
  'Immer ready 🤙',
  'Netflix & Chill',
  'Arbeiten... 💻',
  'Im Urlaub 🏖️',
  'Nicht stören 🔕',
]
const STATUSES_EN = [
  'Looking for adventures',
  'Always ready 🤙',
  'Netflix & Chill',
  'Working... 💻',
  'On vacation 🏖️',
  'Do not disturb 🔕',
]

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!on)}
      className={cn(
        'relative w-11 h-6 rounded-full transition-colors shrink-0',
        on ? 'bg-indigo-500' : 'bg-zinc-700'
      )}>
      <div className={cn(
        'absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm',
        on ? 'translate-x-[22px]' : 'translate-x-0.5'
      )} />
    </button>
  )
}

function SettingsRow({ icon: Icon, label, sub, right, onClick, danger }: {
  icon: typeof User; label: string; sub?: string; right?: React.ReactNode; onClick?: () => void; danger?: boolean
}) {
  return (
    <button onClick={onClick} disabled={!onClick && !right}
      className={cn(
        'w-full flex items-center gap-3.5 px-4 py-3.5 text-left transition-colors',
        onClick && 'active:bg-white/[0.02]'
      )}>
      <div className={cn(
        'w-8 h-8 rounded-xl flex items-center justify-center shrink-0',
        danger ? 'bg-red-500/10' : 'bg-white/[0.04]'
      )}>
        <Icon size={16} className={danger ? 'text-red-400' : 'text-zinc-400'} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn('text-[13px] font-medium', danger && 'text-red-400')}>{label}</p>
        {sub && <p className="text-[11px] text-zinc-600 mt-0.5">{sub}</p>}
      </div>
      {right || (onClick && <ChevronRight size={16} className="text-zinc-700" />)}
    </button>
  )
}

export function ProfilePage() {
  const navigate = useNavigate()
  const t = useT()
  const { profile, updateProfile, groups, resetAppData, loadDemoData } = useAppStore()
  const [editName, setEditName] = useState(false)
  const [nameValue, setNameValue] = useState(profile.name)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showStatusPicker, setShowStatusPicker] = useState(false)
  const [showConfirmReset, setShowConfirmReset] = useState(false)
  const [showConfirmDemo, setShowConfirmDemo] = useState(false)
  const [showSupport, setShowSupport] = useState(false)
  const [supportTitle, setSupportTitle] = useState('')
  const [supportBody, setSupportBody] = useState('')
  const [supportSent, setSupportSent] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)

  const hiddenGroups = profile.hiddenGroups || []
  const statuses = profile.language === 'en' ? STATUSES_EN : STATUSES_DE

  const totalExpenses = groups.reduce((s, g) => s + g.expenses.length, 0)
  const totalMessages = groups.reduce((s, g) => s + g.messages.length, 0)

  const saveName = () => {
    if (nameValue.trim()) {
      updateProfile({ name: nameValue.trim() })
    }
    setEditName(false)
  }

  const toggleHideGroup = (groupId: string) => {
    const next = hiddenGroups.includes(groupId)
      ? hiddenGroups.filter((id) => id !== groupId)
      : [...hiddenGroups, groupId]
    updateProfile({ hiddenGroups: next })
  }

  return (
    <div className="h-full flex flex-col bg-[#0a0c12]">
      {/* Header */}
      <header className="shrink-0 z-20 border-b border-white/[0.06] bg-[#0e1015]">
        <div className="safe-top" />
        <div className="flex items-center gap-3 px-4 h-[44px] sm:h-[52px]">
          <button onClick={() => navigate(-1)} className="text-zinc-400 active:text-white -ml-1 p-1">
            <ChevronLeft size={22} />
          </button>
          <h1 className="text-[16px] font-bold flex-1">{t('profile.title')}</h1>
        </div>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto">
      {/* Profile card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="mx-4 mt-5 bg-[#161822] border border-white/[0.06] rounded-2xl p-5">
        <div className="flex items-center gap-4">
          <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="relative group">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-3xl">
              {profile.emoji}
            </div>
            <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-active:opacity-100 transition-opacity">
              <span className="text-[10px] text-white font-semibold">{t('profile.change')}</span>
            </div>
          </button>
          <div className="flex-1">
            {editName ? (
              <div className="flex gap-2">
                <input value={nameValue} onChange={(e) => setNameValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && saveName()}
                  autoFocus
                  className="flex-1 px-3 py-1.5 bg-[#0e1015] border border-white/[0.08] rounded-lg text-white text-sm outline-none" />
                <button onClick={saveName} className="px-3 py-1.5 bg-indigo-500 text-white text-[11px] font-semibold rounded-lg">OK</button>
              </div>
            ) : (
              <button onClick={() => { setNameValue(profile.name); setEditName(true) }}
                className="text-left active:opacity-70">
                <h2 className="text-lg font-bold">{profile.name}</h2>
              </button>
            )}
            <button onClick={() => setShowStatusPicker(!showStatusPicker)}
              className="block text-[12px] text-zinc-500 mt-1.5 active:text-zinc-300">
              {profile.status || t('profile.set_status')}
            </button>
            <label className="flex items-center gap-1.5 mt-1.5 cursor-pointer active:opacity-70">
              <span className="text-[11px]">🎂</span>
              {profile.birthday ? (() => {
                const parts = profile.birthday.split('.')
                const dd = parts[0], mm = parts[1], yyyy = parts[2]
                const months = profile.language === 'de'
                  ? ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez']
                  : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                return <span className="text-[11px] text-indigo-400">{parseInt(dd)}. {months[parseInt(mm) - 1]} {yyyy}</span>
              })() : (
                <span className="text-[11px] text-zinc-600">{t('profile.birthday_set')}</span>
              )}
              <input
                type="date"
                value={(() => {
                  const parts = (profile.birthday || '').split('.')
                  return parts.length === 3 ? `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}` : ''
                })()}
                onChange={(e) => {
                  if (e.target.value) {
                    const [y, m, d] = e.target.value.split('-')
                    updateProfile({ birthday: `${d}.${m}.${y}` })
                  } else {
                    updateProfile({ birthday: undefined })
                  }
                }}
                className="sr-only"
              />
            </label>
          </div>
        </div>

        {/* Emoji picker */}
        {showEmojiPicker && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            className="overflow-hidden mt-4 pt-3 border-t border-white/[0.06]">
            <p className="text-[11px] text-zinc-500 mb-2">{t('profile.choose_avatar')}</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {EMOJIS.map((e) => (
                <button key={e} onClick={() => { updateProfile({ emoji: e }); setShowEmojiPicker(false) }}
                  className={cn('text-2xl p-1.5 rounded-xl border transition-colors',
                    profile.emoji === e ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/[0.06] bg-[#0e1015]'
                  )}>{e}</button>
              ))}
            </div>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="🔍"
                maxLength={4}
                className="w-12 h-12 text-center text-2xl bg-[#0e1015] border border-white/[0.08] rounded-xl outline-none focus:border-indigo-500/50"
                onInput={(e) => {
                  const val = (e.target as HTMLInputElement).value
                  if (val && /\p{Emoji}/u.test(val)) {
                    updateProfile({ emoji: val })
                    setShowEmojiPicker(false)
                  }
                }}
              />
              <span className="text-[11px] text-zinc-600">
                {t('emoji_custom')}
              </span>
            </div>
          </motion.div>
        )}

        {/* Status picker */}
        {showStatusPicker && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            className="overflow-hidden mt-4 pt-3 border-t border-white/[0.06]">
            <p className="text-[11px] text-zinc-500 mb-2">{t('profile.status')}</p>
            <div className="flex flex-col gap-1">
              {statuses.map((s) => (
                <button key={s} onClick={() => { updateProfile({ status: s }); setShowStatusPicker(false) }}
                  className={cn('px-3 py-2 rounded-lg text-[12px] text-left transition-colors',
                    profile.status === s ? 'bg-indigo-500/10 text-indigo-300' : 'text-zinc-400 active:bg-white/[0.03]'
                  )}>{s}</button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-white/[0.06]">
          <div className="text-center">
            <p className="text-lg font-extrabold">{groups.length}</p>
            <p className="text-[10px] text-zinc-500">{t('profile.groups_count')}</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-extrabold">{totalExpenses}</p>
            <p className="text-[10px] text-zinc-500">{t('profile.expenses_count')}</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-extrabold">{totalMessages}</p>
            <p className="text-[10px] text-zinc-500">{t('profile.messages_count')}</p>
          </div>
        </div>
      </motion.div>

      {/* My groups */}
      <div className="mx-4 mt-5">
        <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2 px-1">{t('profile.my_groups')}</h3>
        <div className="bg-[#161822] border border-white/[0.06] rounded-2xl overflow-hidden">
          {groups.map((g, i) => {
            const isHidden = hiddenGroups.includes(g.id)
            return (
              <div key={g.id}
                className={cn(
                  'flex items-center gap-3 px-4 py-3',
                  i > 0 && 'border-t border-white/[0.04]',
                  isHidden && 'opacity-40'
                )}>
                <button onClick={() => navigate(`/group/${g.id}`)}
                  className="flex items-center gap-3 flex-1 min-w-0 text-left active:opacity-70">
                  <span className="text-xl">{g.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium truncate">{g.name}</p>
                    <p className="text-[11px] text-zinc-600">
                      {g.members.length} {t('home.members')}
                      {isHidden && <span className="ml-1.5 text-zinc-500">· {t('profile.hidden')}</span>}
                    </p>
                  </div>
                </button>
                <button onClick={() => toggleHideGroup(g.id)}
                  className={cn('p-2 rounded-lg transition-colors',
                    isHidden ? 'text-zinc-600 active:text-zinc-400' : 'text-zinc-500 active:text-zinc-300'
                  )}>
                  {isHidden ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Pending invites */}
      {(profile.pendingInvites || []).length > 0 && (
        <div className="mx-4 mt-5">
          <h3 className="text-[11px] font-bold text-amber-400/70 uppercase tracking-widest mb-2 px-1">
            {t('profile.pending_invites')}
          </h3>
          <div className="bg-[#161822] border border-white/[0.06] rounded-2xl overflow-hidden">
            {(profile.pendingInvites || []).map((inv, i) => (
              <div key={inv.groupId}
                className={cn('flex items-center gap-3 px-4 py-3', i > 0 && 'border-t border-white/[0.04]')}>
                <span className="text-xl">{inv.groupEmoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium truncate">{inv.groupName}</p>
                  <p className="text-[11px] text-zinc-600">{inv.members.length} {t('home.members')}</p>
                </div>
                <button onClick={() => { navigate(`/join/${groups.find(g => g.id === inv.groupId)?.inviteCode || inv.groupId}`) }}
                  className="px-3 py-1.5 bg-indigo-500 text-white text-[11px] font-bold rounded-lg active:scale-95">
                  {t('join')}
                </button>
                <button onClick={() => {
                  updateProfile({ pendingInvites: (profile.pendingInvites || []).filter(p => p.groupId !== inv.groupId) })
                }}
                  className="text-zinc-600 active:text-red-400 p-1">
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pro status */}
      {profile.plan === 'pro' ? (
        <div className="mx-4 mt-5 bg-gradient-to-r from-emerald-600/20 to-indigo-600/20 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <Zap size={20} className="text-emerald-400" />
          </div>
          <div className="flex-1">
            <p className="text-[14px] font-bold text-emerald-300">Friends Pro ✓</p>
            <p className="text-[11px] text-zinc-500">
              {profile.planExpiresAt
                ? `${t('profile.pro_cancelled')} ${new Date(profile.planExpiresAt).toLocaleDateString(profile.language === 'de' ? 'de-AT' : 'en-US')}`
                : t('profile.pro_active')}
            </p>
          </div>
          <button onClick={() => window.open('https://app.lemonsqueezy.com/my-orders', '_blank')}
            className="text-[11px] text-zinc-500 active:text-zinc-300 px-3 py-2">
            {t('manage')}
          </button>
        </div>
      ) : (
        <button onClick={() => navigate('/pro')}
          className="mx-4 mt-5 bg-gradient-to-r from-indigo-600/20 to-violet-600/20 border border-indigo-500/20 rounded-2xl p-4 flex items-center gap-3 w-[calc(100%-32px)] text-left active:scale-[0.98] transition-transform">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
            <Zap size={20} className="text-indigo-400" />
          </div>
          <div className="flex-1">
            <p className="text-[14px] font-bold text-indigo-300">Friends Pro</p>
            <p className="text-[11px] text-zinc-500">
              {t('profile.try_free')}
            </p>
          </div>
          <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full shrink-0">
            {t('profile.start_trial')}
          </span>
          <ChevronRight size={16} className="text-indigo-400/50" />
        </button>
      )}

      {/* Settings sections */}
      <div className="mx-4 mt-6">
        <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2 px-1">{t('settings.title')}</h3>
        <div className="bg-[#161822] border border-white/[0.06] rounded-2xl overflow-hidden divide-y divide-white/[0.04]">
          <SettingsRow icon={Bell} label={t('settings.notifications')} sub={t('settings.notifications_sub')}
            right={<Toggle on={profile.notificationsEnabled} onChange={(v) => updateProfile({ notificationsEnabled: v })} />} />
          <SettingsRow icon={Moon} label={t('settings.dark_mode')}
            right={<Toggle on={profile.darkMode} onChange={(v) => updateProfile({ darkMode: v })} />} />
          <SettingsRow icon={Globe} label={t('settings.language')} sub={profile.language === 'de' ? 'Deutsch' : 'English'}
            onClick={() => updateProfile({ language: profile.language === 'de' ? 'en' : 'de' })} />
        </div>
      </div>

      {/* Referral */}
      {profile.referralCode && (
        <div className="mx-4 mt-6">
          <div className="bg-gradient-to-br from-indigo-600/15 to-violet-600/10 border border-indigo-500/20 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Gift size={16} className="text-indigo-400" />
              <h3 className="text-[13px] font-bold text-indigo-300">{t('referral.title')}</h3>
            </div>
            <p className="text-[12px] text-zinc-400 mb-3">{t('referral.description')}</p>
            <div className="flex gap-2">
              <button onClick={() => {
                const url = `${window.location.origin}/ref/${profile.referralCode}`
                if (navigator.share) {
                  navigator.share({ title: 'Friends App', text: t('referral.description'), url })
                } else {
                  navigator.clipboard.writeText(url)
                  const btn = document.getElementById('ref-copy-btn')
                  if (btn) { btn.dataset.copied = 'true'; setTimeout(() => { btn.dataset.copied = '' }, 2000) }
                }
              }}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-500 text-white rounded-xl font-bold text-[13px] active:scale-95 transition-all">
                <Share2 size={14} /> {t('referral.share')}
              </button>
              <button id="ref-copy-btn" onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/ref/${profile.referralCode}`)
                const btn = document.getElementById('ref-copy-btn')
                if (btn) { btn.textContent = '✓'; setTimeout(() => { btn.textContent = '' }, 2000) }
              }}
                className="w-12 flex items-center justify-center bg-[#161822] border border-white/[0.08] rounded-xl text-zinc-400 active:text-indigo-400">
                <Copy size={16} />
              </button>
            </div>
            <p className="text-[10px] text-zinc-600 mt-2 text-center font-mono">
              {window.location.origin}/ref/{profile.referralCode}
            </p>
          </div>
        </div>
      )}

      {/* Other */}
      <div className="mx-4 mt-6 mb-10">
        <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2 px-1">{t('settings.other')}</h3>
        <div className="bg-[#161822] border border-white/[0.06] rounded-2xl overflow-hidden divide-y divide-white/[0.04]">
          <SettingsRow icon={HelpCircle}
            label={t('profile.support')}
            sub={t('profile.support_sub')}
            onClick={() => { setShowSupport(true); setSupportSent(false); setSupportTitle(''); setSupportBody('') }} />
          <SettingsRow icon={Shield} label={t('settings.privacy')} sub={t('settings.privacy_sub')}
            onClick={() => setShowPrivacy(true)} />
          <SettingsRow icon={Heart}
            label={t('profile.donate')}
            sub={t('profile.donate_sub')}
            onClick={() => window.open('https://ko-fi.com/nicogrim', '_blank')} />
          <SettingsRow icon={Info} label={t('settings.about')} sub="Version 1.0.0 — Made with ❤️" />
          <SettingsRow icon={Trash2} label={t('settings.delete_all')} sub={t('settings.delete_all_sub')} danger
            onClick={() => setShowConfirmReset(true)} />
          <SettingsRow icon={LogOut}
            label={t('profile.logout')}
            sub={t('profile.logout_sub')} danger
            onClick={() => { cleanup(); supabase.auth.signOut(); navigate('/') }} />
        </div>
      </div>

      </div>

      {/* Reset confirmation */}
      {showConfirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-8" onClick={() => setShowConfirmReset(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-[#1a1d2a] border border-white/[0.08] rounded-2xl p-5 w-full max-w-[320px] text-center">
            <p className="text-lg font-bold">{t('settings.reset_confirm')}</p>
            <p className="text-[13px] text-zinc-500 mt-2">{t('settings.reset_confirm_sub')}</p>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowConfirmReset(false)}
                className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-[13px] font-medium text-zinc-400">
                {t('cancel')}
              </button>
              <button onClick={async () => {
                resetAppData()
                // Restore name from auth session
                const { data } = await supabase.auth.getUser()
                if (data.user) {
                  const name = data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User'
                  updateProfile({ name })
                  useAppStore.getState().setUser(name)
                }
                setShowConfirmReset(false)
                navigate('/')
              }}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-[13px] font-bold active:scale-95">
                {t('settings.reset_btn')}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Demo confirmation */}
      {showConfirmDemo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-8" onClick={() => setShowConfirmDemo(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-[#1a1d2a] border border-white/[0.08] rounded-2xl p-5 w-full max-w-[320px] text-center">
            <p className="text-lg font-bold">{t('settings.load_demo')}</p>
            <p className="text-[13px] text-zinc-500 mt-2">
              {t('profile.demo_confirm')}
            </p>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowConfirmDemo(false)}
                className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-[13px] font-medium text-zinc-400">
                {t('cancel')}
              </button>
              <button onClick={() => { loadDemoData(); setShowConfirmDemo(false) }}
                className="flex-1 py-2.5 rounded-xl bg-indigo-500 text-white text-[13px] font-bold active:scale-95">
                {t('loading')}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Support / Feedback popup */}
      {showSupport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6" onClick={() => setShowSupport(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-[#1a1d2a] border border-white/[0.08] rounded-2xl p-5 w-full max-w-[340px]">

            {supportSent ? (
              <div className="text-center py-4">
                <span className="text-4xl">✅</span>
                <p className="text-[15px] font-bold mt-3">
                  {t('profile.feedback_thanks')}
                </p>
                <p className="text-[13px] text-zinc-500 mt-1">
                  {t('profile.feedback_follow')}
                </p>
                <button onClick={() => setShowSupport(false)}
                  className="mt-5 w-full py-2.5 rounded-xl bg-indigo-500 text-white text-[13px] font-bold active:scale-95">
                  OK
                </button>
              </div>
            ) : (
              <>
                <p className="text-[16px] font-bold mb-4">
                  {t('profile.support')}
                </p>

                <input
                  value={supportTitle}
                  onChange={(e) => setSupportTitle(e.target.value)}
                  placeholder={t('subject')}
                  className="w-full px-3.5 py-3 bg-[#0e1015] border border-white/[0.08] rounded-xl text-white text-sm outline-none focus:border-indigo-500/50 placeholder:text-zinc-600 mb-3"
                />

                <textarea
                  value={supportBody}
                  onChange={(e) => setSupportBody(e.target.value)}
                  placeholder={t('profile.describe')}
                  rows={4}
                  className="w-full px-3.5 py-3 bg-[#0e1015] border border-white/[0.08] rounded-xl text-white text-sm outline-none focus:border-indigo-500/50 placeholder:text-zinc-600 resize-none mb-4"
                />

                <div className="flex gap-2">
                  <button onClick={() => setShowSupport(false)}
                    className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-[13px] font-medium text-zinc-400">
                    {t('cancel')}
                  </button>
                  <button
                    disabled={!supportTitle.trim() || !supportBody.trim()}
                    onClick={async () => {
                      await supabase.from('feedback').insert({
                        title: supportTitle.trim(),
                        body: supportBody.trim(),
                        user_id: (await supabase.auth.getUser()).data.user?.id,
                      })
                      setSupportSent(true)
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-indigo-500 text-white text-[13px] font-bold active:scale-95 disabled:opacity-30">
                    {t('send')}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}

      {/* Privacy popup */}
      {showPrivacy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6" onClick={() => setShowPrivacy(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-[#1a1d2a] border border-white/[0.08] rounded-2xl p-5 w-full max-w-[340px]">
            <div className="text-center mb-4">
              <span className="text-3xl">🔒</span>
              <p className="text-[16px] font-bold mt-2">{t('settings.privacy')}</p>
            </div>
            <div className="space-y-3 text-[13px] text-zinc-400 leading-relaxed">
              <p>
                {profile.language === 'de'
                  ? '• Deine Daten werden verschlüsselt auf Servern in der EU (Frankfurt) gespeichert.'
                  : '• Your data is stored encrypted on EU servers (Frankfurt).'}
              </p>
              <p>
                {profile.language === 'de'
                  ? '• Wir nutzen Supabase als Datenbank-Provider mit Row Level Security — nur du und deine Gruppenmitglieder haben Zugriff auf eure Daten.'
                  : '• We use Supabase as database provider with Row Level Security — only you and your group members can access your data.'}
              </p>
              <p>
                {profile.language === 'de'
                  ? '• Dein Passwort wird niemals im Klartext gespeichert.'
                  : '• Your password is never stored in plain text.'}
              </p>
              <p>
                {profile.language === 'de'
                  ? '• Du kannst jederzeit alle deine Daten löschen (Einstellungen → Alle Daten löschen).'
                  : '• You can delete all your data at any time (Settings → Delete all data).'}
              </p>
              <p>
                {profile.language === 'de'
                  ? '• Wir verkaufen keine Daten an Dritte.'
                  : '• We do not sell data to third parties.'}
              </p>
            </div>
            <button onClick={() => setShowPrivacy(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-indigo-500 text-white text-[13px] font-bold active:scale-95">
              OK
            </button>
          </motion.div>
        </div>
      )}
    </div>
  )
}

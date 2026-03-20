import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, User, Bell, Moon, Globe, Trash2, LogOut, Shield, Info, EyeOff, Eye, HelpCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAppStore } from '@/stores/appStore'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { useT } from '@/lib/i18n'

const EMOJIS = ['😎', '🤙', '🔥', '✨', '🎯', '🧠', '💜', '🌊', '🎮', '🎵', '🏔️', '☕']
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
        <div className="flex items-center gap-3 px-4" style={{ height: 44 }}>
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
          </div>
        </div>

        {/* Emoji picker */}
        {showEmojiPicker && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            className="overflow-hidden mt-4 pt-3 border-t border-white/[0.06]">
            <p className="text-[11px] text-zinc-500 mb-2">{t('profile.choose_avatar')}</p>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map((e) => (
                <button key={e} onClick={() => { updateProfile({ emoji: e }); setShowEmojiPicker(false) }}
                  className={cn('text-2xl p-1.5 rounded-xl border transition-colors',
                    profile.emoji === e ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/[0.06] bg-[#0e1015]'
                  )}>{e}</button>
              ))}
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

      {/* Other */}
      <div className="mx-4 mt-6 mb-10">
        <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2 px-1">{t('settings.other')}</h3>
        <div className="bg-[#161822] border border-white/[0.06] rounded-2xl overflow-hidden divide-y divide-white/[0.04]">
          <SettingsRow icon={HelpCircle}
            label={profile.language === 'de' ? 'Support & Feedback' : 'Support & Feedback'}
            sub={profile.language === 'de' ? 'Hilfe, Feedback oder Probleme melden' : 'Help, feedback or report issues'}
            onClick={() => { setShowSupport(true); setSupportSent(false); setSupportTitle(''); setSupportBody('') }} />
          <SettingsRow icon={Shield} label={t('settings.privacy')} sub={t('settings.privacy_sub')} />
          <SettingsRow icon={Info} label={t('settings.about')} sub="Version 1.0.0 — Made with ❤️" />
          <SettingsRow icon={LogOut} label={t('settings.load_demo')} sub={t('settings.load_demo_sub')}
            onClick={() => setShowConfirmDemo(true)} />
          <SettingsRow icon={Trash2} label={t('settings.delete_all')} sub={t('settings.delete_all_sub')} danger
            onClick={() => setShowConfirmReset(true)} />
          <SettingsRow icon={LogOut}
            label={profile.language === 'de' ? 'Ausloggen' : 'Log out'}
            sub={profile.language === 'de' ? 'Von diesem Gerät abmelden' : 'Sign out from this device'} danger
            onClick={() => { supabase.auth.signOut(); navigate('/') }} />
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
              <button onClick={() => { resetAppData(); setShowConfirmReset(false); navigate('/') }}
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
              {profile.language === 'de'
                ? 'Demo-Gruppen werden hinzugefügt. Deine bestehenden Gruppen bleiben erhalten.'
                : 'Demo groups will be added. Your existing groups will be kept.'}
            </p>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowConfirmDemo(false)}
                className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-[13px] font-medium text-zinc-400">
                {t('cancel')}
              </button>
              <button onClick={() => { loadDemoData(); setShowConfirmDemo(false) }}
                className="flex-1 py-2.5 rounded-xl bg-indigo-500 text-white text-[13px] font-bold active:scale-95">
                {profile.language === 'de' ? 'Laden' : 'Load'}
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
                  {profile.language === 'de' ? 'Danke für dein Feedback!' : 'Thanks for your feedback!'}
                </p>
                <p className="text-[13px] text-zinc-500 mt-1">
                  {profile.language === 'de' ? 'Wir melden uns so schnell wie möglich.' : 'We\'ll get back to you as soon as possible.'}
                </p>
                <button onClick={() => setShowSupport(false)}
                  className="mt-5 w-full py-2.5 rounded-xl bg-indigo-500 text-white text-[13px] font-bold active:scale-95">
                  OK
                </button>
              </div>
            ) : (
              <>
                <p className="text-[16px] font-bold mb-4">
                  {profile.language === 'de' ? 'Support & Feedback' : 'Support & Feedback'}
                </p>

                <input
                  value={supportTitle}
                  onChange={(e) => setSupportTitle(e.target.value)}
                  placeholder={profile.language === 'de' ? 'Betreff' : 'Subject'}
                  className="w-full px-3.5 py-3 bg-[#0e1015] border border-white/[0.08] rounded-xl text-white text-sm outline-none focus:border-indigo-500/50 placeholder:text-zinc-600 mb-3"
                />

                <textarea
                  value={supportBody}
                  onChange={(e) => setSupportBody(e.target.value)}
                  placeholder={profile.language === 'de' ? 'Beschreibe dein Anliegen...' : 'Describe your issue...'}
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
                    {profile.language === 'de' ? 'Senden' : 'Send'}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </div>
  )
}

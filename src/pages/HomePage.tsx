import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Bell, Search } from 'lucide-react'
import { useAppStore } from '@/stores/appStore'
import { Avatar } from '@/components/ui/Avatar'
import { NewGroupSheet } from '@/components/groups/NewGroupSheet'
import { DemoBanner, DemoPrompt } from '@/components/ui/DemoBanner'
import { ProPrompt } from '@/components/ui/ProGate'
import { canCreateGroup } from '@/lib/plans'
import { useT } from '@/lib/i18n'

export function HomePage() {
  const { currentUser, groups, notifications, profile, demoMode, setDemoMode } = useAppStore()
  const navigate = useNavigate()
  const t = useT()
  const [showNew, setShowNew] = useState(false)
  const [showDemoPrompt, setShowDemoPrompt] = useState(false)
  const [showProPrompt, setShowProPrompt] = useState(false)
  const unreadCount = notifications.filter((n) => !n.read).length

  const hiddenGroups = profile.hiddenGroups || []
  const visibleGroups = groups.filter((g) => !hiddenGroups.includes(g.id))

  return (
    <div className="h-full flex flex-col bg-[#0a0c12]">
      {/* Header */}
      <div className="shrink-0 pt-safe">
      <div className="px-5 pt-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/profile')}
              className="w-11 h-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-xl active:scale-95 transition-transform shrink-0">
              {profile.emoji}
            </button>
            <div>
              <h1 className="text-[22px] font-extrabold tracking-tight">
                {t('home.greeting')} {currentUser} <span className="inline-block animate-wave origin-bottom-right">👋</span>
              </h1>
              {profile.status && <p className="text-[11px] text-zinc-600 mt-0.5">{profile.status}</p>}
            </div>
          </div>
          <div className="flex items-center gap-1">
          <button onClick={() => navigate('/search')} className="p-2 text-zinc-400 active:text-white">
            <Search size={20} />
          </button>
          <button onClick={() => navigate('/notifications')} className="relative p-2 text-zinc-400 active:text-white">
            <Bell size={22} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center"
                style={{ minWidth: 18, height: 18 }}>
                {unreadCount}
              </span>
            )}
          </button>
          </div>
        </div>
        <p className="text-zinc-500 text-sm mt-5 mb-3">{t('home.your_groups')}</p>
      </div>
      </div>
      <DemoBanner />

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-8">

      {visibleGroups.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <span className="text-5xl mb-4">👥</span>
          <p className="text-zinc-400 text-[15px] font-medium">{t('home.no_groups')}</p>
          <p className="text-zinc-600 text-[13px] mt-1 max-w-[220px]">{t('home.no_groups_sub')}</p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {visibleGroups.map((g) => {
          const openTodos = g.todos.filter((t) => !t.done).length
          const nextEvent = (g.events || [])
            .filter((e) => new Date(e.date) >= new Date(new Date().toDateString()))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]

          return (
            <button
              key={g.id}
              onClick={() => navigate(`/group/${g.id}`)}
              className="flex items-center gap-3.5 bg-[#161822] border border-white/[0.06] rounded-2xl p-4 w-full text-left active:scale-[0.98] transition-transform"
            >
              <span className="text-3xl">{g.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-[15px] truncate">{g.name}</div>
                <div className="text-[11px] text-zinc-500 mt-0.5">
                  {g.members.length} {t('home.members')}
                  {openTodos > 0 && <> · {openTodos} {t('home.open_tasks')}</>}
                </div>
                {nextEvent && (
                  <div className="text-[10px] text-indigo-400/70 mt-1">
                    {nextEvent.emoji} {nextEvent.title} — {nextEvent.date}
                  </div>
                )}
              </div>
              <div className="flex -space-x-2">
                {g.members.slice(0, 3).map((m) => (
                  <Avatar key={m} name={m} size={26} />
                ))}
                {g.members.length > 3 && (
                  <div className="w-[26px] h-[26px] rounded-full bg-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-300">
                    +{g.members.length - 3}
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={() => {
              if (demoMode) { setShowDemoPrompt(true); return }
              if (!canCreateGroup()) { setShowProPrompt(true); return }
              setShowNew(true)
            }}
            className="flex-1 py-3.5 border-2 border-dashed border-white/[0.08] rounded-2xl text-indigo-400 font-semibold text-sm flex items-center justify-center gap-2 active:bg-white/[0.02] transition-colors"
          >
            <Plus size={16} /> {t('home.new_group')}
            {!canCreateGroup() && <span className="text-[9px] text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded-full">⚡Pro</span>}
          </button>
        </div>
      </div>

      {showNew && <NewGroupSheet onClose={() => setShowNew(false)} />}

      {showProPrompt && (
        <ProPrompt
          feature={profile.language === 'de' ? 'Mehr als 2 Gruppen' : 'More than 2 groups'}
          onClose={() => setShowProPrompt(false)}
        />
      )}

      {showDemoPrompt && (
        <DemoPrompt
          onClose={() => setShowDemoPrompt(false)}
          onSignup={() => { setDemoMode(false); setShowDemoPrompt(false) }}
        />
      )}
    </div>
  )
}

import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bell, Vote, Coins, Calendar, CheckSquare, Award, ChevronLeft, CheckCheck } from 'lucide-react'
import { useAppStore } from '@/stores/appStore'
import { timeAgo, cn } from '@/lib/utils'
import type { Notification } from '@/types'

const NOTIF_CONFIG: Record<string, { icon: typeof Bell; color: string; bg: string }> = {
  vote_open: { icon: Vote, color: 'text-violet-400', bg: 'bg-violet-500/10' },
  debt: { icon: Coins, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  event_reminder: { icon: Calendar, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  expense: { icon: Coins, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  todo: { icon: CheckSquare, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  role: { icon: Award, color: 'text-pink-400', bg: 'bg-pink-500/10' },
}

export function NotificationsPage() {
  const navigate = useNavigate()
  const { notifications, markNotificationRead, clearNotifications, groups } = useAppStore()
  const unreadCount = notifications.filter((n) => !n.read).length

  const handleClick = (n: Notification) => {
    markNotificationRead(n.id)
    navigate(`/group/${n.groupId}`)
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
        <div className="flex-1">
          <h1 className="text-[16px] font-bold">Benachrichtigungen</h1>
          {unreadCount > 0 && (
            <p className="text-[11px] text-indigo-400">{unreadCount} ungelesen</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={clearNotifications}
            className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-medium active:text-zinc-300 px-2.5 py-1.5 rounded-lg bg-white/[0.03]">
            <CheckCheck size={13} /> Alle lesen
          </button>
        )}
        </div>
      </header>

      {/* Notifications list */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-2">
        {notifications.length === 0 && (
          <div className="text-center py-16">
            <Bell size={32} className="text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-600 text-sm">Keine Benachrichtigungen</p>
          </div>
        )}
        {notifications.map((n, i) => {
          const config = NOTIF_CONFIG[n.type] || NOTIF_CONFIG.todo
          const Icon = config.icon
          const group = groups.find((g) => g.id === n.groupId)

          return (
            <motion.button
              key={n.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => handleClick(n)}
              className={cn(
                'w-full flex gap-3 p-3.5 rounded-2xl text-left transition-colors',
                n.read
                  ? 'bg-[#12141c] border border-white/[0.03] opacity-60'
                  : 'bg-[#161822] border border-white/[0.08]'
              )}
            >
              <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', config.bg)}>
                <Icon size={17} className={config.color} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-[13px] font-semibold truncate">{n.title}</p>
                  {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />}
                </div>
                <p className="text-[12px] text-zinc-500 mt-0.5 line-clamp-2">{n.body}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  {group && (
                    <span className="text-[10px] text-zinc-600 bg-white/[0.03] px-1.5 py-0.5 rounded">
                      {group.emoji} {group.name}
                    </span>
                  )}
                  <span className="text-[10px] text-zinc-700">{timeAgo(n.timestamp)}</span>
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

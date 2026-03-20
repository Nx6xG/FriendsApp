import { useOutletContext } from 'react-router-dom'
import { motion } from 'framer-motion'
import { TrendingUp, Crown, Users, Award, Star } from 'lucide-react'
import { currency, cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/Avatar'
import { getUserName } from '@/lib/users'
import type { Group } from '@/types'

export function StatsPage() {
  const { group } = useOutletContext<{ group: Group }>()

  // Spending stats
  const totalSpent = group.expenses.reduce((s, e) => s + e.amount, 0)
  const spentByPerson: Record<string, number> = {}
  group.members.forEach((m) => (spentByPerson[m] = 0))
  group.expenses.forEach((e) => {
    spentByPerson[e.paidById] = (spentByPerson[e.paidById] || 0) + e.amount
  })
  const topSpender = Object.entries(spentByPerson).sort((a, b) => b[1] - a[1])
  const maxSpent = topSpender[0]?.[1] || 1

  // Task stats
  const tasksByPerson: Record<string, { done: number; total: number }> = {}
  group.members.forEach((m) => (tasksByPerson[m] = { done: 0, total: 0 }))
  group.todos.forEach((t) => {
    const ids = t.assigneeIds || []
    ids.forEach((id) => {
      if (tasksByPerson[id]) {
        tasksByPerson[id].total++
        if (t.done) tasksByPerson[id].done++
      }
    })
  })

  // Voting stats
  const votesByPerson: Record<string, number> = {}
  group.members.forEach((m) => (votesByPerson[m] = 0))
  group.suggestions.forEach((s) => {
    s.votes.forEach((v) => {
      votesByPerson[v] = (votesByPerson[v] || 0) + 1
    })
  })

  // Place stats
  const places = group.places || []
  const avgRatingByPerson: Record<string, { total: number; count: number }> = {}
  places.forEach((p) => {
    p.ratings.forEach((r) => {
      if (!avgRatingByPerson[r.userId]) avgRatingByPerson[r.userId] = { total: 0, count: 0 }
      avgRatingByPerson[r.userId].total += r.score
      avgRatingByPerson[r.userId].count++
    })
  })

  // Fun roles
  const roles = group.memberRoles || []

  // Messages per person
  const msgsByPerson: Record<string, number> = {}
  group.members.forEach((m) => (msgsByPerson[m] = 0))
  group.messages.forEach((msg) => {
    msgsByPerson[msg.authorId] = (msgsByPerson[msg.authorId] || 0) + 1
  })
  const topChatter = Object.entries(msgsByPerson).sort((a, b) => b[1] - a[1])

  return (
    <div className="p-4 space-y-5">
      {/* Total overview */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-indigo-600/15 to-violet-600/10 border border-indigo-500/15 rounded-2xl p-4"
      >
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={16} className="text-indigo-400" />
          <span className="text-[11px] font-bold text-indigo-300/70 uppercase tracking-widest">Übersicht</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-2xl font-extrabold">{currency(totalSpent)}</p>
            <p className="text-[11px] text-zinc-500">Gesamtausgaben</p>
          </div>
          <div>
            <p className="text-2xl font-extrabold">{group.expenses.length}</p>
            <p className="text-[11px] text-zinc-500">Ausgaben</p>
          </div>
          <div>
            <p className="text-2xl font-extrabold">{group.todos.filter((t) => t.done).length}/{group.todos.length}</p>
            <p className="text-[11px] text-zinc-500">Aufgaben erledigt</p>
          </div>
          <div>
            <p className="text-2xl font-extrabold">{(group.events || []).length}</p>
            <p className="text-[11px] text-zinc-500">Events</p>
          </div>
        </div>
      </motion.div>

      {/* Top spender ranking */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <div className="flex items-center gap-2 mb-3">
          <Crown size={14} className="text-amber-400" />
          <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Wer zahlt am meisten</span>
        </div>
        <div className="space-y-2">
          {topSpender.map(([name, amount], i) => (
            <div key={name} className="flex items-center gap-3 bg-[#161822] border border-white/[0.06] rounded-xl p-3">
              <span className={cn(
                'text-sm font-extrabold w-6 text-center',
                i === 0 ? 'text-amber-400' : i === 1 ? 'text-zinc-400' : i === 2 ? 'text-orange-600' : 'text-zinc-600'
              )}>
                {i === 0 ? '👑' : `#${i + 1}`}
              </span>
              <Avatar name={name} size={28} />
              <div className="flex-1">
                <p className="text-[13px] font-medium">{getUserName(name)}</p>
                <div className="mt-1.5 h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(amount / maxSpent) * 100}%` }}
                    transition={{ duration: 0.6, delay: i * 0.1 }}
                    className={cn(
                      'h-full rounded-full',
                      i === 0 ? 'bg-amber-400' : i === 1 ? 'bg-zinc-400' : 'bg-zinc-600'
                    )}
                  />
                </div>
              </div>
              <span className="text-[13px] font-bold tabular-nums">{currency(amount)}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Fun roles */}
      {roles.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="flex items-center gap-2 mb-3">
            <Award size={14} className="text-violet-400" />
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Gruppen-Rollen</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {roles.filter((r) => r.funRole).map((r) => (
              <div key={r.name} className="bg-[#161822] border border-white/[0.06] rounded-xl p-3 text-center">
                <Avatar name={r.name} size={36} className="mx-auto mb-2" />
                <p className="text-[13px] font-semibold">{getUserName(r.name)}</p>
                <p className="text-[11px] text-violet-400 font-medium mt-0.5">{r.funRole}</p>
                <p className="text-[10px] text-zinc-600 mt-0.5 capitalize">{r.role}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Chat activity */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <div className="flex items-center gap-2 mb-3">
          <Users size={14} className="text-emerald-400" />
          <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Chat-Aktivität</span>
        </div>
        <div className="flex gap-2">
          {topChatter.map(([name, count]) => {
            const maxMsg = topChatter[0]?.[1] || 1
            const pct = (count / (maxMsg as number)) * 100
            return (
              <div key={name} className="flex-1 bg-[#161822] border border-white/[0.06] rounded-xl p-3 text-center">
                <Avatar name={name} size={28} className="mx-auto mb-1.5" />
                <p className="text-[11px] font-medium truncate">{getUserName(name)}</p>
                <div className="mt-2 mx-auto w-6 bg-white/[0.04] rounded-full overflow-hidden" style={{ height: 40 }}>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${pct}%` }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="w-full bg-emerald-500/60 rounded-full"
                    style={{ marginTop: `${100 - pct}%` }}
                  />
                </div>
                <p className="text-[11px] font-bold text-zinc-400 mt-1.5">{count}</p>
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* Place ratings summary */}
      {places.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="flex items-center gap-2 mb-3">
            <Star size={14} className="text-amber-400" />
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Top Orte</span>
          </div>
          <div className="space-y-2">
            {[...places]
              .filter((p) => p.ratings.length > 0)
              .sort((a, b) => {
                const avgA = a.ratings.reduce((s, r) => s + r.score, 0) / a.ratings.length
                const avgB = b.ratings.reduce((s, r) => s + r.score, 0) / b.ratings.length
                return avgB - avgA
              })
              .slice(0, 3)
              .map((p) => {
                const avg = p.ratings.reduce((s, r) => s + r.score, 0) / p.ratings.length
                return (
                  <div key={p.id} className="flex items-center gap-3 bg-[#161822] border border-white/[0.06] rounded-xl p-3">
                    <span className="text-xl">{p.emoji}</span>
                    <div className="flex-1">
                      <p className="text-[13px] font-medium">{p.name}</p>
                      <p className="text-[11px] text-zinc-500">{p.category}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Star size={13} fill="#f59e0b" stroke="#f59e0b" />
                      <span className="text-sm font-bold text-amber-400">{avg.toFixed(1)}</span>
                    </div>
                  </div>
                )
              })}
          </div>
        </motion.div>
      )}
    </div>
  )
}

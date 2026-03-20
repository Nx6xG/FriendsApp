import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAppStore } from '@/stores/appStore'
import { Avatar } from '@/components/ui/Avatar'

export function JoinPage() {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const { groups, joinGroup, currentUser, profile, updateProfile } = useAppStore()
  // Find the group by invite code
  const group = groups.find((g) => g.inviteCode === code?.toUpperCase())

  // Determine status synchronously (no useEffect needed)
  const getStatus = (): 'found' | 'not_found' | 'already_member' => {
    if (!code || !group) return 'not_found'
    if (group.members.includes(currentUser)) return 'already_member'
    return 'found'
  }

  const [status, setStatus] = useState<'found' | 'not_found' | 'already_member' | 'joined'>(getStatus)

  const handleJoin = () => {
    if (!code) return
    const result = joinGroup(code)
    if (result) {
      setStatus('joined')
      setTimeout(() => navigate(`/group/${result.id}`), 1000)
    }
  }

  const handleLater = () => {
    if (!group) { navigate('/'); return }
    const pending = profile.pendingInvites || []
    if (!pending.some((p) => p.groupId === group.id)) {
      updateProfile({
        pendingInvites: [...pending, {
          groupId: group.id,
          groupName: group.name,
          groupEmoji: group.emoji,
          members: group.members,
          invitedAt: Date.now(),
        }],
      })
    }
    navigate('/')
  }

  const lang = profile.language

  return (
    <div className="h-full flex flex-col items-center justify-center bg-[#0a0c12] px-8">
      {status === 'not_found' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <span className="text-5xl mb-4 block">❌</span>
          <h2 className="text-[20px] font-extrabold">{lang === 'de' ? 'Einladung ungültig' : 'Invalid invitation'}</h2>
          <p className="text-zinc-500 text-[14px] mt-2">{lang === 'de' ? 'Dieser Einladungslink ist nicht mehr gültig.' : 'This invite link is no longer valid.'}</p>
          <button onClick={() => navigate('/')} className="mt-6 px-8 py-3 bg-indigo-500 text-white rounded-2xl font-bold text-[14px] active:scale-95">
            {lang === 'de' ? 'Zur Startseite' : 'Go home'}
          </button>
        </motion.div>
      )}

      {status === 'already_member' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <span className="text-5xl mb-4 block">✅</span>
          <h2 className="text-[20px] font-extrabold">{lang === 'de' ? 'Bereits Mitglied' : 'Already a member'}</h2>
          <p className="text-zinc-500 text-[14px] mt-2">{lang === 'de' ? 'Du bist schon in dieser Gruppe.' : 'You\'re already in this group.'}</p>
          <button onClick={() => navigate(group ? `/group/${group.id}` : '/')} className="mt-6 px-8 py-3 bg-indigo-500 text-white rounded-2xl font-bold text-[14px] active:scale-95">
            {lang === 'de' ? 'Zur Gruppe' : 'Go to group'}
          </button>
        </motion.div>
      )}

      {status === 'joined' && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <span className="text-5xl mb-4 block">🎉</span>
          <h2 className="text-[20px] font-extrabold">{lang === 'de' ? 'Willkommen!' : 'Welcome!'}</h2>
          <p className="text-zinc-500 text-[14px] mt-2">{lang === 'de' ? 'Du bist der Gruppe beigetreten.' : 'You joined the group.'}</p>
        </motion.div>
      )}

      {status === 'found' && group && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center w-full max-w-[320px]">
          <div className="bg-[#161822] border border-white/[0.06] rounded-2xl p-6 mb-6">
            <span className="text-5xl block mb-3">{group.emoji}</span>
            <h2 className="text-[20px] font-extrabold">{group.name}</h2>
            <p className="text-zinc-500 text-[13px] mt-1">{group.members.length} {lang === 'de' ? 'Mitglieder' : 'members'}</p>

            <div className="flex justify-center -space-x-2 mt-4">
              {group.members.slice(0, 6).map((m) => (
                <Avatar key={m} name={m} size={32} />
              ))}
              {group.members.length > 6 && (
                <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-300 border-2 border-[#161822]">
                  +{group.members.length - 6}
                </div>
              )}
            </div>
            <div className="flex flex-wrap justify-center gap-1 mt-3">
              {group.members.slice(0, 6).map((m) => (
                <span key={m} className="text-[11px] text-zinc-500">{m}</span>
              ))}
            </div>
          </div>

          <button onClick={handleJoin}
            className="w-full py-4 bg-indigo-500 text-white rounded-2xl font-bold text-[15px] active:scale-95 transition-all mb-3">
            {lang === 'de' ? 'Gruppe beitreten' : 'Join group'}
          </button>
          <button onClick={handleLater}
            className="w-full py-3 border border-white/[0.08] rounded-2xl text-[14px] font-medium text-zinc-400 active:bg-white/[0.02] mb-3">
            {lang === 'de' ? 'Später' : 'Later'}
          </button>
          <button onClick={() => navigate('/')}
            className="text-[13px] text-zinc-600 active:text-zinc-400">
            {lang === 'de' ? 'Nicht beitreten' : 'Don\'t join'}
          </button>
        </motion.div>
      )}
    </div>
  )
}

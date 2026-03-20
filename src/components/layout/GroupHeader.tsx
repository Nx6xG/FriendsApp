import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Settings } from 'lucide-react'
import type { Group } from '@/types'
import { getUserName } from '@/lib/users'

export function GroupHeader({ group }: { group: Group }) {
  const navigate = useNavigate()

  return (
    <header className="shrink-0 z-20 border-b border-white/[0.06] bg-[#0e1015]">
      {/* Safe area spacer — background extends behind notch */}
      <div className="safe-top" />
      {/* Content — 44px on mobile, 52px on web */}
      <div className="flex items-center gap-3 px-4 h-[44px] sm:h-[52px]">
        <button
          onClick={() => navigate('/')}
          className="text-zinc-400 active:text-white transition-colors -ml-1 p-1"
        >
          <ChevronLeft size={22} />
        </button>
        <span className="text-2xl">{group.emoji}</span>
        <div className="flex-1 min-w-0">
          <h1 className="text-[15px] font-bold tracking-tight truncate">{group.name}</h1>
          <p className="text-[11px] text-zinc-500 truncate">{group.members.map(getUserName).join(', ')}</p>
        </div>
        <button onClick={() => navigate(`/group/${group.id}/settings`)}
          className="text-zinc-500 active:text-zinc-300 p-1">
          <Settings size={18} />
        </button>
      </div>
    </header>
  )
}

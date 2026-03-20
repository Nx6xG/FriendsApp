import { getAvatarColor } from '@/lib/utils'
import { getUserName } from '@/lib/users'

interface AvatarProps {
  name: string
  size?: number
  className?: string
}

export function Avatar({ name, size = 32, className = '' }: AvatarProps) {
  const displayName = getUserName(name)
  const bg = getAvatarColor(displayName)
  return (
    <div
      className={`flex items-center justify-center rounded-full font-bold uppercase shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        background: bg,
        color: '#fff',
        fontSize: size * 0.4,
        letterSpacing: '-0.02em',
      }}
    >
      {displayName.slice(0, 2)}
    </div>
  )
}

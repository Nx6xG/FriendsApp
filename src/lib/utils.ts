export const uid = () => crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10)

export const currency = (n: number) =>
  new Intl.NumberFormat('de-AT', { style: 'currency', currency: 'EUR' }).format(n)

const AVATAR_COLORS = [
  '#E8594F', '#F4A236', '#47B784', '#4A90D9', '#9B59B6',
  '#E67E73', '#1ABC9C', '#F39C12', '#3498DB', '#8E44AD',
]

export const getAvatarColor = (name: string) =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]

export const timeAgo = (ts: number) => {
  const d = Math.floor((Date.now() - ts) / 60000)
  if (d < 1) return 'gerade eben'
  if (d < 60) return `vor ${d}m`
  if (d < 1440) return `vor ${Math.floor(d / 60)}h`
  return `vor ${Math.floor(d / 1440)}d`
}

export const cn = (...classes: (string | boolean | undefined | null)[]) =>
  classes.filter(Boolean).join(' ')

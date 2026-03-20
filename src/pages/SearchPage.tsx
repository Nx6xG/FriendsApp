import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Search, CheckSquare, Coins, Calendar, MapPin, MessageCircle, Lightbulb, Globe } from 'lucide-react'
import { useAppStore } from '@/stores/appStore'
import { searchAll, getTabForType, type SearchResult } from '@/lib/search'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'

const TYPE_ICONS: Record<SearchResult['type'], typeof CheckSquare> = {
  todo: CheckSquare,
  expense: Coins,
  event: Calendar,
  place: MapPin,
  chat: MessageCircle,
  suggestion: Lightbulb,
  mapPin: Globe,
}

const TYPE_COLORS: Record<SearchResult['type'], string> = {
  todo: 'text-cyan-400 bg-cyan-500/10',
  expense: 'text-pink-400 bg-pink-500/10',
  event: 'text-indigo-400 bg-indigo-500/10',
  place: 'text-emerald-400 bg-emerald-500/10',
  chat: 'text-zinc-400 bg-zinc-500/10',
  suggestion: 'text-violet-400 bg-violet-500/10',
  mapPin: 'text-amber-400 bg-amber-500/10',
}

export function SearchPage() {
  const navigate = useNavigate()
  const t = useT()
  const groups = useAppStore((s) => s.groups)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])

  useEffect(() => {
    const timer = setTimeout(() => {
      setResults(searchAll(groups, query))
    }, 200)
    return () => clearTimeout(timer)
  }, [query, groups])

  // Group results by type
  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    if (!acc[r.type]) acc[r.type] = []
    acc[r.type].push(r)
    return acc
  }, {})

  return (
    <div className="h-full flex flex-col bg-[#0a0c12]">
      {/* Header */}
      <header className="shrink-0 z-20 border-b border-white/[0.06] bg-[#0e1015]">
        <div className="safe-top" />
        <div className="flex items-center gap-3 px-4" style={{ height: 44 }}>
          <button onClick={() => navigate(-1)} className="text-zinc-400 active:text-white -ml-1 p-2">
            <ChevronLeft size={22} />
          </button>
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('search.placeholder')}
              autoFocus
              className="w-full pl-9 pr-3 py-2.5 bg-[#161822] border border-white/[0.08] rounded-xl text-white text-sm outline-none focus:border-indigo-500/50 placeholder:text-zinc-600"
            />
          </div>
        </div>
      </header>

      {/* Results */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {query.trim() && results.length === 0 && (
          <div className="text-center py-16">
            <Search size={32} className="text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-600 text-sm">{t('search.no_results')}</p>
          </div>
        )}

        {!query.trim() && (
          <div className="text-center py-16">
            <Search size={32} className="text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-500 text-sm">
              {t('search.placeholder')}
            </p>
          </div>
        )}

        {Object.entries(grouped).map(([type, items]) => {
          const Icon = TYPE_ICONS[type as SearchResult['type']]
          const colorClass = TYPE_COLORS[type as SearchResult['type']]
          return (
            <div key={type} className="px-4 mb-4">
              <div className="flex items-center gap-2 py-2">
                <div className={cn('w-6 h-6 rounded-lg flex items-center justify-center', colorClass)}>
                  <Icon size={12} />
                </div>
                <h4 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">
                  {t(`search.${type === 'mapPin' ? 'map_pins' : type + 's'}` as 'search.todos')} ({items.length})
                </h4>
              </div>
              <div className="flex flex-col gap-1">
                {items.map((result) => (
                  <button
                    key={`${result.type}-${result.id}-${result.groupId}`}
                    onClick={() => navigate(`/group/${result.groupId}/${getTabForType(result.type)}`)}
                    className="flex items-center gap-3 px-3 py-3 bg-[#161822] border border-white/[0.06] rounded-xl text-left w-full active:bg-white/[0.02] transition-colors"
                  >
                    <span className="text-lg">{result.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium truncate">{result.title}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] text-zinc-600">{result.groupEmoji} {result.groupName}</span>
                        {result.subtitle && (
                          <span className="text-[10px] text-zinc-700">· {result.subtitle}</span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

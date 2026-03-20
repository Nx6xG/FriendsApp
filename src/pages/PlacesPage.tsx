import { useState, useMemo } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Plus, Star, MapPin, ChevronDown, ChevronUp, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/stores/appStore'
import { uid, cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/Avatar'
import type { Group, PlaceRating } from '@/types'

const CATEGORIES = ['Restaurant', 'Café', 'Bar', 'Aktivität', 'Einkauf', 'Sonstiges']
const CATEGORY_EMOJIS: Record<string, string> = {
  Restaurant: '🍽️', Café: '☕', Bar: '🍸', Aktivität: '🎯', Einkauf: '🛒', Sonstiges: '📌',
}

type SortOption = 'newest' | 'best' | 'worst' | 'alpha'
const SORT_OPTIONS: { key: SortOption; label: string }[] = [
  { key: 'newest', label: 'Neueste' },
  { key: 'best', label: 'Beste' },
  { key: 'worst', label: 'Schlechteste' },
  { key: 'alpha', label: 'Name A-Z' },
]

/** Deduplicate ratings by userId, keeping the latest entry per user */
const getUniqueRatings = (ratings: PlaceRating[]): PlaceRating[] => {
  const map = new Map<string, PlaceRating>()
  ratings.forEach((r) => map.set(r.userId, r))
  return Array.from(map.values())
}

/** Average score from deduplicated ratings */
const getAvgScore = (ratings: PlaceRating[]): number => {
  const unique = getUniqueRatings(ratings)
  return unique.length ? unique.reduce((s, r) => s + r.score, 0) / unique.length : 0
}

function Stars({ count, max = 5, size = 14, interactive, onChange }: { count: number; max?: number; size?: number; interactive?: boolean; onChange?: (n: number) => void }) {
  return (
    <div className="flex">
      {Array.from({ length: max }).map((_, i) => {
        const full = count >= i + 1
        const half = !full && count >= i + 0.5

        if (!interactive) {
          return (
            <div key={i} className="relative" style={{ width: size, height: size }}>
              <Star size={size} fill="none" stroke="#3f3f46" strokeWidth={1.8} />
              {(full || half) && (
                <div className="absolute inset-0 overflow-hidden" style={{ width: full ? '100%' : '50%' }}>
                  <Star size={size} fill="#f59e0b" stroke="#f59e0b" strokeWidth={1.8} />
                </div>
              )}
            </div>
          )
        }

        // Interactive: left half = x.5, right half = x+1
        return (
          <div key={i} className="relative flex cursor-pointer active:scale-110 transition-transform" style={{ width: size, height: size }}>
            {/* Left half → half star */}
            <button onClick={() => onChange?.(i + 0.5)}
              className="absolute inset-y-0 left-0 w-1/2 z-10" />
            {/* Right half → full star */}
            <button onClick={() => onChange?.(i + 1)}
              className="absolute inset-y-0 right-0 w-1/2 z-10" />
            {/* Visual */}
            <Star size={size} fill="none" stroke="#3f3f46" strokeWidth={1.8} />
            {(full || half) && (
              <div className="absolute inset-0 overflow-hidden" style={{ width: full ? '100%' : '50%' }}>
                <Star size={size} fill="#f59e0b" stroke="#f59e0b" strokeWidth={1.8} />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export function PlacesPage() {
  const { group } = useOutletContext<{ group: Group }>()
  const { currentUser, addPlace, addPlaceRating, addFeedItem } = useAppStore()
  const [showForm, setShowForm] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [ratingPlace, setRatingPlace] = useState<string | null>(null)
  const [ratingScore, setRatingScore] = useState(0)
  const [ratingComment, setRatingComment] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('newest')

  // New place form
  const [name, setName] = useState('')
  const [category, setCategory] = useState('Restaurant')
  const [address, setAddress] = useState('')

  const places = useMemo(() => {
    const list = [...(group.places || [])]
    switch (sortBy) {
      case 'newest':
        return list.sort((a, b) => b.createdAt - a.createdAt)
      case 'best':
        return list.sort((a, b) => getAvgScore(b.ratings) - getAvgScore(a.ratings))
      case 'worst':
        return list.sort((a, b) => getAvgScore(a.ratings) - getAvgScore(b.ratings))
      case 'alpha':
        return list.sort((a, b) => a.name.localeCompare(b.name, 'de'))
      default:
        return list
    }
  }, [group.places, sortBy])

  const handleAddPlace = () => {
    if (!name.trim()) return
    const place = {
      id: uid(), name: name.trim(), emoji: CATEGORY_EMOJIS[category] || '📌',
      category, address: address.trim() || undefined,
      ratings: [], addedBy: currentUser, createdAt: Date.now(),
    }
    addPlace(group.id, place)
    addFeedItem(group.id, { type: 'place', text: `${currentUser} hat "${place.name}" hinzugefügt`, timestamp: Date.now() })
    setName(''); setAddress(''); setShowForm(false)
  }

  const handleRate = (placeId: string) => {
    if (ratingScore === 0) return
    // eslint-disable-next-line react-hooks/purity
    const rating = { id: uid(), userId: currentUser, score: ratingScore, comment: ratingComment.trim() || undefined, createdAt: Date.now() }
    addPlaceRating(group.id, placeId, rating)
    const place = places.find((p) => p.id === placeId)
    if (place) {
      // eslint-disable-next-line react-hooks/purity
      addFeedItem(group.id, { type: 'place', text: `${currentUser} hat "${place.name}" bewertet: ${ratingScore}/5 ⭐`, timestamp: Date.now() })
    }
    setRatingPlace(null); setRatingScore(0); setRatingComment('')
  }

  /** Open rating form, pre-filling if user already rated this place */
  const openRatingForm = (placeId: string) => {
    const place = places.find((p) => p.id === placeId)
    if (place) {
      const existing = getUniqueRatings(place.ratings).find((r) => r.userId === currentUser)
      if (existing) {
        setRatingScore(existing.score)
        setRatingComment(existing.comment || '')
      } else {
        setRatingScore(0)
        setRatingComment('')
      }
    }
    setRatingPlace(placeId)
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Orte</h3>
        <button onClick={() => setShowForm(!showForm)} className="text-indigo-400 text-xs font-semibold flex items-center gap-1">
          {showForm ? <><X size={14} /> Abbrechen</> : <><Plus size={14} /> Neu</>}
        </button>
      </div>

      {/* Sort pills */}
      <div className="flex gap-1.5 mb-4 flex-wrap">
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setSortBy(opt.key)}
            className={cn(
              'px-3 py-2 rounded-full text-[12px] font-medium transition-colors',
              sortBy === opt.key
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                : 'bg-[#0e1015] text-zinc-500 border border-white/[0.06]'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Add place form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-5">
            <div className="bg-[#161822] border border-white/[0.06] rounded-2xl p-4 space-y-3">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name des Ortes" autoFocus
                className="w-full px-3 py-2.5 bg-[#0e1015] border border-white/[0.08] rounded-xl text-white text-sm outline-none focus:border-indigo-500/50 placeholder:text-zinc-600" />
              <div className="flex gap-2 flex-wrap">
                {CATEGORIES.map((c) => (
                  <button key={c} onClick={() => setCategory(c)}
                    className={cn('px-3 py-2.5 rounded-lg text-xs font-medium transition-colors',
                      category === c ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-[#0e1015] text-zinc-500 border border-white/[0.06]'
                    )}>{CATEGORY_EMOJIS[c]} {c}</button>
                ))}
              </div>
              <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="📍 Adresse (optional)"
                className="w-full px-3 py-2.5 bg-[#0e1015] border border-white/[0.08] rounded-xl text-white text-sm outline-none focus:border-indigo-500/50 placeholder:text-zinc-600" />
              <button onClick={handleAddPlace} disabled={!name.trim()}
                className="w-full py-2.5 bg-indigo-500 text-white rounded-xl font-bold text-sm active:scale-[0.98] disabled:opacity-30">
                Ort hinzufügen
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Place list */}
      <div className="flex flex-col gap-3">
        {places.map((place, i) => {
          const uniqueRatings = getUniqueRatings(place.ratings)
          const avg = getAvgScore(place.ratings)
          const expanded = expandedId === place.id
          const hasRated = uniqueRatings.some((r) => r.userId === currentUser)
          const isRating = ratingPlace === place.id

          return (
            <motion.div
              key={place.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-[#161822] border border-white/[0.06] rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => setExpandedId(expanded ? null : place.id)}
                className="w-full flex items-center gap-3 p-4 text-left"
              >
                <span className="text-2xl">{place.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold truncate">{place.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Stars count={Math.round(avg)} size={12} />
                    <span className="text-[11px] text-zinc-500">
                      {avg.toFixed(1)} · {uniqueRatings.length} Bewertung{uniqueRatings.length !== 1 && 'en'}
                    </span>
                  </div>
                  {place.address && (
                    <div className="flex items-center gap-1 mt-1 text-[11px] text-zinc-600">
                      <MapPin size={10} /> {place.address}
                    </div>
                  )}
                </div>
                <span className="text-zinc-600">
                  {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </span>
              </button>

              <AnimatePresence>
                {expanded && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-white/[0.04] px-4 py-3 space-y-3">
                      {/* Individual ratings (deduplicated) */}
                      {uniqueRatings.map((r) => (
                        <div key={r.id} className="flex items-start gap-2.5">
                          <Avatar name={r.userId} size={24} className="mt-0.5" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[12px] font-medium">{r.userId}</span>
                              <Stars count={r.score} size={10} />
                            </div>
                            {r.comment && <p className="text-[12px] text-zinc-500 mt-0.5">{r.comment}</p>}
                          </div>
                        </div>
                      ))}

                      {/* Add or edit rating */}
                      {!isRating && (
                        <button
                          onClick={() => openRatingForm(place.id)}
                          className="w-full py-2.5 text-center text-[12px] text-indigo-400 font-semibold border border-dashed border-indigo-500/20 rounded-xl active:bg-indigo-500/5"
                        >
                          {hasRated ? 'Bewertung ändern' : '+ Bewertung abgeben'}
                        </button>
                      )}

                      {isRating && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#0e1015] rounded-xl p-3 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[12px] text-zinc-400">Deine Bewertung:</span>
                            <Stars count={ratingScore} size={18} interactive onChange={setRatingScore} />
                          </div>
                          <input
                            value={ratingComment}
                            onChange={(e) => setRatingComment(e.target.value)}
                            placeholder="Kommentar (optional)"
                            className="w-full px-3 py-2 bg-[#161822] border border-white/[0.08] rounded-lg text-white text-[12px] outline-none placeholder:text-zinc-600"
                          />
                          <div className="flex gap-2">
                            <button onClick={() => { setRatingPlace(null); setRatingScore(0); setRatingComment('') }}
                              className="flex-1 py-2 text-[12px] text-zinc-500 rounded-lg border border-white/[0.06]">
                              Abbrechen
                            </button>
                            <button onClick={() => handleRate(place.id)} disabled={ratingScore === 0}
                              className="flex-1 py-2 text-[12px] text-white font-semibold bg-indigo-500 rounded-lg disabled:opacity-30">
                              {hasRated ? 'Aktualisieren' : 'Bewerten'}
                            </button>
                          </div>
                        </motion.div>
                      )}

                      <p className="text-[10px] text-zinc-700">
                        Hinzugefügt von {place.addedBy}{place.visitedAt && ` · Besucht am ${place.visitedAt}`}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>

      {places.length === 0 && (
        <p className="text-zinc-600 text-sm text-center py-12">Noch keine Orte hinzugefügt 📍</p>
      )}
    </div>
  )
}

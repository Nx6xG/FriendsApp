import { useState, useEffect, useRef, useCallback } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Plus, X, Navigation, Eye, EyeOff, Locate } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useAppStore } from '@/stores/appStore'
import { canUseFeature } from '@/lib/plans'
import { ProPrompt } from '@/components/ui/ProGate'
import { startLocationTracking, stopLocationTracking, isTrackingGroup } from '@/lib/location'
import { uid, cn, timeAgo } from '@/lib/utils'
import { getAuthorId, isMe, getUserName } from '@/lib/users'
import { Avatar } from '@/components/ui/Avatar'
import type { Group, MapPin as MapPinType } from '@/types'

// ─── Custom marker icons ──────────────────────────────────────

function createPinIcon(color: string, emoji: string) {
  return L.divIcon({
    className: '',
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40],
    html: `<div style="position:relative;width:32px;height:40px">
      <svg width="32" height="40" viewBox="0 0 32 40" fill="none">
        <path d="M16 0C7.16 0 0 7.16 0 16c0 12 16 24 16 24s16-12 16-24C32 7.16 24.84 0 16 0z" fill="${color}"/>
        <circle cx="16" cy="15" r="11" fill="rgba(0,0,0,0.25)"/>
      </svg>
      <span style="position:absolute;top:6px;left:0;right:0;text-align:center;font-size:14px;line-height:1">${emoji}</span>
    </div>`,
  })
}

function createLiveIcon(name: string) {
  const initial = name.slice(0, 1).toUpperCase()
  return L.divIcon({
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    html: `<div style="
      width:28px;height:28px;
      display:flex;align-items:center;justify-content:center;
      background:#6366f1;
      border:2px solid #818cf8;
      border-radius:50%;
      color:white;font-size:11px;font-weight:700;
      box-shadow:0 0 12px rgba(99,102,241,0.5);
      animation:livePulse 2s ease-in-out infinite;
    ">${initial}</div>`,
  })
}

// ─── Map controller to fit bounds ─────────────────────────────

function FitBounds({ pins, live }: { pins: MapPinType[]; live: { lat: number; lng: number }[] }) {
  const map = useMap()
  const fitted = useRef(false)

  useEffect(() => {
    if (fitted.current) return
    const points = [
      ...pins.map((p) => [p.lat, p.lng] as [number, number]),
      ...live.map((l) => [l.lat, l.lng] as [number, number]),
    ]
    if (points.length > 0) {
      map.fitBounds(points, { padding: [40, 40], maxZoom: 12 })
      fitted.current = true
    }
  }, [pins, live, map])

  return null
}

function FlyToPoint({ lat, lng }: { lat: number | null; lng: number | null }) {
  const map = useMap()
  useEffect(() => {
    if (lat !== null && lng !== null) {
      map.flyTo([lat, lng], 14, { duration: 1 })
    }
  }, [lat, lng, map])
  return null
}

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

// ─── Component ────────────────────────────────────────────────

export function MapPage() {
  const { group } = useOutletContext<{ group: Group }>()
  const { currentUser, addMapPin, deleteMapPin, addFeedItem } = useAppStore()
  const [showForm, setShowForm] = useState(false)
  const [showLive, setShowLive] = useState(true)
  const [selectedPin, setSelectedPin] = useState<MapPinType | null>(null)
  const [filter, setFilter] = useState<'all' | 'visited' | 'wishlist'>('all')
  const [tracking, setTracking] = useState(isTrackingGroup(group.id))
  const [flyTarget, setFlyTarget] = useState<{ lat: number; lng: number } | null>(null)
  const [tapLocation, setTapLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [showProPrompt, setShowProPrompt] = useState(false)

  const toggleTracking = useCallback(async () => {
    if (tracking) {
      await stopLocationTracking(group.id)
      setTracking(false)
    } else {
      if (!canUseFeature('gps')) { setShowProPrompt(true); return }
      try {
        const success = await startLocationTracking(group.id)
        setTracking(success ?? false)
      } catch {
        setTracking(false)
      }
    }
  }, [tracking, group.id])

  // Form state
  const [label, setLabel] = useState('')
  const [emoji, setEmoji] = useState('📍')
  const [pinType, setPinType] = useState<'visited' | 'wishlist'>('wishlist')
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')

  const pins = (group.mapPins || []).filter(
    (p) => filter === 'all' || p.type === filter
  )
  const liveLocations = (group.liveLocations || []).filter((l) => l.sharing)

  const handleAdd = () => {
    if (!label.trim() || !lat || !lng) return
    const pin: MapPinType = {
      id: uid(), lat: parseFloat(lat), lng: parseFloat(lng),
      label: label.trim(), emoji, type: pinType,
      addedBy: getAuthorId(), createdAt: Date.now(),
    }
    addMapPin(group.id, pin)
    addFeedItem(group.id, {
      type: 'system',
      text: `${currentUser} hat "${pin.label}" ${pin.type === 'visited' ? 'als besucht markiert' : 'zur Wunschliste hinzugefügt'} ${emoji}`,
      timestamp: Date.now(),
    })
    setLabel(''); setLat(''); setLng(''); setEmoji('📍'); setShowForm(false); setTapLocation(null)
  }

  const presets = [
    { label: 'Wien', lat: 48.21, lng: 16.37, emoji: '🏙️' },
    { label: 'Berlin', lat: 52.52, lng: 13.41, emoji: '🇩🇪' },
    { label: 'Paris', lat: 48.86, lng: 2.35, emoji: '🇫🇷' },
    { label: 'Rom', lat: 41.90, lng: 12.50, emoji: '🇮🇹' },
    { label: 'London', lat: 51.51, lng: -0.13, emoji: '🇬🇧' },
    { label: 'New York', lat: 40.71, lng: -74.01, emoji: '🗽' },
    { label: 'Tokyo', lat: 35.68, lng: 139.65, emoji: '🇯🇵' },
    { label: 'Bangkok', lat: 13.76, lng: 100.50, emoji: '🇹🇭' },
    { label: 'Barcelona', lat: 41.39, lng: 2.17, emoji: '🇪🇸' },
    { label: 'Prag', lat: 50.08, lng: 14.44, emoji: '🇨🇿' },
    { label: 'Amsterdam', lat: 52.37, lng: 4.90, emoji: '🇳🇱' },
    { label: 'Lissabon', lat: 38.72, lng: -9.14, emoji: '🇵🇹' },
  ]

  const visitedCount = (group.mapPins || []).filter((p) => p.type === 'visited').length
  const wishlistCount = (group.mapPins || []).filter((p) => p.type === 'wishlist').length

  // Default center: Vienna or first pin
  const defaultCenter: [number, number] = pins.length > 0
    ? [pins[0].lat, pins[0].lng]
    : [48.21, 16.37]

  return (
    <div className="p-4">
      {/* Header stats */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1 bg-emerald-500/10 border border-emerald-500/15 rounded-xl p-3 text-center">
          <p className="text-xl font-extrabold text-emerald-400">{visitedCount}</p>
          <p className="text-[10px] text-zinc-500 mt-0.5">Besucht</p>
        </div>
        <div className="flex-1 bg-amber-500/10 border border-amber-500/15 rounded-xl p-3 text-center">
          <p className="text-xl font-extrabold text-amber-400">{wishlistCount}</p>
          <p className="text-[10px] text-zinc-500 mt-0.5">Wunschliste</p>
        </div>
        <div className="flex-1 bg-indigo-500/10 border border-indigo-500/15 rounded-xl p-3 text-center">
          <p className="text-xl font-extrabold text-indigo-400">{liveLocations.length}</p>
          <p className="text-[10px] text-zinc-500 mt-0.5">Online</p>
        </div>
      </div>

      {/* Filter + controls */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex gap-1.5">
          {(['all', 'visited', 'wishlist'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={cn('px-3 py-2 rounded-lg text-[11px] font-semibold transition-colors',
                filter === f ? 'bg-indigo-500/20 text-indigo-300' : 'bg-white/[0.03] text-zinc-600'
              )}>
              {f === 'all' ? 'Alle' : f === 'visited' ? '✅ Besucht' : '✨ Wunsch'}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5">
          <button onClick={toggleTracking}
            className={cn('p-2.5 rounded-lg transition-colors', tracking ? 'text-indigo-400 bg-indigo-500/10' : 'text-zinc-600 bg-white/[0.03]')}
            title={tracking ? 'Standort wird geteilt' : 'Standort teilen'}>
            <Locate size={14} />
          </button>
          <button onClick={() => setShowLive(!showLive)}
            className={cn('p-2.5 rounded-lg transition-colors', showLive ? 'text-emerald-400 bg-emerald-500/10' : 'text-zinc-600 bg-white/[0.03]')}>
            {showLive ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
          <button onClick={() => setShowForm(!showForm)} className="text-indigo-400 text-xs font-semibold flex items-center gap-1 px-3 py-2.5 bg-indigo-500/10 rounded-lg">
            {showForm ? <X size={13} /> : <Plus size={13} />}
          </button>
        </div>
      </div>

      {/* Leaflet Map */}
      <div className="rounded-2xl overflow-hidden border border-white/[0.06] mb-4" style={{ height: 320 }}>
        <MapContainer
          center={defaultCenter}
          zoom={pins.length > 0 ? 5 : 3}
          minZoom={2}
          maxZoom={15}
          style={{ height: '100%', width: '100%', background: '#0d1117' }}
          zoomControl={false}
          attributionControl={true}
        >
          <TileLayer
            url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
          />

          <FitBounds
            pins={pins}
            live={showLive ? liveLocations.map((l) => ({ lat: l.lat, lng: l.lng })) : []}
          />
          <FlyToPoint lat={flyTarget?.lat ?? null} lng={flyTarget?.lng ?? null} />

          {/* City pins */}
          {pins.map((pin) => {
            const color = pin.type === 'visited' ? '#22c55e' : '#f59e0b'
            return (
              <Marker
                key={pin.id}
                position={[pin.lat, pin.lng]}
                icon={createPinIcon(color, pin.emoji)}
                eventHandlers={{
                  click: () => {
                    setSelectedPin(selectedPin?.id === pin.id ? null : pin)
                    setFlyTarget({ lat: pin.lat, lng: pin.lng })
                  },
                }}
              >
                <Tooltip direction="bottom" offset={[0, 4]} className="city-label">
                  {pin.label}
                </Tooltip>
              </Marker>
            )
          })}

          {/* Live locations */}
          {showLive && liveLocations.map((loc) => (
            <Marker
              key={`live-${loc.userId}`}
              position={[loc.lat, loc.lng]}
              icon={createLiveIcon(loc.userId)}
            >
              <Popup>
                <div style={{ color: '#1c1c1e' }}>
                  <strong>{loc.userId}</strong>
                  <br />
                  <span style={{ fontSize: 11, color: '#666' }}>
                    {loc.label || 'Unterwegs'} · {timeAgo(loc.updatedAt)}
                  </span>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Click on map to place a new pin */}
          <MapClickHandler onMapClick={(clickLat, clickLng) => {
            setLat(String(Math.round(clickLat * 10000) / 10000))
            setLng(String(Math.round(clickLng * 10000) / 10000))
            setTapLocation({ lat: clickLat, lng: clickLng })
            setShowForm(true)
          }} />

          {/* Temporary marker for new pin location */}
          {tapLocation && showForm && (
            <Marker
              position={[tapLocation.lat, tapLocation.lng]}
              icon={L.divIcon({
                className: '',
                iconSize: [32, 40],
                iconAnchor: [16, 40],
                html: `<div style="position:relative;width:32px;height:40px;opacity:0.6">
                  <svg width="32" height="40" viewBox="0 0 32 40" fill="none">
                    <path d="M16 0C7.16 0 0 7.16 0 16c0 12 16 24 16 24s16-12 16-24C32 7.16 24.84 0 16 0z" fill="#818cf8"/>
                    <circle cx="16" cy="15" r="11" fill="rgba(0,0,0,0.25)"/>
                  </svg>
                  <span style="position:absolute;top:6px;left:0;right:0;text-align:center;font-size:14px;line-height:1">📍</span>
                </div>`,
              })}
            />
          )}
        </MapContainer>
      </div>

      {/* Selected pin detail */}
      <AnimatePresence>
        {selectedPin && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="bg-[#161822] border border-white/[0.06] rounded-2xl p-4 mb-4 flex items-center gap-3">
            <span className="text-2xl">{selectedPin.emoji}</span>
            <div className="flex-1">
              <p className="text-[14px] font-bold">{selectedPin.label}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded',
                  selectedPin.type === 'visited' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'
                )}>{selectedPin.type === 'visited' ? 'Besucht' : 'Wunschliste'}</span>
                <Avatar name={selectedPin.addedBy} size={16} />
                <span className="text-[11px] text-zinc-500">{getUserName(selectedPin.addedBy)}</span>
                {selectedPin.date && <span className="text-[11px] text-zinc-600">{selectedPin.date}</span>}
              </div>
            </div>
            {isMe(selectedPin.addedBy) && (
              <button onClick={() => { deleteMapPin(group.id, selectedPin.id); setSelectedPin(null) }}
                className="text-zinc-600 active:text-red-400 p-1">
                <X size={14} />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live location list */}
      {showLive && liveLocations.length > 0 && (
        <div className="mb-4">
          <h4 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <Navigation size={11} /> Wo ist wer?
          </h4>
          <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
            {liveLocations.map((loc) => (
              <button key={loc.userId} onClick={() => setFlyTarget({ lat: loc.lat, lng: loc.lng })}
                className="flex-shrink-0 bg-[#161822] border border-white/[0.06] rounded-xl px-3 py-2 flex items-center gap-2 active:bg-white/[0.03] transition-colors">
                <div className="relative">
                  <Avatar name={loc.userId} size={24} />
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#161822]" />
                </div>
                <div className="text-left">
                  <p className="text-[11px] font-semibold">{loc.userId}</p>
                  <p className="text-[9px] text-zinc-600">{loc.label || 'Unterwegs'} · {timeAgo(loc.updatedAt)}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Add form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-4">
            <div className="bg-[#161822] border border-white/[0.06] rounded-2xl p-4 space-y-3">
              <p className="text-[12px] font-semibold text-zinc-400">Neuen Ort hinzufügen</p>

              {/* Quick presets */}
              <div className="flex gap-1.5 flex-wrap">
                {presets.map((p) => (
                  <button key={p.label} onClick={() => { setLabel(p.label); setLat(String(p.lat)); setLng(String(p.lng)); setEmoji(p.emoji) }}
                    className="px-2.5 py-1.5 rounded-lg text-[10px] font-medium bg-[#0e1015] border border-white/[0.06] text-zinc-400 active:bg-indigo-500/10 active:text-indigo-300">
                    {p.emoji} {p.label}
                  </button>
                ))}
              </div>

              <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Ortsname"
                className="w-full px-3 py-2.5 bg-[#0e1015] border border-white/[0.08] rounded-xl text-white text-sm outline-none focus:border-indigo-500/50 placeholder:text-zinc-600" />
              <div className="flex gap-2">
                <input value={lat} onChange={(e) => setLat(e.target.value)} placeholder="Breitengrad" type="number" step="0.01" inputMode="decimal"
                  className="flex-1 px-3 py-2.5 bg-[#0e1015] border border-white/[0.08] rounded-xl text-white text-sm outline-none placeholder:text-zinc-600" />
                <input value={lng} onChange={(e) => setLng(e.target.value)} placeholder="Längengrad" type="number" step="0.01" inputMode="decimal"
                  className="flex-1 px-3 py-2.5 bg-[#0e1015] border border-white/[0.08] rounded-xl text-white text-sm outline-none placeholder:text-zinc-600" />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setPinType('visited')}
                  className={cn('flex-1 py-2 rounded-xl text-[12px] font-semibold transition-colors',
                    pinType === 'visited' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-[#0e1015] text-zinc-500 border border-white/[0.06]')}>
                  ✅ Besucht
                </button>
                <button onClick={() => setPinType('wishlist')}
                  className={cn('flex-1 py-2 rounded-xl text-[12px] font-semibold transition-colors',
                    pinType === 'wishlist' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20' : 'bg-[#0e1015] text-zinc-500 border border-white/[0.06]')}>
                  ✨ Wunschliste
                </button>
              </div>
              <button onClick={handleAdd} disabled={!label.trim() || !lat || !lng}
                className="w-full py-2.5 bg-indigo-500 text-white rounded-xl font-bold text-sm active:scale-[0.98] disabled:opacity-30">
                Pin setzen
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pin list */}
      <h4 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Alle Pins ({pins.length})</h4>
      <div className="flex flex-col gap-1.5">
        {pins.length === 0 && (
          <div className="text-center py-8">
            <span className="text-3xl">🗺️</span>
            <p className="text-zinc-500 text-[13px] mt-2">Noch keine Pins — füge euren ersten Ort hinzu!</p>
          </div>
        )}
        {pins.map((pin) => (
          <button key={pin.id} onClick={() => { setSelectedPin(pin); setFlyTarget({ lat: pin.lat, lng: pin.lng }) }}
            className={cn(
              'flex items-center gap-2.5 px-3 py-2.5 border rounded-xl text-left w-full active:bg-white/[0.02] transition-colors',
              selectedPin?.id === pin.id
                ? pin.type === 'visited' ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-amber-500/5 border-amber-500/20'
                : 'bg-[#161822] border-white/[0.06]'
            )}>
            <span className="text-base">{pin.emoji}</span>
            <p className="text-[13px] font-medium flex-1 truncate">{pin.label}</p>
            <span className={cn('text-[9px] font-semibold px-1.5 py-0.5 rounded',
              pin.type === 'visited' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
            )}>{pin.type === 'visited' ? '✅' : '✨'}</span>
            <Avatar name={pin.addedBy} size={18} />
          </button>
        ))}
      </div>
      {showProPrompt && <ProPrompt feature="GPS Live-Standort" onClose={() => setShowProPrompt(false)} />}
    </div>
  )
}

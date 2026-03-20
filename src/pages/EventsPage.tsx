import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Plus, MapPin, Clock, Users, Trash2, Check, X, CalendarPlus, List, CalendarDays, ChevronLeft, ChevronRight, Link2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/stores/appStore'
import { uid, cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/Avatar'
import { LinkedChips } from '@/components/ui/LinkedChips'
import { notifyEventCreated } from '@/lib/notifications'
import { hapticLight } from '@/lib/haptics'
import { canUseFeature } from '@/lib/plans'
import { ProPrompt } from '@/components/ui/ProGate'
import { LinkPicker } from '@/components/ui/LinkPicker'
import type { Group, GroupEvent } from '@/types'

function generateICS(event: GroupEvent): string {
  const datePart = event.date.replace(/-/g, '')
  const [hours, minutes] = event.time.split(':').map(Number)
  const dtstart = `${datePart}T${String(hours).padStart(2, '0')}${String(minutes).padStart(2, '0')}00`

  const endHours = hours + 2
  const dtend = `${datePart}T${String(endHours).padStart(2, '0')}${String(minutes).padStart(2, '0')}00`

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `DTSTART:${dtstart}`,
    `DTEND:${dtend}`,
    `SUMMARY:${event.title}`,
  ]
  if (event.location) lines.push(`LOCATION:${event.location}`)
  if (event.description) lines.push(`DESCRIPTION:${event.description}`)
  lines.push('END:VEVENT', 'END:VCALENDAR')
  return lines.join('\r\n')
}

function downloadICS(event: GroupEvent) {
  const content = generateICS(event)
  // Use data: URI — works in both browser and iOS WKWebView
  const encoded = encodeURIComponent(content)
  const dataUri = `data:text/calendar;charset=utf-8,${encoded}`
  window.open(dataUri, '_blank')
}

const MONTH_NAMES = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember']
const DAY_HEADERS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

function getMonthGrid(year: number, month: number): (number | null)[][] {
  const firstDay = new Date(year, month, 1)
  // JS: 0=Sun, we want 0=Mon
  let startDow = firstDay.getDay() - 1
  if (startDow < 0) startDow = 6
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: (number | null)[] = []
  for (let i = 0; i < startDow; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  const rows: (number | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7))
  }
  return rows
}

function dateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function EventsPage() {
  const { group } = useOutletContext<{ group: Group }>()
  const { currentUser, addEvent, deleteEvent, toggleRSVP, addFeedItem, updateEvent } = useAppStore()
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [emoji, setEmoji] = useState('📅')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('18:00')
  const [location, setLocation] = useState('')
  const [desc, setDesc] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [viewMonth, setViewMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [linkingEventId, setLinkingEventId] = useState<string | null>(null)
  const [showProPrompt, setShowProPrompt] = useState<string | null>(null)
  const [recurrence, setRecurrence] = useState<'none' | 'weekly' | 'biweekly' | 'monthly'>('none')

  const events = [...(group.events || [])].sort(
    (a, b) => new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime()
  )

  const upcoming = events.filter((e) => new Date(e.date) >= new Date(new Date().toDateString()))
  const past = events.filter((e) => new Date(e.date) < new Date(new Date().toDateString()))

  const eventsByDate: Record<string, GroupEvent[]> = {}
  for (const ev of events) {
    if (!eventsByDate[ev.date]) eventsByDate[ev.date] = []
    eventsByDate[ev.date].push(ev)
  }

  const handleAdd = () => {
    if (!title.trim() || !date) return
    const ev = {
      id: uid(), title: title.trim(), emoji, date, time,
      location: location.trim() || undefined,
      description: desc.trim() || undefined,
      ...(recurrence !== 'none' && { recurrence }),
      attendees: [currentUser],
      createdBy: currentUser, createdAt: Date.now(),
    }
    addEvent(group.id, ev)
    hapticLight()
    notifyEventCreated(ev, group.id)
    addFeedItem(group.id, { type: 'event', text: `${currentUser} hat "${ev.title}" erstellt ${emoji}`, timestamp: Date.now() })
    setTitle(''); setDate(''); setTime('18:00'); setLocation(''); setDesc(''); setEmoji('📅'); setRecurrence('none'); setShowForm(false)
  }

  const formatDate = (d: string) => {
    const date = new Date(d + 'T00:00:00')
    const days = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']
    const months = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez']
    return `${days[date.getDay()]}, ${date.getDate()}. ${months[date.getMonth()]}`
  }

  const todayStr = new Date().toISOString().slice(0, 10)
  const isToday = (d: string) => d === todayStr
  const isTomorrow = (d: string) => {
    const t = new Date(); t.setDate(t.getDate() + 1)
    return d === t.toISOString().slice(0, 10)
  }

  const emojiOptions = ['📅', '🎳', '🍷', '🥾', '🎬', '🍕', '🎮', '🏖️', '🎉', '🥐', '⚽', '🎵']

  const EventCard = ({ event, isPast, onLink }: { event: GroupEvent; isPast?: boolean; onLink?: () => void }) => {
    const going = event.attendees.includes(currentUser)
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'bg-[#161822] border rounded-2xl overflow-hidden',
          isPast ? 'border-white/[0.04] opacity-50' : 'border-white/[0.06]'
        )}
      >
        {/* Date strip */}
        <div className={cn(
          'flex items-center gap-3 px-4 py-2.5 border-b',
          isToday(event.date) ? 'bg-indigo-500/10 border-indigo-500/20' :
          isTomorrow(event.date) ? 'bg-amber-500/10 border-amber-500/20' :
          'bg-white/[0.02] border-white/[0.04]'
        )}>
          <span className="text-xl">{event.emoji}</span>
          <div className="flex-1">
            <p className="text-[13px] font-bold">{event.title}</p>
            <p className="text-[11px] text-zinc-500">
              {isToday(event.date) ? 'Heute' : isTomorrow(event.date) ? 'Morgen' : formatDate(event.date)}
              {event.recurrence && event.recurrence !== 'none' && (
                <span className="text-[9px] text-zinc-500 ml-1">🔄 {event.recurrence === 'weekly' ? 'Wöchentl.' : event.recurrence === 'biweekly' ? 'Alle 2 W.' : 'Monatl.'}</span>
              )}
            </p>
          </div>
          {!isPast && (
            <div className="flex items-center gap-1">
              <button onClick={() => { if (!canUseFeature('calendarExport')) { setShowProPrompt('Kalender-Export'); return } downloadICS(event) }} className={cn('text-zinc-700 active:text-indigo-400 p-2', !canUseFeature('calendarExport') && 'opacity-40')}>
                <CalendarPlus size={13} />
                {!canUseFeature('calendarExport') && <span className="text-[9px] text-indigo-400 ml-0.5">⚡Pro</span>}
              </button>
              {onLink && (
                <button onClick={onLink} className="text-zinc-700 active:text-indigo-400 p-2">
                  <Link2 size={13} />
                </button>
              )}
              {event.createdBy === currentUser && (
                <button onClick={() => deleteEvent(group.id, event.id)} className="text-zinc-700 active:text-red-400 p-2">
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          )}
        </div>

        <div className="px-4 py-3 space-y-2">
          <div className="flex items-center gap-2 text-[12px] text-zinc-400">
            <Clock size={13} className="text-zinc-600" />
            {event.time} Uhr
          </div>
          {event.location && (
            <div className="flex items-center gap-2 text-[12px] text-zinc-400">
              <MapPin size={13} className="text-zinc-600" />
              {event.location}
            </div>
          )}
          {event.description && (
            <p className="text-[12px] text-zinc-500 leading-relaxed">{event.description}</p>
          )}

          {/* Attendees */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <Users size={13} className="text-zinc-600" />
              <div className="flex -space-x-1.5">
                {event.attendees.map((a) => <Avatar key={a} name={a} size={22} />)}
              </div>
              <span className="text-[11px] text-zinc-600">{event.attendees.length}/{group.members.length}</span>
            </div>

            {!isPast && (
              <button
                onClick={() => toggleRSVP(group.id, event.id, currentUser)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-semibold transition-colors',
                  going
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                    : 'bg-white/[0.04] text-zinc-500 border border-white/[0.08] active:bg-indigo-500/10 active:text-indigo-400'
                )}
              >
                {going ? <><Check size={12} /> Dabei</> : <><Plus size={12} /> Zusagen</>}
              </button>
            )}
          </div>

          {/* Linked items */}
          {event.linkedItems && event.linkedItems.length > 0 && (
            <div className="pt-1">
              <LinkedChips linkedItems={event.linkedItems} group={group} />
            </div>
          )}
        </div>
      </motion.div>
    )
  }

  // Calendar view helpers
  const calYear = viewMonth.getFullYear()
  const calMonth = viewMonth.getMonth()
  const grid = getMonthGrid(calYear, calMonth)

  const prevMonth = () => setViewMonth(new Date(calYear, calMonth - 1, 1))
  const nextMonth = () => setViewMonth(new Date(calYear, calMonth + 1, 1))

  const selectedEvents = selectedDate ? (eventsByDate[selectedDate] || []) : []

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Events</h3>
        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex items-center bg-[#161822] border border-white/[0.06] rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-2.5 transition-colors',
                viewMode === 'list' ? 'bg-indigo-500/20 text-indigo-400' : 'text-zinc-600'
              )}
            >
              <List size={14} />
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={cn(
                'p-2.5 transition-colors',
                viewMode === 'calendar' ? 'bg-indigo-500/20 text-indigo-400' : 'text-zinc-600'
              )}
            >
              <CalendarDays size={14} />
            </button>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="text-indigo-400 text-xs font-semibold flex items-center gap-1">
            {showForm ? <><X size={14} /> Abbrechen</> : <><Plus size={14} /> Neu</>}
          </button>
        </div>
      </div>

      {/* New event form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-5">
            <div className="bg-[#161822] border border-white/[0.06] rounded-2xl p-4 space-y-3">
              <div className="flex gap-2 flex-wrap">
                {emojiOptions.map((e) => (
                  <button key={e} onClick={() => setEmoji(e)} className={cn(
                    'text-lg p-1 rounded-lg border transition-colors',
                    emoji === e ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/[0.06] bg-[#0e1015]'
                  )}>{e}</button>
                ))}
              </div>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Event Name" autoFocus
                className="w-full px-3 py-2.5 bg-[#0e1015] border border-white/[0.08] rounded-xl text-white text-sm outline-none focus:border-indigo-500/50 placeholder:text-zinc-600" />
              <div className="flex gap-2">
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                  className="flex-1 px-3 py-2.5 bg-[#0e1015] border border-white/[0.08] rounded-xl text-zinc-400 text-sm outline-none" />
                <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
                  className="w-28 px-3 py-2.5 bg-[#0e1015] border border-white/[0.08] rounded-xl text-zinc-400 text-sm outline-none" />
              </div>
              <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="📍 Ort (optional)"
                className="w-full px-3 py-2.5 bg-[#0e1015] border border-white/[0.08] rounded-xl text-white text-sm outline-none focus:border-indigo-500/50 placeholder:text-zinc-600" />
              <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Beschreibung (optional)"
                className="w-full px-3 py-2.5 bg-[#0e1015] border border-white/[0.08] rounded-xl text-white text-sm outline-none focus:border-indigo-500/50 placeholder:text-zinc-600" />
              <div className="flex items-center justify-between">
                <p className="text-[11px] text-zinc-500">Wiederholen:</p>
                <div className="flex gap-1.5">
                  {(['none', 'weekly', 'biweekly', 'monthly'] as const).map((r) => (
                    <button key={r} onClick={() => {
                        if (r !== 'none' && !canUseFeature('recurringExpenses')) { setShowProPrompt('Wiederkehrende Events'); return }
                        setRecurrence(r)
                      }}
                      className={cn('px-2.5 py-2 rounded-lg text-[11px] font-medium transition-colors',
                        recurrence === r ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-[#0e1015] text-zinc-500 border border-white/[0.06]'
                      )}>
                      {r === 'none' ? 'Einmalig' : r === 'weekly' ? 'Wöchentl.' : r === 'biweekly' ? 'Alle 2 W.' : 'Monatlich'}
                      {r !== 'none' && !canUseFeature('recurringExpenses') && <span className="text-[9px] text-indigo-400 ml-1">⚡Pro</span>}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={handleAdd} disabled={!title.trim() || !date}
                className="w-full py-2.5 bg-indigo-500 text-white rounded-xl font-bold text-sm active:scale-[0.98] disabled:opacity-30">
                Event erstellen
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {viewMode === 'list' ? (
        <>
          {/* Upcoming */}
          {upcoming.length > 0 && (
            <div className="mb-6">
              <h4 className="text-[11px] font-bold text-emerald-400/70 uppercase tracking-widest mb-3">Anstehend</h4>
              <div className="flex flex-col gap-3">
                {upcoming.map((e) => <EventCard key={e.id} event={e} onLink={() => setLinkingEventId(e.id)} />)}
              </div>
            </div>
          )}

          {/* Past */}
          {past.length > 0 && (
            <div>
              <h4 className="text-[11px] font-bold text-zinc-600 uppercase tracking-widest mb-3">Vergangen</h4>
              <div className="flex flex-col gap-3">
                {past.map((e) => <EventCard key={e.id} event={e} isPast />)}
              </div>
            </div>
          )}

          {events.length === 0 && (
            <p className="text-zinc-600 text-sm text-center py-12">Noch keine Events geplant 📅</p>
          )}
        </>
      ) : (
        /* Calendar view */
        <div>
          {/* Month header */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="text-zinc-500 active:text-zinc-300 p-2">
              <ChevronLeft size={18} />
            </button>
            <h4 className="text-sm font-bold text-zinc-300">
              {MONTH_NAMES[calMonth]} {calYear}
            </h4>
            <button onClick={nextMonth} className="text-zinc-500 active:text-zinc-300 p-2">
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {DAY_HEADERS.map((d) => (
              <div key={d} className="text-center text-[10px] font-bold text-zinc-600 uppercase py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7">
            {grid.flat().map((day, i) => {
              if (day === null) {
                return <div key={`empty-${i}`} className="aspect-square" />
              }

              const ds = dateStr(calYear, calMonth, day)
              const hasEvents = !!eventsByDate[ds]
              const isSelected = selectedDate === ds
              const isTodayCell = ds === todayStr
              const isPastDay = ds < todayStr

              return (
                <button
                  key={ds}
                  onClick={() => setSelectedDate(isSelected ? null : ds)}
                  className={cn(
                    'aspect-square flex flex-col items-center justify-center relative text-[13px] rounded-lg transition-colors',
                    isTodayCell && !isSelected && 'bg-indigo-500/20 text-indigo-400 font-bold',
                    isSelected && 'bg-indigo-500 text-white font-bold',
                    !isTodayCell && !isSelected && (isPastDay ? 'text-zinc-600' : 'text-zinc-300'),
                    hasEvents && 'font-semibold'
                  )}
                >
                  {day}
                  {hasEvents && (
                    <span className={cn(
                      'absolute bottom-1 w-1 h-1 rounded-full',
                      isPastDay ? 'bg-zinc-500' : 'bg-indigo-400'
                    )} />
                  )}
                </button>
              )
            })}
          </div>

          {/* Selected date events */}
          {selectedDate && selectedEvents.length > 0 && (
            <div className="mt-4">
              <h4 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-3">
                {isToday(selectedDate) ? 'Heute' : formatDate(selectedDate)}
              </h4>
              <div className="flex flex-col gap-3">
                {selectedEvents.map((e) => {
                  const isPast = new Date(e.date) < new Date(new Date().toDateString())
                  return <EventCard key={e.id} event={e} isPast={isPast} />
                })}
              </div>
            </div>
          )}

          {selectedDate && selectedEvents.length === 0 && (
            <p className="text-zinc-600 text-xs text-center py-6">Keine Events an diesem Tag</p>
          )}
        </div>
      )}

      {linkingEventId && (
        <LinkPicker
          group={group}
          availableTypes={['place', 'mapPin', 'todo', 'expense']}
          selected={(group.events || []).find((e) => e.id === linkingEventId)?.linkedItems || []}
          onConfirm={(items) => { updateEvent(group.id, linkingEventId, { linkedItems: items }); setLinkingEventId(null) }}
          onClose={() => setLinkingEventId(null)}
        />
      )}

      {showProPrompt && (
        <ProPrompt feature={showProPrompt} onClose={() => setShowProPrompt(null)} />
      )}
    </div>
  )
}

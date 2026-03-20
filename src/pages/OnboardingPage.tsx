import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/stores/appStore'
import { useT } from '@/lib/i18n'
import { hapticLight } from '@/lib/haptics'
import { motion, AnimatePresence, type PanInfo } from 'framer-motion'
import { CheckSquare, Coins, MessageCircle, Lightbulb, Calendar, MapPin, Globe, BarChart3, Users } from 'lucide-react'

// ─── Interactive mini-demos for each step ─────────────────────

function PhoneMockup({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-8 mx-auto w-[200px] relative">
      <div className="bg-[#161822] rounded-[20px] border border-white/[0.08] p-2 shadow-2xl shadow-black/40">
        <div className="bg-[#0a0c12] rounded-[14px] overflow-hidden" style={{ height: 280 }}>
          {children}
        </div>
      </div>
      {/* Home indicator */}
      <div className="w-16 h-1 bg-zinc-700 rounded-full mx-auto mt-2" />
    </div>
  )
}

// Step 1 "Willkommen" — tappable groups that expand with haptic
function DemoStep1() {
  const [expanded, setExpanded] = useState<number | null>(null)
  const groups = [
    { emoji: '👥', name: 'Freundesgruppe', members: ['Anna', 'Ben', 'Clara', 'David'], tasks: 3, nextEvent: '🎳 Bowling Fr.' },
    { emoji: '🏠', name: 'WG', members: ['Anna', 'Erik', 'Mia'], tasks: 1, nextEvent: '🍝 Kochabend' },
    { emoji: '⚽', name: 'Sportteam', members: ['Ben', 'David', 'Felix', 'Gina', 'Hana'], tasks: 0, nextEvent: null },
  ]
  return (
    <PhoneMockup>
      <div className="p-3">
        <div className="flex items-center gap-2 mb-2.5">
          <div className="w-5 h-5 rounded-lg bg-indigo-500/20 flex items-center justify-center text-[8px]">✨</div>
          <span className="text-[10px] font-bold text-zinc-300">Deine Gruppen</span>
        </div>
        <div className="space-y-1.5">
          {groups.map((g, i) => (
            <motion.button key={i} whileTap={{ scale: 0.97 }}
              onClick={() => { setExpanded(expanded === i ? null : i); hapticLight() }}
              className="w-full text-left px-2.5 py-2 bg-[#161822] border border-white/[0.06] rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-sm">{g.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] font-bold text-zinc-300">{g.name}</p>
                  <p className="text-[7px] text-zinc-600">{g.members.length} Mitglieder{g.tasks > 0 ? ` · ${g.tasks} offen` : ''}</p>
                </div>
                <div className="flex -space-x-1">
                  {g.members.slice(0, 3).map((_, j) => (
                    <div key={j} className="w-3.5 h-3.5 rounded-full border border-[#0a0c12]" style={{ background: ['#E8594F', '#47B784', '#4A90D9', '#9B59B6', '#F4A236'][j] }} />
                  ))}
                </div>
              </div>
              <AnimatePresence>
                {expanded === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden">
                    <div className="pt-1.5 mt-1.5 border-t border-white/[0.04] flex gap-2">
                      {g.nextEvent && <span className="text-[7px] text-indigo-400">{g.nextEvent}</span>}
                      <span className="text-[7px] text-zinc-600">{g.members.join(', ')}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          ))}
        </div>
      </div>
    </PhoneMockup>
  )
}

// Step 2 "Gruppen erstellen" — interactive member adding
function DemoStep2() {
  const [added, setAdded] = useState<string[]>([])
  const allMembers = [
    { name: 'Anna', color: '#E8594F' },
    { name: 'Ben', color: '#47B784' },
    { name: 'Clara', color: '#4A90D9' },
    { name: 'David', color: '#9B59B6' },
    { name: 'Erik', color: '#F4A236' },
  ]
  return (
    <PhoneMockup>
      <div className="p-3">
        <p className="text-[9px] text-zinc-500 uppercase tracking-wider font-bold mb-2">Neue Gruppe</p>
        <div className="flex items-center gap-2 mb-3">
          <motion.div
            animate={{ rotate: added.length > 2 ? [0, -10, 10, 0] : 0 }}
            transition={{ duration: 0.4 }}
            className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-sm"
          >
            👥
          </motion.div>
          <div className="flex-1 px-2 py-1.5 bg-[#161822] border border-white/[0.06] rounded-lg text-[9px] text-zinc-300">Freundesgruppe</div>
        </div>
        <p className="text-[8px] text-zinc-500 mb-1.5">Tippe um Freunde hinzuzufügen:</p>
        <div className="flex flex-wrap gap-1.5">
          {allMembers.map((m) => {
            const isAdded = added.includes(m.name)
            return (
              <motion.button key={m.name} whileTap={{ scale: 0.85 }}
                layout
                onClick={() => {
                  if (isAdded) setAdded(a => a.filter(n => n !== m.name))
                  else setAdded(a => [...a, m.name])
                  hapticLight()
                }}
                className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-[9px] font-medium border transition-all ${
                  isAdded ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/25' : 'bg-[#161822] text-zinc-500 border-white/[0.06]'
                }`}>
                <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[6px] text-white font-bold" style={{ background: m.color }}>
                  {m.name[0]}
                </div>
                {m.name}
                {isAdded && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-[7px]">✓</motion.span>}
              </motion.button>
            )
          })}
        </div>
        {added.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
            className="mt-2.5 flex items-center justify-center gap-1">
            <div className="flex -space-x-1.5">
              {added.map((n) => {
                const m = allMembers.find(a => a.name === n)!
                return <div key={n} className="w-5 h-5 rounded-full border-2 border-[#0a0c12] flex items-center justify-center text-[6px] text-white font-bold" style={{ background: m.color }}>{n[0]}</div>
              })}
            </div>
            <span className="text-[8px] text-zinc-400 ml-1">{added.length} ausgewählt</span>
          </motion.div>
        )}
        <motion.div
          animate={{ opacity: added.length >= 2 ? 1 : 0.3 }}
          className="mt-2 py-1.5 bg-indigo-500 rounded-lg text-center text-[9px] text-white font-bold"
        >
          Gruppe erstellen
        </motion.div>
      </div>
    </PhoneMockup>
  )
}

// Step 3 "Alles an einem Ort" — interactive tabs with tappable content
function DemoStep3() {
  const [tab, setTab] = useState(0)
  const [checked, setChecked] = useState([true, false, false])
  const [voted, setVoted] = useState([2, 1, 0])

  const todoItems = ['Geschenk besorgen', 'Restaurant reservieren', 'Playlist erstellen']
  const expenseItems = [
    { emoji: '🍽️', title: 'Abendessen', amount: '€48,50' },
    { emoji: '🎬', title: 'Kino', amount: '€32,00' },
    { emoji: '🚕', title: 'Taxi', amount: '€18,90' },
  ]
  const voteItems = ['🎳 Bowling', '🍷 Weinabend', '🎮 Spieleabend']

  return (
    <PhoneMockup>
      <div className="flex flex-col h-full">
        <div className="flex-1 p-2.5 overflow-hidden">
          <AnimatePresence mode="wait">
            {tab === 0 && (
              <motion.div key="todos" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="space-y-1">
                {todoItems.map((item, i) => (
                  <motion.button key={i} whileTap={{ scale: 0.95 }}
                    onClick={() => { setChecked(c => { const n = [...c]; n[i] = !n[i]; return n }); hapticLight() }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 bg-[#161822] border border-white/[0.06] rounded-lg text-left">
                    <div className={`w-3 h-3 rounded border transition-all flex items-center justify-center ${checked[i] ? 'bg-emerald-500 border-emerald-500' : 'border-zinc-600'}`}>
                      {checked[i] && <CheckSquare size={7} className="text-white" />}
                    </div>
                    <span className={`text-[8px] flex-1 ${checked[i] ? 'line-through text-zinc-600' : 'text-zinc-300'}`}>{item}</span>
                  </motion.button>
                ))}
                <p className="text-[7px] text-emerald-400 text-center mt-1">{checked.filter(Boolean).length}/{todoItems.length} erledigt</p>
              </motion.div>
            )}
            {tab === 1 && (
              <motion.div key="costs" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="space-y-1">
                {expenseItems.map((e, i) => (
                  <div key={i} className="flex items-center gap-2 px-2 py-1.5 bg-[#161822] border border-white/[0.06] rounded-lg">
                    <span className="text-xs">{e.emoji}</span>
                    <span className="text-[8px] text-zinc-300 flex-1">{e.title}</span>
                    <span className="text-[8px] text-zinc-400 font-bold">{e.amount}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between mt-1 px-1">
                  <span className="text-[7px] text-zinc-500">Gesamt</span>
                  <span className="text-[9px] text-indigo-400 font-bold">€99,40</span>
                </div>
              </motion.div>
            )}
            {tab === 2 && (
              <motion.div key="votes" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="space-y-1">
                {voteItems.map((item, i) => {
                  const max = Math.max(...voted, 1)
                  return (
                    <motion.button key={i} whileTap={{ scale: 0.97 }}
                      onClick={() => { setVoted(v => { const n = [...v]; n[i]++; return n }); hapticLight() }}
                      className="w-full relative overflow-hidden bg-[#161822] border border-white/[0.06] rounded-lg text-left">
                      <div className="absolute inset-y-0 left-0 bg-indigo-500/10 transition-all duration-300" style={{ width: `${(voted[i] / max) * 100}%` }} />
                      <div className="relative flex items-center justify-between px-2 py-1.5">
                        <span className="text-[8px] text-zinc-300">{item}</span>
                        <span className="text-[8px] text-indigo-400 font-bold">{voted[i]}</span>
                      </div>
                    </motion.button>
                  )
                })}
                <p className="text-[7px] text-zinc-600 text-center mt-1">Tippe zum Abstimmen</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="flex border-t border-white/[0.06]">
          {[
            { icon: CheckSquare, label: 'Tasks', color: '#34d399' },
            { icon: Coins, label: 'Kosten', color: '#fbbf24' },
            { icon: Lightbulb, label: 'Voting', color: '#818cf8' },
          ].map((t, i) => (
            <button key={i} onClick={() => { setTab(i); hapticLight() }}
              className="flex-1 flex flex-col items-center gap-0.5 py-2 transition-colors"
              style={{ color: tab === i ? t.color : '#52525b' }}>
              <t.icon size={13} />
              <span className="text-[7px] font-medium">{t.label}</span>
            </button>
          ))}
        </div>
      </div>
    </PhoneMockup>
  )
}

// ─── Feature pills for the overview ───────────────────────────

const ALL_FEATURES = [
  { icon: CheckSquare, label: 'Aufgaben', color: '#34d399' },
  { icon: Coins, label: 'Kosten', color: '#fbbf24' },
  { icon: MessageCircle, label: 'Chat', color: '#818cf8' },
  { icon: Lightbulb, label: 'Ideen', color: '#f472b6' },
  { icon: Calendar, label: 'Events', color: '#38bdf8' },
  { icon: MapPin, label: 'Orte', color: '#fb923c' },
  { icon: Globe, label: 'Weltkarte', color: '#a78bfa' },
  { icon: BarChart3, label: 'Stats', color: '#f87171' },
  { icon: Users, label: 'Gruppen', color: '#2dd4bf' },
]

// ─── Main Component ───────────────────────────────────────────

export function OnboardingPage({ onFinish }: { onFinish?: () => void }) {
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const navigate = useNavigate()
  const { setOnboarded, setDemoMode, loadDemoData } = useAppStore()
  const t = useT()

  const steps = [
    {
      title: t('onboard.welcome'),
      sub: t('onboard.welcome_sub'),
      color: 'rgba(79,70,229,0.15)',
      demo: <DemoStep1 />,
    },
    {
      title: t('onboard.groups'),
      sub: t('onboard.groups_sub'),
      color: 'rgba(5,150,105,0.15)',
      demo: <DemoStep2 />,
    },
    {
      title: t('onboard.features'),
      sub: t('onboard.features_sub'),
      color: 'rgba(124,58,237,0.15)',
      demo: <DemoStep3 />,
    },
  ]

  const goTo = (next: number) => {
    if (next < 0 || next > 3) return
    setDirection(next > step ? 1 : -1)
    setStep(next)
    hapticLight()
  }

  const handleDrag = (_: unknown, info: PanInfo) => {
    if (Math.abs(info.offset.x) < 50) return
    if (info.offset.x < 0 && step < 3) goTo(step + 1)
    if (info.offset.x > 0 && step > 0) goTo(step - 1)
  }

  const finishOnboarding = () => {
    if (onFinish) {
      onFinish()
    } else {
      setOnboarded(true)
      navigate('/')
    }
  }

  const startWithDemo = () => {
    setDemoMode(true)
    loadDemoData()
    navigate('/')
  }

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 200 : -200, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -200 : 200, opacity: 0 }),
  }

  return (
    <div className="flex flex-col h-full pb-safe bg-[#0a0c12] relative">
      {/* Gradient — covers entire screen */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-700 ease-out"
        style={{
          background: step < 3
            ? `radial-gradient(ellipse at 50% 30%, ${steps[step].color}, transparent 70%)`
            : 'radial-gradient(ellipse at 50% 30%, rgba(79,70,229,0.1), transparent 70%)',
        }}
      />

      {/* Skip */}
      {step < 3 && (
        <div className="shrink-0 flex justify-end px-5 relative z-10" style={{ paddingTop: `max(12px, var(--safe-top, 0px))` }}>
          <button onClick={startWithDemo} className="text-[13px] text-zinc-500 active:text-zinc-300 px-3 py-2">
            {t('onboard.demo')}
          </button>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex items-center justify-center overflow-hidden relative">

        <AnimatePresence mode="wait" custom={direction}>
          {/* Steps 0-2: Interactive demos */}
          {step < 3 && (
            <motion.div
              key={step}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.15}
              onDragEnd={handleDrag}
              className="text-center w-full px-8 cursor-grab active:cursor-grabbing"
            >
              <h2 className="text-[24px] font-extrabold tracking-tight leading-tight">
                {steps[step].title}
              </h2>
              <p className="text-zinc-400 mt-2 text-[14px] leading-relaxed max-w-[280px] mx-auto">
                {steps[step].sub}
              </p>
              {steps[step].demo}
            </motion.div>
          )}

          {/* Step 3: Feature overview */}
          {step === 3 && (
            <motion.div
              key="features"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.15}
              onDragEnd={handleDrag}
              className="text-center w-full px-8 cursor-grab active:cursor-grabbing"
            >
              <h2 className="text-[24px] font-extrabold tracking-tight">Alles drin.</h2>
              <p className="text-zinc-400 mt-2 text-[14px] mb-6">Eine App für alles was deine Crew braucht.</p>

              <div className="flex flex-wrap justify-center gap-2 max-w-[300px] mx-auto">
                {ALL_FEATURES.map((f, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 + i * 0.06, type: 'spring', damping: 12 }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border"
                    style={{ backgroundColor: `${f.color}10`, borderColor: `${f.color}20` }}
                  >
                    <f.icon size={14} style={{ color: f.color }} />
                    <span className="text-[11px] font-semibold" style={{ color: f.color }}>{f.label}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Bottom: button + dots */}
      <div className="shrink-0 px-8 pb-6">
        <motion.button
          onClick={() => step === 3 ? finishOnboarding() : goTo(step + 1)}
          whileTap={{ scale: 0.95 }}
          className="w-full py-4 bg-indigo-500 text-white rounded-2xl font-bold text-[15px] mb-4"
        >
          {step === 3 ? t('onboard.start') : t('onboard.next')}
        </motion.button>

        <div className="flex gap-2 justify-center">
          {[0, 1, 2, 3].map((i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: i === step ? 28 : 8,
                background: i === step ? '#6366f1' : i < step ? '#6366f180' : '#27293a',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

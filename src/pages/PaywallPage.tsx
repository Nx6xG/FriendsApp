import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Zap, Users, Globe, Repeat, Calculator, Calendar, ListChecks, Star } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAppStore } from '@/stores/appStore'
import { supabase } from '@/lib/supabase'
import { PRO_PRICE, useIsPro } from '@/lib/plans'
import { cn } from '@/lib/utils'

const FEATURES = [
  { icon: Users, label: 'Unlimitierte Gruppen & Mitglieder', free: '2 Gruppen, 5 Mitglieder', pro: 'Unbegrenzt' },
  { icon: Globe, label: 'GPS Live-Standort', free: '—', pro: '✓' },
  { icon: Calculator, label: 'Individueller Kosten-Split', free: '—', pro: '✓' },
  { icon: Repeat, label: 'Wiederkehrende Ausgaben & Events', free: '—', pro: '✓' },
  { icon: Calendar, label: 'Kalender-Export', free: '—', pro: '✓' },
  { icon: ListChecks, label: 'Bucket List', free: '—', pro: '✓' },
  { icon: Star, label: 'Unbegrenzte Karten-Pins', free: '10 Pins', pro: 'Unbegrenzt' },
]

export function PaywallPage() {
  const navigate = useNavigate()
  const lang = useAppStore((s) => s.profile.language)
  const isPro = useIsPro()

  // Re-check plan when user returns from checkout (tab becomes visible again)
  useEffect(() => {
    const handleVisibility = async () => {
      if (document.visibilityState === 'visible') {
        const { data } = await supabase.auth.getUser()
        if (data.user) {
          const { fetchProfile } = await import('@/lib/supabaseData')
          const profile = await fetchProfile(data.user.id)
          if (profile?.plan) {
            useAppStore.getState().updateProfile({ plan: profile.plan })
          }
        }
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  const [billing, setBilling] = useState<'monthly' | 'yearly'>('yearly')

  const price = billing === 'monthly' ? PRO_PRICE.monthly : PRO_PRICE.yearly
  const monthlyEquiv = billing === 'yearly' ? (PRO_PRICE.yearly / 12).toFixed(2) : PRO_PRICE.monthly.toFixed(2)

  const [userEmail, setUserEmail] = useState('')
  const [userId, setUserId] = useState('')

  // Get user data for checkout
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserEmail(data.user.email || '')
        setUserId(data.user.id || '')
      }
    })
  }, [])

  // TODO: Replace with your actual Lemonsqueezy variant IDs
  // Monthly and yearly should be separate variants in your Lemonsqueezy product
  const CHECKOUT_IDS = {
    monthly: 'cf5db47c-2db5-4d6d-a144-d21cc4d212aa',
    yearly: 'cf5db47c-2db5-4d6d-a144-d21cc4d212aa', // Replace with yearly variant ID when created
  }

  const checkoutUrl = userId
    ? `https://friendsapp.lemonsqueezy.com/checkout/buy/${CHECKOUT_IDS[billing]}?checkout[email]=${encodeURIComponent(userEmail)}&checkout[custom][user_id]=${userId}`
    : null

  const planExpiresAt = useAppStore((s) => s.profile.planExpiresAt)

  if (isPro) {
    return (
      <div className="h-full flex flex-col bg-[#0a0c12]">
        <header className="shrink-0 z-20 border-b border-white/[0.06] bg-[#0e1015]">
          <div className="safe-top" />
          <div className="flex items-center gap-3 px-4 h-[44px] sm:h-[52px]">
            <button onClick={() => navigate(-1)} className="text-zinc-400 active:text-white -ml-1 p-2">
              <ChevronLeft size={22} />
            </button>
            <h1 className="text-[16px] font-bold flex-1">Friends Pro</h1>
          </div>
        </header>
        <div className="flex-1 min-h-0 overflow-y-auto">
          {/* Hero */}
          <div className="pt-10 pb-6 text-center">
            <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 12 }}
              className="text-6xl mb-4">⚡</motion.div>
            <h2 className="text-[26px] font-extrabold tracking-tight">
              {lang === 'de' ? 'Du bist Pro!' : 'You\'re Pro!'}
            </h2>
            <p className="text-zinc-400 mt-2 text-[14px]">
              {lang === 'de' ? 'Danke für deinen Support!' : 'Thanks for your support!'}
            </p>
            {planExpiresAt && (
              <p className="text-amber-400/80 text-[12px] mt-2">
                {lang === 'de'
                  ? `Gekündigt — aktiv bis ${new Date(planExpiresAt).toLocaleDateString('de-AT')}`
                  : `Cancelled — active until ${new Date(planExpiresAt).toLocaleDateString('en-US')}`}
              </p>
            )}
          </div>

          {/* Active features */}
          <div className="px-6 mb-6">
            <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-3">
              {lang === 'de' ? 'Deine Pro-Features' : 'Your Pro features'}
            </h3>
            <div className="bg-[#161822] border border-white/[0.06] rounded-2xl overflow-hidden divide-y divide-white/[0.04]">
              {FEATURES.map((f, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 px-4 py-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <f.icon size={15} className="text-emerald-400" />
                  </div>
                  <p className="text-[13px] font-medium flex-1">{f.label}</p>
                  <span className="text-[11px] text-emerald-400 font-semibold">{f.pro}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Manage */}
          <div className="px-6 pb-8 pb-safe">
            <button onClick={() => window.open('https://app.lemonsqueezy.com/my-orders', '_blank')}
              className="w-full py-3.5 border border-white/[0.08] rounded-2xl text-[14px] font-medium text-zinc-400 active:bg-white/[0.02] transition-colors">
              {lang === 'de' ? 'Abo verwalten' : 'Manage subscription'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-[#0a0c12]">
      <header className="shrink-0 z-20 border-b border-white/[0.06] bg-[#0e1015]">
        <div className="safe-top" />
        <div className="flex items-center gap-3 px-4 h-[44px] sm:h-[52px]">
          <button onClick={() => navigate(-1)} className="text-zinc-400 active:text-white -ml-1 p-2">
            <ChevronLeft size={22} />
          </button>
          <h1 className="text-[16px] font-bold flex-1">Friends Pro</h1>
        </div>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto">
        {/* Hero */}
        <div className="px-6 pt-6 pb-4 text-center">
          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 12 }}
            className="text-5xl mb-3">⚡</motion.div>
          <h2 className="text-[24px] font-extrabold tracking-tight">
            {lang === 'de' ? 'Upgrade auf Pro' : 'Upgrade to Pro'}
          </h2>
          <p className="text-zinc-400 mt-2 text-[14px] max-w-[280px] mx-auto">
            {lang === 'de'
              ? 'Schalte alle Features frei und nutze Friends ohne Limits.'
              : 'Unlock all features and use Friends without limits.'}
          </p>
        </div>

        {/* Billing toggle */}
        <div className="px-6 mb-5">
          <div className="flex bg-[#161822] border border-white/[0.06] rounded-xl p-1 gap-1">
            <button onClick={() => setBilling('monthly')}
              className={cn('flex-1 py-3 rounded-lg text-[13px] font-semibold transition-colors text-center',
                billing === 'monthly' ? 'bg-indigo-500/15 text-indigo-300' : 'text-zinc-500'
              )}>
              {lang === 'de' ? 'Monatlich' : 'Monthly'}
              <span className="block text-[10px] font-normal mt-0.5 opacity-70">€2,99/{lang === 'de' ? 'Mo' : 'mo'}</span>
            </button>
            <button onClick={() => setBilling('yearly')}
              className={cn('flex-1 py-3 rounded-lg text-[13px] font-semibold transition-colors text-center relative',
                billing === 'yearly' ? 'bg-indigo-500/15 text-indigo-300' : 'text-zinc-500'
              )}>
              <span className="absolute -top-2 right-2 bg-emerald-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                -30% · 3 {lang === 'de' ? 'Tage gratis' : 'days free'}
              </span>
              {lang === 'de' ? 'Jährlich' : 'Yearly'}
              <span className="block text-[10px] font-normal mt-0.5 opacity-70">€24,99/{lang === 'de' ? 'Jahr' : 'yr'}</span>
            </button>
          </div>
        </div>

        {/* Price */}
        <div className="px-6 mb-6 text-center">
          <div className="bg-gradient-to-br from-indigo-600/20 to-violet-600/10 border border-indigo-500/20 rounded-2xl p-5">
            <p className="text-4xl font-extrabold tracking-tight">
              €{price.toFixed(2)}
              <span className="text-[16px] font-medium text-zinc-400">
                /{billing === 'monthly' ? (lang === 'de' ? 'Monat' : 'month') : (lang === 'de' ? 'Jahr' : 'year')}
              </span>
            </p>
            {billing === 'yearly' && (
              <>
                <p className="text-[13px] text-indigo-400 mt-1">
                  = €{monthlyEquiv}/{lang === 'de' ? 'Monat' : 'month'}
                </p>
                <p className="text-[12px] text-emerald-400 mt-1.5 font-medium">
                  🎁 {lang === 'de' ? '3 Tage kostenlos testen' : '3-day free trial'}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Feature comparison */}
        <div className="px-6 mb-6">
          <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-3">
            {lang === 'de' ? 'Was du bekommst' : 'What you get'}
          </h3>
          <div className="bg-[#161822] border border-white/[0.06] rounded-2xl overflow-hidden divide-y divide-white/[0.04]">
            {FEATURES.map((f, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
                  <f.icon size={15} className="text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium">{f.label}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] text-zinc-600 line-through">{f.free}</p>
                  <p className="text-[11px] text-emerald-400 font-semibold">{f.pro}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="px-6 pb-8 pb-safe">
          <a href={checkoutUrl || '#'} target="_blank" rel="noopener noreferrer"
            className="w-full py-4 bg-indigo-500 text-white rounded-2xl font-bold text-[15px] active:scale-95 transition-all flex items-center justify-center gap-2 block text-center">
            <Zap size={18} />
            {billing === 'yearly'
              ? (lang === 'de' ? 'Kostenlos testen' : 'Start free trial')
              : (lang === 'de' ? 'Jetzt upgraden' : 'Upgrade now')}
          </a>
          <p className="text-[10px] text-zinc-600 text-center mt-3">
            {billing === 'yearly'
              ? (lang === 'de'
                  ? '3 Tage kostenlos, dann €24,99/Jahr. Jederzeit kündbar.'
                  : '3 days free, then €24.99/year. Cancel anytime.')
              : (lang === 'de'
                  ? 'Jederzeit kündbar. Sichere Zahlung über Lemonsqueezy.'
                  : 'Cancel anytime. Secure payment via Lemonsqueezy.')}
          </p>
        </div>
      </div>
    </div>
  )
}

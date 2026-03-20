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
  const savings = billing === 'yearly' ? Math.round((1 - PRO_PRICE.yearly / (PRO_PRICE.monthly * 12)) * 100) : 0

  const handleSubscribe = async () => {
    // Get user email to prefill checkout
    const { data } = await supabase.auth.getUser()
    const email = data.user?.email || ''
    const userId = data.user?.id || ''

    // Lemonsqueezy checkout with user data
    const checkoutUrl = `https://friendsapp.lemonsqueezy.com/checkout/buy/cf5db47c-2db5-4d6d-a144-d21cc4d212aa?checkout[email]=${encodeURIComponent(email)}&checkout[custom][user_id]=${userId}`
    window.open(checkoutUrl, '_blank')
  }

  if (isPro) {
    return (
      <div className="h-full flex flex-col bg-[#0a0c12]">
        <header className="shrink-0 z-20 border-b border-white/[0.06] bg-[#0e1015]">
          <div className="safe-top" />
          <div className="flex items-center gap-3 px-4" style={{ height: 44 }}>
            <button onClick={() => navigate(-1)} className="text-zinc-400 active:text-white -ml-1 p-2">
              <ChevronLeft size={22} />
            </button>
            <h1 className="text-[16px] font-bold flex-1">Friends Pro</h1>
          </div>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="text-5xl mb-4">⭐</div>
          <h2 className="text-[22px] font-extrabold">{lang === 'de' ? 'Du bist Pro!' : 'You\'re Pro!'}</h2>
          <p className="text-zinc-400 mt-2 text-[14px]">
            {lang === 'de' ? 'Alle Features sind freigeschaltet.' : 'All features are unlocked.'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-[#0a0c12]">
      <header className="shrink-0 z-20 border-b border-white/[0.06] bg-[#0e1015]">
        <div className="safe-top" />
        <div className="flex items-center gap-3 px-4" style={{ height: 44 }}>
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
          <div className="flex bg-[#161822] border border-white/[0.06] rounded-xl p-1">
            <button onClick={() => setBilling('monthly')}
              className={cn('flex-1 py-3 rounded-lg text-[13px] font-semibold transition-colors',
                billing === 'monthly' ? 'bg-indigo-500/15 text-indigo-300' : 'text-zinc-500'
              )}>
              {lang === 'de' ? 'Monatlich' : 'Monthly'}
            </button>
            <button onClick={() => setBilling('yearly')}
              className={cn('flex-1 py-3 rounded-lg text-[13px] font-semibold transition-colors relative',
                billing === 'yearly' ? 'bg-indigo-500/15 text-indigo-300' : 'text-zinc-500'
              )}>
              {lang === 'de' ? 'Jährlich' : 'Yearly'}
              {savings > 0 && (
                <span className="absolute -top-2 -right-1 bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                  -{savings}%
                </span>
              )}
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
              <p className="text-[13px] text-indigo-400 mt-1">
                = €{monthlyEquiv}/{lang === 'de' ? 'Monat' : 'month'}
              </p>
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
          <button onClick={handleSubscribe}
            className="w-full py-4 bg-indigo-500 text-white rounded-2xl font-bold text-[15px] active:scale-95 transition-all flex items-center justify-center gap-2">
            <Zap size={18} />
            {lang === 'de' ? 'Jetzt upgraden' : 'Upgrade now'}
          </button>
          <p className="text-[10px] text-zinc-600 text-center mt-3">
            {lang === 'de'
              ? 'Jederzeit kündbar. Sichere Zahlung über Lemonsqueezy.'
              : 'Cancel anytime. Secure payment via Lemonsqueezy.'}
          </p>
        </div>
      </div>
    </div>
  )
}

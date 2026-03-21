import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Zap, Users, Globe, Repeat, Calculator, Calendar, ListChecks, Star } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAppStore } from '@/stores/appStore'
import { supabase } from '@/lib/supabase'
import { PRO_PRICE, useIsPro } from '@/lib/plans'
import { cn } from '@/lib/utils'
import { useT } from '@/lib/i18n'

const PRO_FEATURES = [
  { icon: Users, labelKey: 'paywall.feat_groups', free: { de: '2 Gruppen, 5 Mitglieder', en: '2 groups, 5 members' }, pro: { de: 'Unbegrenzt', en: 'Unlimited' } },
  { icon: Globe, labelKey: 'paywall.feat_gps', free: '—', pro: '✓' },
  { icon: Calculator, labelKey: 'paywall.feat_split', free: '—', pro: '✓' },
  { icon: Repeat, labelKey: 'paywall.feat_recurring', free: '—', pro: '✓' },
  { icon: Calendar, labelKey: 'paywall.feat_calendar', free: '—', pro: '✓' },
  { icon: ListChecks, labelKey: 'paywall.feat_bucket', free: '—', pro: '✓' },
  { icon: Star, labelKey: 'paywall.feat_pins', free: { de: '10 Pins', en: '10 Pins' }, pro: { de: 'Unbegrenzt', en: 'Unlimited' } },
]

export function PaywallPage() {
  const navigate = useNavigate()
  const t = useT()
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
              {t('paywall.you_are_pro')}
            </h2>
            <p className="text-zinc-400 mt-2 text-[14px]">
              {t('paywall.thanks')}
            </p>
            {planExpiresAt && (
              <p className="text-amber-400/80 text-[12px] mt-2">
                {`${t('profile.pro_cancelled')} ${new Date(planExpiresAt).toLocaleDateString(lang === 'de' ? 'de-AT' : 'en-US')}`}
              </p>
            )}
          </div>

          {/* Active features */}
          <div className="px-6 mb-6">
            <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-3">
              {t('paywall.your_features')}
            </h3>
            <div className="bg-[#161822] border border-white/[0.06] rounded-2xl overflow-hidden divide-y divide-white/[0.04]">
              {PRO_FEATURES.map((f, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 px-4 py-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <f.icon size={15} className="text-emerald-400" />
                  </div>
                  <p className="text-[13px] font-medium flex-1">{t(f.labelKey)}</p>
                  <span className="text-[11px] text-emerald-400 font-semibold">{typeof f.pro === 'object' ? f.pro[lang] : f.pro}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Manage */}
          <div className="px-6 pb-8 pb-safe">
            <button onClick={() => window.open('https://app.lemonsqueezy.com/my-orders', '_blank')}
              className="w-full py-3.5 border border-white/[0.08] rounded-2xl text-[14px] font-medium text-zinc-400 active:bg-white/[0.02] transition-colors">
              {t('paywall.manage_sub')}
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
            {t('paywall.upgrade_title')}
          </h2>
          <p className="text-zinc-400 mt-2 text-[14px] max-w-[280px] mx-auto">
            {t('paywall.upgrade_desc')}
          </p>
        </div>

        {/* Billing toggle */}
        <div className="px-6 mb-5">
          <div className="flex bg-[#161822] border border-white/[0.06] rounded-xl p-1 gap-1">
            <button onClick={() => setBilling('monthly')}
              className={cn('flex-1 py-3 rounded-lg text-[13px] font-semibold transition-colors text-center',
                billing === 'monthly' ? 'bg-indigo-500/15 text-indigo-300' : 'text-zinc-500'
              )}>
              {t('paywall.monthly')}
              <span className="block text-[10px] font-normal mt-0.5 opacity-70">€2,99{t('paywall.per_month')}</span>
            </button>
            <button onClick={() => setBilling('yearly')}
              className={cn('flex-1 py-3 rounded-lg text-[13px] font-semibold transition-colors text-center relative',
                billing === 'yearly' ? 'bg-indigo-500/15 text-indigo-300' : 'text-zinc-500'
              )}>
              <span className="absolute -top-2 right-2 bg-emerald-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                -30% · 3 {t('paywall.days_free')}
              </span>
              {t('paywall.yearly')}
              <span className="block text-[10px] font-normal mt-0.5 opacity-70">€24,99{t('paywall.per_year')}</span>
            </button>
          </div>
        </div>

        {/* Price */}
        <div className="px-6 mb-6 text-center">
          <div className="bg-gradient-to-br from-indigo-600/20 to-violet-600/10 border border-indigo-500/20 rounded-2xl p-5">
            <p className="text-4xl font-extrabold tracking-tight">
              €{price.toFixed(2)}
              <span className="text-[16px] font-medium text-zinc-400">
                {billing === 'monthly' ? t('paywall.per_month') : t('paywall.per_year')}
              </span>
            </p>
            {billing === 'yearly' && (
              <>
                <p className="text-[13px] text-indigo-400 mt-1">
                  = €{monthlyEquiv}{t('paywall.per_month')}
                </p>
                <p className="text-[12px] text-emerald-400 mt-1.5 font-medium">
                  🎁 {t('profile.try_free')}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Feature comparison */}
        <div className="px-6 mb-6">
          <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-3">
            {t('paywall.what_you_get')}
          </h3>
          <div className="bg-[#161822] border border-white/[0.06] rounded-2xl overflow-hidden divide-y divide-white/[0.04]">
            {PRO_FEATURES.map((f, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
                  <f.icon size={15} className="text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium">{t(f.labelKey)}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] text-zinc-600 line-through">{typeof f.free === 'object' ? f.free[lang] : f.free}</p>
                  <p className="text-[11px] text-emerald-400 font-semibold">{typeof f.pro === 'object' ? f.pro[lang] : f.pro}</p>
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
              ? t('paywall.start_trial')
              : t('paywall.upgrade_now')}
          </a>
          <p className="text-[10px] text-zinc-600 text-center mt-3">
            {billing === 'yearly'
              ? t('paywall.yearly_terms')
              : t('paywall.monthly_terms')}
          </p>
        </div>
      </div>
    </div>
  )
}

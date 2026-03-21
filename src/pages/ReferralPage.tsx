import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { useT } from '@/lib/i18n'

export function ReferralPage() {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const t = useT()
  const [referrer, setReferrer] = useState<{ name: string; emoji: string } | null>(null)
  const [invalid, setInvalid] = useState(false)

  useEffect(() => {
    let cancelled = false
    if (!code) { Promise.resolve().then(() => { if (!cancelled) setInvalid(true) }); return () => { cancelled = true } }
    const load = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('name, emoji')
        .eq('referral_code', code)
        .single()
      if (cancelled) return
      if (data) {
        setReferrer(data)
        localStorage.setItem('pendingReferralCode', code)
      } else {
        setInvalid(true)
      }
    }
    load()
    return () => { cancelled = true }
  }, [code])

  if (invalid) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#0a0c12] text-zinc-100 p-8 text-center">
        <span className="text-5xl mb-4">🔗</span>
        <h1 className="text-xl font-bold mb-2">{t('referral.invalid')}</h1>
        <button onClick={() => navigate('/')}
          className="mt-6 px-6 py-3 bg-indigo-500 text-white rounded-2xl font-bold text-sm">
          Home
        </button>
      </div>
    )
  }

  if (!referrer) {
    return <div className="flex items-center justify-center h-full bg-[#0a0c12]">
      <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  }

  return (
    <div className="flex flex-col items-center justify-center h-full bg-[#0a0c12] text-zinc-100 p-8 text-center">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <div className="w-20 h-20 rounded-3xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center text-4xl mx-auto mb-4">
          {referrer.emoji}
        </div>
        <h1 className="text-2xl font-extrabold mb-1">{referrer.name}</h1>
        <p className="text-zinc-400 text-sm">{t('referral.welcome')}</p>
        <div className="mt-8 bg-[#161822] border border-white/[0.06] rounded-2xl p-5">
          <p className="text-3xl mb-2">👋</p>
          <p className="text-[15px] font-bold mb-1">Friends App</p>
          <p className="text-[13px] text-zinc-400">Die App für deine Crew</p>
        </div>
        <button onClick={() => navigate('/')}
          className="mt-6 w-full py-4 bg-indigo-500 text-white rounded-2xl font-bold text-[15px] active:scale-95 transition-all">
          {t('referral.signup_cta')}
        </button>
      </motion.div>
    </div>
  )
}

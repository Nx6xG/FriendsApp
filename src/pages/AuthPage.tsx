import { useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { hapticLight } from '@/lib/haptics'
import { useT } from '@/lib/i18n'

export function AuthPage() {
  const t = useT()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [confirmEmail, setConfirmEmail] = useState(false)
  const handleLogin = async () => {
    if (!email.trim() || !password) return
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (error) {
      setError(error.message === 'Invalid login credentials'
        ? t('auth.wrong_credentials')
        : error.message)
    }
    setLoading(false)
  }

  const handleSignup = async () => {
    if (!email.trim() || !password || !name.trim()) return
    if (password.length < 6) {
      setError(t('auth.password_min'))
      return
    }
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { name: name.trim() },
      },
    })

    if (error) {
      setError(error.message)
    } else {
      setConfirmEmail(true)
    }
    setLoading(false)
  }

  const handleSubmit = () => {
    hapticLight()
    if (mode === 'login') handleLogin()
    else handleSignup()
  }

  return (
    <div className="flex flex-col h-full pt-safe pb-safe items-center justify-center px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[320px]"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">👥</div>
          <h1 className="text-[28px] font-extrabold tracking-tight">Friends</h1>
          <p className="text-zinc-500 text-[14px] mt-1">{t('auth.tagline')}</p>
        </div>

        {/* Email confirmation message */}
        {confirmEmail && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 mb-6 text-center">
            <span className="text-2xl">📧</span>
            <p className="text-[14px] font-bold text-emerald-400 mt-2">{t('auth.confirm_sent')}</p>
            <p className="text-[12px] text-zinc-400 mt-1">
              {t('auth.check_email')} ({email})
            </p>
            <button onClick={() => { setConfirmEmail(false); setMode('login') }}
              className="mt-3 text-[12px] text-indigo-400 font-semibold active:text-indigo-300">
              {t('auth.back_to_login')}
            </button>
          </div>
        )}

        {/* Mode toggle */}
        <div className="flex bg-[#161822] border border-white/[0.06] rounded-xl p-1 mb-6">
          <button onClick={() => { setMode('login'); setError('') }}
            className={`flex-1 py-2.5 rounded-lg text-[13px] font-semibold transition-colors ${
              mode === 'login' ? 'bg-indigo-500/15 text-indigo-300' : 'text-zinc-500'
            }`}>
            {t('auth.login')}
          </button>
          <button onClick={() => { setMode('signup'); setError('') }}
            className={`flex-1 py-2.5 rounded-lg text-[13px] font-semibold transition-colors ${
              mode === 'signup' ? 'bg-indigo-500/15 text-indigo-300' : 'text-zinc-500'
            }`}>
            {t('auth.signup')}
          </button>
        </div>

        {/* Name (signup only) */}
        {mode === 'signup' && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('auth.name')}
              className="w-full px-4 py-3.5 bg-[#161822] border border-white/[0.08] rounded-xl text-white text-[15px] outline-none focus:border-indigo-500/50 placeholder:text-zinc-600 mb-3"
            />
          </motion.div>
        )}

        {/* Email */}
        <input
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError('') }}
          placeholder={t('auth.email')}
          type="email"
          autoCapitalize="off"
          className="w-full px-4 py-3.5 bg-[#161822] border border-white/[0.08] rounded-xl text-white text-[15px] outline-none focus:border-indigo-500/50 placeholder:text-zinc-600 mb-3"
        />

        {/* Password */}
        <input
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError('') }}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder={t('auth.password')}
          type="password"
          className="w-full px-4 py-3.5 bg-[#161822] border border-white/[0.08] rounded-xl text-white text-[15px] outline-none focus:border-indigo-500/50 placeholder:text-zinc-600 mb-4"
        />

        {/* Error */}
        {error && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-red-400 text-[13px] text-center mb-3">
            {error}
          </motion.p>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading || !email.trim() || !password || (mode === 'signup' && !name.trim())}
          className="w-full py-4 bg-indigo-500 text-white rounded-2xl font-bold text-[15px] active:scale-95 transition-all disabled:opacity-40"
        >
          {loading ? '...' : mode === 'login' ? t('auth.login') : t('auth.signup')}
        </button>
      </motion.div>
    </div>
  )
}

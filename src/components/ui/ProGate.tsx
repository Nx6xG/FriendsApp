import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'
import { useIsPro } from '@/lib/plans'
import { useT } from '@/lib/i18n'

/**
 * Wraps a feature that requires Pro. If the user is free, shows a prompt.
 * Usage: <ProGate feature="GPS Live-Standort"><ActualComponent /></ProGate>
 * Or use the hook: const { gate, prompt } = useProGate()
 */
export function ProGate({ feature, children }: { feature: string; children: React.ReactNode }) {
  const isPro = useIsPro()
  const [showPrompt, setShowPrompt] = useState(false)

  if (isPro) return <>{children}</>

  return (
    <>
      <div onClick={() => setShowPrompt(true)}>{children}</div>
      {showPrompt && <ProPrompt feature={feature} onClose={() => setShowPrompt(false)} />}
    </>
  )
}

export function ProPrompt({ feature, onClose }: { feature: string; onClose: () => void }) {
  const navigate = useNavigate()
  const t = useT()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-8" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="relative bg-[#1a1d2a] border border-white/[0.08] rounded-2xl p-5 w-full max-w-[320px] text-center">
        <div className="text-3xl mb-2">⚡</div>
        <p className="text-[16px] font-bold">Friends Pro</p>
        <p className="text-[13px] text-zinc-500 mt-2">
          "{feature}" {t('pro.gate_message')}
        </p>
        <div className="flex gap-2 mt-5">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-[13px] font-medium text-zinc-400">
            {t('later')}
          </button>
          <button onClick={() => { onClose(); navigate('/pro') }}
            className="flex-1 py-2.5 rounded-xl bg-indigo-500 text-white text-[13px] font-bold active:scale-95 flex items-center justify-center gap-1">
            <Zap size={13} /> {t('upgrade')}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

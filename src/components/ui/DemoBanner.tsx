import { motion } from 'framer-motion'
import { LogIn } from 'lucide-react'
import { useAppStore } from '@/stores/appStore'

/**
 * Shows a banner at the top of group pages in demo mode.
 * Also exports a hook to show a signup prompt modal.
 */
export function DemoBanner() {
  const demoMode = useAppStore((s) => s.demoMode)
  const lang = useAppStore((s) => s.profile.language)

  if (!demoMode) return null

  return (
    <div className="shrink-0 bg-amber-500/10 border-b border-amber-500/15 px-4 py-2 flex items-center gap-2">
      <span className="text-[11px]">⚠️</span>
      <p className="text-[11px] text-amber-300 flex-1">
        {lang === 'de' ? 'Demo-Modus — Daten werden nicht gespeichert' : 'Demo mode — data is not saved'}
      </p>
      <button onClick={() => { useAppStore.getState().setDemoMode(false) }}
        className="text-[10px] text-amber-400 font-semibold px-2 py-1 bg-amber-500/10 rounded-lg active:bg-amber-500/20">
        <LogIn size={11} className="inline mr-1" />
        {lang === 'de' ? 'Anmelden' : 'Sign up'}
      </button>
    </div>
  )
}

/**
 * Modal that prompts the user to create an account.
 * Use: const [show, prompt] = useDemoPrompt()
 * Then call prompt() before actions that need auth. Returns true if should proceed.
 */
export function DemoPrompt({ onClose, onSignup }: { onClose: () => void; onSignup: () => void }) {
  const lang = useAppStore((s) => s.profile.language)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-8" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="relative bg-[#1a1d2a] border border-white/[0.08] rounded-2xl p-5 w-full max-w-[320px] text-center">
        <div className="text-4xl mb-3">🔒</div>
        <p className="text-[16px] font-bold">
          {lang === 'de' ? 'Account erstellen' : 'Create an account'}
        </p>
        <p className="text-[13px] text-zinc-500 mt-2">
          {lang === 'de'
            ? 'Im Demo-Modus kannst du alles ausprobieren, aber deine Daten werden nicht gespeichert. Erstelle einen Account um die App richtig zu nutzen.'
            : 'In demo mode you can try everything, but your data won\'t be saved. Create an account to use the app properly.'}
        </p>
        <div className="flex gap-2 mt-5">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-[13px] font-medium text-zinc-400">
            {lang === 'de' ? 'Später' : 'Later'}
          </button>
          <button onClick={onSignup}
            className="flex-1 py-2.5 rounded-xl bg-indigo-500 text-white text-[13px] font-bold active:scale-95">
            {lang === 'de' ? 'Registrieren' : 'Sign up'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { MoreHorizontal, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/stores/appStore'
import { ALL_TABS, DEFAULT_NAV_KEYS, DEFAULT_GROUP_PREFS } from '@/lib/tabs'
import { useT } from '@/lib/i18n'
import type { TabDef } from '@/lib/tabs'

export function BottomNav({ groupId }: { groupId: string }) {
  const location = useLocation()
  const navigate = useNavigate()
  const basePath = `/group/${groupId}`
  const [showMore, setShowMore] = useState(false)
  const prefs = useAppStore((s) => s.groupPrefs[groupId] ?? DEFAULT_GROUP_PREFS)
  const t = useT()

  const navKeys = prefs.navTabs.length > 0 ? prefs.navTabs : DEFAULT_NAV_KEYS
  const navTabs = navKeys.map((k) => ALL_TABS.find((t) => t.key === k)).filter(Boolean) as TabDef[]
  const moreTabs = ALL_TABS.filter((t) => !navKeys.includes(t.key))

  const isMoreActive = moreTabs.some((t) => location.pathname.startsWith(basePath + t.path))

  const isActive = (path: string) =>
    path === ''
      ? location.pathname === basePath || location.pathname === basePath + '/'
      : location.pathname.startsWith(basePath + path)

  return (
    <>
      {/* More sheet */}
      <AnimatePresence>
        {showMore && (
          <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setShowMore(false)}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full bg-[#161822] rounded-t-3xl px-5 pt-5 pb-8 pb-safe"
            >
              <div className="w-10 h-1 rounded-full bg-zinc-700 mx-auto mb-5" />
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[14px] font-bold">{t('tab.more_features')}</h3>
                <button onClick={() => setShowMore(false)} className="text-zinc-500 p-1"><X size={18} /></button>
              </div>
              <div className="flex flex-col gap-1.5">
                {moreTabs.map((tab) => {
                  const active = isActive(tab.path)
                  return (
                    <button key={tab.key}
                      onClick={() => { navigate(basePath + tab.path, { replace: true }); setShowMore(false) }}
                      className={cn(
                        'flex items-center gap-3.5 px-4 py-3 rounded-xl text-left transition-colors w-full',
                        active ? 'bg-indigo-500/10 text-indigo-300' : 'text-zinc-300 active:bg-white/[0.03]'
                      )}>
                      <span className="text-xl">{tab.emoji}</span>
                      <span className="text-[14px] font-medium">{tab.label}</span>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bottom nav */}
      <nav className="shrink-0 z-20 border-t border-white/[0.06] bg-[#0e1015]">
        <div className="w-full flex h-[49px] sm:h-[56px]">
          {navTabs.map((tab) => {
            const active = isActive(tab.path)
            const Icon = tab.icon
            return (
              <button key={tab.key} onClick={() => navigate(basePath + tab.path, { replace: true })}
                className={cn(
                  'flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors duration-150',
                  active ? 'text-indigo-400' : 'text-zinc-600 active:text-zinc-300'
                )}>
                <Icon size={18} className="sm:!w-5 sm:!h-5" strokeWidth={active ? 2.2 : 1.5} />
                <span className={cn('text-[9px] sm:text-[11px]', active ? 'font-bold' : 'font-medium')}>{t(`tab.${tab.key}` as 'tab.feed')}</span>
              </button>
            )
          })}
          {moreTabs.length > 0 && (
            <button onClick={() => setShowMore(true)}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors duration-150',
                isMoreActive ? 'text-indigo-400' : 'text-zinc-600 active:text-zinc-300'
              )}>
              <MoreHorizontal size={18} className="sm:!w-5 sm:!h-5" strokeWidth={isMoreActive ? 2.2 : 1.5} />
              <span className={cn('text-[9px] sm:text-[11px]', isMoreActive ? 'font-bold' : 'font-medium')}>{t('more')}</span>
            </button>
          )}
        </div>
      </nav>
    </>
  )
}

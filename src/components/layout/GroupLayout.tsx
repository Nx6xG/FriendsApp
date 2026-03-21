import { useEffect, useState } from 'react'
import { Outlet, useParams, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAppStore } from '@/stores/appStore'
import { DEFAULT_GROUP_PREFS } from '@/lib/tabs'
import { GroupHeader } from './GroupHeader'
import { BottomNav } from './BottomNav'
import { DemoBanner } from '@/components/ui/DemoBanner'

export function GroupLayout() {
  const { groupId } = useParams<{ groupId: string }>()
  const group = useAppStore((s) => s.groups.find((g) => g.id === groupId))
  const groupPrefs = useAppStore((s) => s.groupPrefs)
  const location = useLocation()
  const navigate = useNavigate()

  const markGroupSeen = useAppStore((s) => s.markGroupSeen)

  // Mark group as seen + redirect to start tab on initial group entry
  useEffect(() => {
    if (!groupId || !group) return
    markGroupSeen(groupId)
    const basePath = `/group/${groupId}`
    const isExactBase = location.pathname === basePath || location.pathname === basePath + '/'
    if (isExactBase) {
      const prefs = groupPrefs[groupId] ?? DEFAULT_GROUP_PREFS
      if (prefs.startTab) {
        navigate(basePath + prefs.startTab, { replace: true })
      }
    }
  }, [groupId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Hide bottom nav when keyboard is open (mobile)
  const [keyboardOpen, setKeyboardOpen] = useState(false)
  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return
    const onResize = () => {
      // If viewport height is significantly less than window height, keyboard is open
      setKeyboardOpen(vv.height < window.innerHeight * 0.75)
    }
    vv.addEventListener('resize', onResize)
    return () => vv.removeEventListener('resize', onResize)
  }, [])

  if (!group) return <Navigate to="/" replace />

  return (
    <div className="flex flex-col h-full">
      <GroupHeader group={group} />
      <DemoBanner />
      <main className="flex-1 min-h-0 overflow-y-auto">
        <Outlet context={{ group }} />
      </main>
      {!keyboardOpen && <BottomNav groupId={group.id} />}
    </div>
  )
}

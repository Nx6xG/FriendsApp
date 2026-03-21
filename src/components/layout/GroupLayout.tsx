import { useEffect } from 'react'
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

  // Redirect to start tab on initial group entry
  useEffect(() => {
    if (!groupId || !group) return
    const basePath = `/group/${groupId}`
    const isExactBase = location.pathname === basePath || location.pathname === basePath + '/'
    if (isExactBase) {
      const prefs = groupPrefs[groupId] ?? DEFAULT_GROUP_PREFS
      if (prefs.startTab) {
        navigate(basePath + prefs.startTab, { replace: true })
      }
    }
  }, [groupId]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!group) return <Navigate to="/" replace />

  return (
    <div className="flex flex-col h-full">
      <GroupHeader group={group} />
      <DemoBanner />
      <main className="flex-1 min-h-0 overflow-y-auto pb-[83px]">
        <Outlet context={{ group }} />
      </main>
      <BottomNav groupId={group.id} />
    </div>
  )
}

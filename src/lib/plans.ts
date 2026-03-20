import { useAppStore } from '@/stores/appStore'
import type { PlanType } from '@/types'

export const PLAN_LIMITS = {
  free: {
    maxGroups: 2,
    maxMembersPerGroup: 5,
    gps: false,
    mapPins: 10,
    recurringExpenses: false,
    customSplit: false,
    calendarExport: false,
    search: true,
    bucketList: false,
  },
  pro: {
    maxGroups: Infinity,
    maxMembersPerGroup: Infinity,
    gps: true,
    mapPins: Infinity,
    recurringExpenses: true,
    customSplit: true,
    calendarExport: true,
    search: true,
    bucketList: true,
  },
} as const

export const PRO_PRICE = {
  monthly: 2.99,
  yearly: 24.99,
  currency: 'EUR',
}

/**
 * Get the current user's plan. Returns 'free' if no plan or expired.
 */
export function getUserPlan(): PlanType {
  const profile = useAppStore.getState().profile
  if (profile.plan === 'pro') {
    if (profile.planExpiresAt && profile.planExpiresAt < Date.now()) {
      return 'free' // expired
    }
    return 'pro'
  }
  return 'free'
}

/**
 * Check if a specific feature is available on the current plan.
 */
export function canUseFeature(feature: keyof typeof PLAN_LIMITS.free): boolean {
  const plan = getUserPlan()
  return !!PLAN_LIMITS[plan][feature]
}

/**
 * Check if the user can create another group.
 */
export function canCreateGroup(): boolean {
  const plan = getUserPlan()
  const groupCount = useAppStore.getState().groups.length
  return groupCount < PLAN_LIMITS[plan].maxGroups
}

/**
 * Check if a group can add more members.
 */
export function canAddMember(currentMemberCount: number): boolean {
  const plan = getUserPlan()
  return currentMemberCount < PLAN_LIMITS[plan].maxMembersPerGroup
}

/**
 * React hook version.
 */
export function useIsPro(): boolean {
  const plan = useAppStore((s) => s.profile.plan)
  const expires = useAppStore((s) => s.profile.planExpiresAt)
  if (plan === 'pro') {
    // eslint-disable-next-line react-hooks/purity
    if (expires && expires < Date.now()) return false
    return true
  }
  return false
}

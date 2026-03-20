import { Capacitor } from '@capacitor/core'
import { useAppStore } from '@/stores/appStore'

// Set of group IDs that are actively sharing location
const sharingGroups = new Set<string>()
let watchId: string | null = null

/**
 * Start sharing location for a specific group.
 * GPS is started once and shared across all active groups.
 */
export async function startLocationTracking(groupId: string): Promise<boolean> {
  sharingGroups.add(groupId)

  // GPS already running — just add this group to updates
  if (watchId !== null) {
    return true
  }

  // Start GPS
  if (Capacitor.isNativePlatform()) {
    try {
      const { Geolocation } = await import('@capacitor/geolocation')

      const permStatus = await Geolocation.checkPermissions()
      if (permStatus.location !== 'granted') {
        const perm = await Geolocation.requestPermissions()
        if (perm.location !== 'granted' && perm.coarseLocation !== 'granted') {
          sharingGroups.delete(groupId)
          return false
        }
      }

      const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: false, timeout: 15000 })
      broadcastLocation(pos.coords.latitude, pos.coords.longitude)

      watchId = await Geolocation.watchPosition(
        { enableHighAccuracy: true },
        (position, err) => {
          if (err || !position) return
          broadcastLocation(position.coords.latitude, position.coords.longitude)
        }
      )
      return true
    } catch (e) {
      sharingGroups.delete(groupId)
      throw new Error(`GPS: ${e instanceof Error ? e.message : String(e)}`)
    }
  } else {
    if (!navigator.geolocation) {
      sharingGroups.delete(groupId)
      return false
    }

    return new Promise<boolean>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          broadcastLocation(pos.coords.latitude, pos.coords.longitude)
          const id = navigator.geolocation.watchPosition(
            (p) => broadcastLocation(p.coords.latitude, p.coords.longitude),
            () => {},
            { enableHighAccuracy: true }
          )
          watchId = String(id)
          resolve(true)
        },
        () => { sharingGroups.delete(groupId); resolve(false) },
        { enableHighAccuracy: true, timeout: 10000 }
      )
    })
  }
}

/**
 * Stop sharing location for a specific group.
 * GPS is only stopped when no groups are sharing anymore.
 */
export async function stopLocationTracking(groupId: string) {
  sharingGroups.delete(groupId)

  // Mark as not sharing in this group
  const store = useAppStore.getState()
  store.updateLiveLocation(groupId, {
    userId: store.currentUser,
    lat: 0, lng: 0,
    sharing: false,
    updatedAt: Date.now(),
  })

  // If no groups are sharing anymore, stop GPS
  if (sharingGroups.size === 0 && watchId !== null) {
    try {
      if (Capacitor.isNativePlatform()) {
        const { Geolocation } = await import('@capacitor/geolocation')
        await Geolocation.clearWatch({ id: watchId })
      } else {
        navigator.geolocation.clearWatch(Number(watchId))
      }
    } catch { /* ignore */ }
    watchId = null
  }
}

/**
 * Send location update to all active groups.
 */
function broadcastLocation(lat: number, lng: number) {
  const store = useAppStore.getState()
  for (const gid of sharingGroups) {
    store.updateLiveLocation(gid, {
      userId: store.currentUser,
      lat, lng,
      sharing: true,
      updatedAt: Date.now(),
    })
  }
}

/**
 * Check if a specific group is sharing location.
 */
export function isTrackingGroup(groupId: string) {
  return sharingGroups.has(groupId)
}

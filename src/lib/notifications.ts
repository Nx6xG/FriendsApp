import { Capacitor } from '@capacitor/core'
import { useAppStore } from '@/stores/appStore'
import { getUserName, isMe } from '@/lib/users'
import { getT } from '@/lib/i18n'
import type { GroupEvent, TodoItem, Expense } from '@/types'

// Convert string ID to numeric ID for LocalNotifications API
function hashId(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

/**
 * Request notification permissions on app start.
 */
export async function initNotifications() {
  if (!Capacitor.isNativePlatform()) return

  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications')
    const perm = await LocalNotifications.checkPermissions()
    if (perm.display === 'prompt') {
      await LocalNotifications.requestPermissions()
    }
  } catch { /* ignore on web */ }
}

/**
 * Schedule a reminder 1 hour before an event.
 */
export async function scheduleEventReminder(event: GroupEvent, groupId: string) {
  const store = useAppStore.getState()
  if (!store.profile.notificationsEnabled) return
  if (!Capacitor.isNativePlatform()) return

  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications')
    const eventDate = new Date(`${event.date}T${event.time}:00`)
    const reminderDate = new Date(eventDate.getTime() - 60 * 60 * 1000) // 1 hour before

    if (reminderDate <= new Date()) return // already past

    await LocalNotifications.schedule({
      notifications: [{
        id: hashId(event.id),
        title: `${event.emoji} ${event.title}`,
        body: `${getT('notif.event_reminder')} — ${event.time} ${getT('events.oclock')}${event.location ? ` · ${event.location}` : ''}`.trim(),
        schedule: { at: reminderDate },
        extra: { groupId, eventId: event.id },
      }],
    })
  } catch { /* ignore */ }
}

/**
 * Cancel a previously scheduled event reminder.
 */
export async function cancelEventReminder(eventId: string) {
  if (!Capacitor.isNativePlatform()) return
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications')
    await LocalNotifications.cancel({ notifications: [{ id: hashId(eventId) }] })
  } catch { /* ignore */ }
}

/**
 * Notify when a todo is assigned to the current user.
 */
export async function notifyTodoAssigned(todo: TodoItem, groupId: string) {
  const store = useAppStore.getState()
  if (!todo.assigneeIds.some(isMe)) return
  await fireNotification(`✅ ${getT('notif.new_task')}`, `"${todo.text}" ${getT('notif.task_assigned_body')}`, groupId)
  store.addNotification({
    id: `todo-${todo.id}`, type: 'todo',
    title: getT('notif.task_assigned'), body: `"${todo.text}" ${getT('notif.task_assigned_body')}`,
    groupId, read: false, timestamp: Date.now(),
  })
}

/**
 * Notify when an expense involves the current user.
 */
export async function notifyExpenseAdded(expense: Expense, groupId: string) {
  if (!expense.splitBetween.some(isMe) || isMe(expense.paidById)) return
  const paidByName = getUserName(expense.paidById)
  await fireNotification(`💰 ${getT('notif.new_expense')}`, `${paidByName} ${getT('notif.expense_body')} "${expense.title}"`, groupId)
  const store = useAppStore.getState()
  store.addNotification({
    id: `exp-${expense.id}`, type: 'expense',
    title: getT('notif.new_expense'), body: `${paidByName} ${getT('notif.expense_body')} "${expense.title}"`,
    groupId, read: false, timestamp: Date.now(),
  })
}

/**
 * Notify and schedule reminder when an event is created.
 */
export async function notifyEventCreated(event: GroupEvent, groupId: string) {
  await scheduleEventReminder(event, groupId)
  const store = useAppStore.getState()
  store.addNotification({
    id: `ev-${event.id}`, type: 'event_reminder',
    title: event.title, body: `${event.date} · ${event.time} ${getT('events.oclock')}`.trim(),
    groupId, read: false, timestamp: Date.now(),
  })
}

/**
 * Fire an immediate notification (generic).
 */
export async function fireNotification(title: string, body: string, groupId: string) {
  const store = useAppStore.getState()
  if (!store.profile.notificationsEnabled) return
  if (!Capacitor.isNativePlatform()) return

  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications')
    await LocalNotifications.schedule({
      notifications: [{
        id: hashId(`${groupId}-${Date.now()}`),
        title,
        body,
        schedule: { at: new Date(Date.now() + 1000) }, // 1 second from now
        extra: { groupId },
      }],
    })
  } catch { /* ignore */ }
}

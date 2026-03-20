import { useEffect, useState } from 'react'
import { initNotifications } from '@/lib/notifications'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAppStore } from '@/stores/appStore'
import { supabase } from '@/lib/supabase'
import { initSync, cleanup } from '@/lib/sync'
import type { Session } from '@supabase/supabase-js'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { AuthPage } from '@/pages/AuthPage'
import { OnboardingPage } from '@/pages/OnboardingPage'
import { HomePage } from '@/pages/HomePage'
import { NotificationsPage } from '@/pages/NotificationsPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { GroupLayout } from '@/components/layout/GroupLayout'
import { FeedPage } from '@/pages/FeedPage'
import { TodosPage } from '@/pages/TodosPage'
import { ExpensesPage } from '@/pages/ExpensesPage'
import { IdeasPage } from '@/pages/IdeasPage'
import { ChatPage } from '@/pages/ChatPage'
import { EventsPage } from '@/pages/EventsPage'
import { PlacesPage } from '@/pages/PlacesPage'
import { StatsPage } from '@/pages/StatsPage'
import { MapPage } from '@/pages/MapPage'
import { GroupSettingsPage } from '@/pages/GroupSettingsPage'
import { SearchPage } from '@/pages/SearchPage'
import { PaywallPage } from '@/pages/PaywallPage'
import { JoinPage } from '@/pages/JoinPage'

function AppRoutes() {
  return (
    <AuthGate>
      <Routes>
        <Route path="/" element={<HomePage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/pro" element={<PaywallPage />} />
      <Route path="/join/:code" element={<JoinPage />} />
      <Route path="/notifications" element={<NotificationsPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/group/:groupId" element={<GroupLayout />}>
        <Route index element={<FeedPage />} />
        <Route path="todos" element={<TodosPage />} />
        <Route path="expenses" element={<ExpensesPage />} />
        <Route path="ideas" element={<IdeasPage />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="events" element={<EventsPage />} />
        <Route path="places" element={<PlacesPage />} />
        <Route path="stats" element={<StatsPage />} />
        <Route path="map" element={<MapPage />} />
        <Route path="settings" element={<GroupSettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </AuthGate>
  )
}

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const darkMode = useAppStore((s) => s.profile.darkMode)

  useEffect(() => {
    const html = document.documentElement
    if (darkMode) {
      html.classList.remove('light-mode')
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#0a0c12')
    } else {
      html.classList.add('light-mode')
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#f2f2f7')
    }
  }, [darkMode])

  return <>{children}</>
}

function SplashGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    initNotifications()

    const timer = setTimeout(() => {
      const splash = document.getElementById('splash')
      if (splash) {
        splash.style.opacity = '0'
        setTimeout(() => splash.remove(), 400)
      }
      setReady(true)
    }, 600)
    return () => clearTimeout(timer)
  }, [])

  return <div style={{ visibility: ready ? 'visible' : 'hidden', height: '100%' }}>{children}</div>
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const setUser = useAppStore((s) => s.setUser)
  const setCurrentUserId = useAppStore((s) => s.setCurrentUserId)
  const setOnboarded = useAppStore((s) => s.setOnboarded)
  const updateProfile = useAppStore((s) => s.updateProfile)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        const name = session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User'
        setUser(name)
        setCurrentUserId(session.user.id)
        updateProfile({ name })
        setOnboarded(true)
        initSync(session.user.id)
      } else {
        cleanup()
        setShowOnboarding(true)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user) {
        const name = session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User'
        setUser(name)
        setCurrentUserId(session.user.id)
        updateProfile({ name })
        setOnboarded(true)
        setShowOnboarding(false)
        initSync(session.user.id)
      } else {
        cleanup()
        setShowOnboarding(true)
      }
    })

    return () => subscription.unsubscribe()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const demoMode = useAppStore((s) => s.demoMode)

  // Still loading
  if (session === undefined) return null

  // Demo mode — skip auth
  if (demoMode && !session) return <>{children}</>

  // Not logged in: show onboarding first, then auth
  if (!session) {
    if (showOnboarding) {
      return <OnboardingPage onFinish={() => setShowOnboarding(false)} />
    }
    return <AuthPage />
  }

  // Logged in
  return <>{children}</>
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider>
          <SplashGate>
            <div className="flex flex-col flex-1 min-h-0 h-full bg-[#0a0c12] text-zinc-100 overflow-hidden">
              <AppRoutes />
            </div>
          </SplashGate>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Capacitor } from '@capacitor/core'
import './index.css'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary'

// Safe area insets are injected by native Swift code (AppDelegate.swift)
// via evaluateJavaScript setting --safe-top and --safe-bottom CSS vars.
// On web browsers (not PWA), set to 0px. In standalone PWA, let env() handle it via CSS.
const isStandalonePwa = window.matchMedia('(display-mode: standalone)').matches
  || ('standalone' in navigator && (navigator as { standalone?: boolean }).standalone)
if (!Capacitor.isNativePlatform() && !isStandalonePwa) {
  document.documentElement.style.setProperty('--safe-top', '0px')
  document.documentElement.style.setProperty('--safe-bottom', '0px')
}


// Keyboard handling — only on native, dynamically imported to avoid web crashes
if (Capacitor.isNativePlatform()) {
  import('@capacitor/keyboard').then(({ Keyboard }) => {
    Keyboard.addListener('keyboardWillShow', (info) => {
      document.documentElement.style.setProperty('--keyboard-height', `${info.keyboardHeight}px`)
      document.documentElement.classList.add('keyboard-open')
      setTimeout(() => {
        const el = document.activeElement as HTMLElement | null
        if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT')) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 280)
    })
    Keyboard.addListener('keyboardWillHide', () => {
      document.documentElement.style.setProperty('--keyboard-height', '0px')
      document.documentElement.classList.remove('keyboard-open')
    })
  })
}

// Register Service Worker for PWA (only on web, not in Capacitor)
if ('serviceWorker' in navigator && !Capacitor.isNativePlatform()) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)

import { Component, type ReactNode } from 'react'
import { getT } from '@/lib/i18n'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full bg-[#0a0c12] text-zinc-100 p-6 text-center">
          <span className="text-5xl mb-4">😵</span>
          <h1 className="text-xl font-bold mb-2">{getT('error.title')}</h1>
          <p className="text-zinc-400 text-sm mb-6">{getT('error.body')}</p>
          <button
            onClick={() => {
              this.setState({ hasError: false })
              window.location.href = '/'
            }}
            className="px-6 py-3 bg-indigo-500 text-white rounded-2xl font-bold text-sm active:scale-[0.98] transition-all"
          >
            {getT('error.reload')}
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

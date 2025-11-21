'use client'

import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    onTelegramAuth?: (user: unknown) => void
  }
}

interface LoginButtonProps {
  size?: 'small' | 'medium' | 'large'
  className?: string
}

export function LoginButton({ size = 'large', className }: LoginButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    container.innerHTML = ''

    const script = document.createElement('script')
    script.src = 'https://telegram.org/js/telegram-widget.js?22'
    script.setAttribute('data-telegram-login', process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME || 'your_bot_name')
    script.setAttribute('data-size', size)
    script.setAttribute('data-onauth', 'onTelegramAuth(user)')
    script.setAttribute('data-request-access', 'write')
    script.async = true
    container.appendChild(script)

    window.onTelegramAuth = async (user: unknown) => {
      try {
        const response = await fetch('/api/auth/telegram', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(user),
        })

        if (!response.ok) {
          console.error('Telegram auth failed')
          return
        }

        const data = await response.json()
        const currentPath = typeof window !== 'undefined'
          ? `${window.location.pathname}${window.location.search}`
          : '/'
        const storedReturnUrl = typeof window !== 'undefined'
          ? window.localStorage.getItem('postLoginReturnUrl')
          : null
        const destination = storedReturnUrl || currentPath || '/'
        if (typeof window !== 'undefined' && storedReturnUrl) {
          window.localStorage.removeItem('postLoginReturnUrl')
        }

        if (data.requiresSetup) {
          window.location.href = `/profile/setup?returnUrl=${encodeURIComponent(destination)}`
        } else {
          window.location.href = destination
        }
      } catch (error) {
        console.error('Auth error:', error)
      }
    }

    return () => {
      if (container.contains(script)) {
        container.removeChild(script)
      }
    }
  }, [size])

  return (
    <div className={className}>
      <div ref={containerRef} className="inline-block" />
    </div>
  )
}


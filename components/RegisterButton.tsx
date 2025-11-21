'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { RegistrationModal } from './RegistrationModal'
import { LoginPromptModal } from './LoginPromptModal'

interface RegisterButtonProps {
  eventId: string
  eventSlug: string
  user: {
    id: string
    phone: string | null
    position: string | null
    company: string | null
    strongSkills: string | null
  } | null
}

const PENDING_KEY = 'pendingRegistration'

/**
 * Локальная проверка, что профиль заполнен.
 * Никаких серверных импортов — всё работает на клиенте.
 */
function isProfileComplete(user: RegisterButtonProps['user']): boolean {
  if (!user) return false

  return Boolean(
    user.phone &&
      user.phone.trim() &&
      user.position &&
      user.position.trim() &&
      user.company &&
      user.company.trim() &&
      user.strongSkills &&
      user.strongSkills.trim()
  )
}

export function RegisterButton({ eventId, eventSlug, user }: RegisterButtonProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [showModal, setShowModal] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)

  const currentUrl = useMemo(() => {
    const search = searchParams.toString()
    const basePath = pathname || '/'
    return search ? `${basePath}?${search}` : basePath
  }, [pathname, searchParams])

  const savePendingRegistration = (returnUrl: string) => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(
      PENDING_KEY,
      JSON.stringify({ eventId, eventSlug, returnUrl })
    )
  }

  const clearPendingRegistration = () => {
    if (typeof window === 'undefined') return
    window.localStorage.removeItem(PENDING_KEY)
  }

  useEffect(() => {
    if (!user || typeof window === 'undefined') {
      return
    }

    const pendingRaw = window.localStorage.getItem(PENDING_KEY)
    if (!pendingRaw) return

    try {
      const pending = JSON.parse(pendingRaw) as { eventId: string }
      if (pending.eventId !== eventId) return
      if (!isProfileComplete(user)) return
      setShowModal(true)
      clearPendingRegistration()
    } catch (error) {
      console.error('Pending registration parse error', error)
      clearPendingRegistration()
    }
  }, [eventId, user])

  useEffect(() => {
    if (user) {
      setShowLoginPrompt(false)
    }
  }, [user])

  const handleClick = () => {
    if (!user) {
      savePendingRegistration(currentUrl)
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('postLoginReturnUrl', currentUrl)
      }
      setShowLoginPrompt(true)
      return
    }

    if (!isProfileComplete(user)) {
      savePendingRegistration(currentUrl)
      router.push(`/profile/setup?returnUrl=${encodeURIComponent(currentUrl)}`)
      return
    }

    setShowModal(true)
  }

  const handleRegister = async (expectations: string) => {
    const response = await fetch('/api/registrations/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ eventId, expectations }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Ошибка регистрации')
    }

    setShowModal(false)
    setShowSuccess(true)
    clearPendingRegistration()
    router.refresh()
  }

  const organizerLink =
    process.env.NEXT_PUBLIC_EVENT_ORGANIZER_TELEGRAM || 'https://t.me/organizer'

  return (
    <>
      <button
        onClick={handleClick}
        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        Записаться на мероприятие
      </button>

      <RegistrationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onRegister={handleRegister}
      />

      <LoginPromptModal
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
      />

      {showSuccess && (
        <div className="fixed inset-x-0 bottom-6 flex justify-center px-4 z-50">
          <div className="bg-white border border-green-200 shadow-lg rounded-xl p-6 max-w-lg w-full">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xl">
                ✓
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">Регистрация успешна</h3>
                <p className="text-sm text-gray-700 mb-3">
                  Вы успешно записаны на мероприятие. Чтобы подтвердить бронь, напишите
                  организатору по поводу оплаты.
                </p>
                <a
                  href={organizerLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-600 hover:underline text-sm font-medium"
                >
                  Написать организатору в Telegram →
                </a>
              </div>
              <button
                type="button"
                onClick={() => setShowSuccess(false)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

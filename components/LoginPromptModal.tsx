'use client'

import { LoginButton } from './LoginButton'

interface LoginPromptModalProps {
  isOpen: boolean
  onClose: () => void
}

export function LoginPromptModal({ isOpen, onClose }: LoginPromptModalProps) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-semibold mb-1">Войдите через Telegram</h2>
            <p className="text-sm text-gray-600">
              Чтобы записаться на мероприятие, авторизуйтесь через Telegram. После входа вы вернётесь обратно.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ✕
          </button>
        </div>

        <div className="flex justify-center">
          <LoginButton size="large" />
        </div>
      </div>
    </div>
  )
}



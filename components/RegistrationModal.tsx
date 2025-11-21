'use client'

import { useEffect, useState } from 'react'

interface RegistrationModalProps {
  isOpen: boolean
  onClose: () => void
  onRegister: (expectations: string) => Promise<void>
}

export function RegistrationModal({ isOpen, onClose, onRegister }: RegistrationModalProps) {
  const [expectations, setExpectations] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) {
      setExpectations('')
      setError(null)
      setIsSubmitting(false)
    }
  }, [isOpen])

  if (!isOpen) {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!expectations.trim()) {
      setError('Пожалуйста, заполните ожидания от мероприятия')
      return
    }

    setIsSubmitting(true)
    setError(null)
    try {
      await onRegister(expectations.trim())
      setExpectations('')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Ошибка регистрации')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Ожидания от мероприятия</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="block mb-2">
            <span className="text-sm font-medium text-gray-700">
              Ожидания от мероприятия: цели, что/кого ищет и для каких задач (несколько абзацев)
            </span>
            <textarea
              value={expectations}
              onChange={(e) => setExpectations(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={6}
              required
            />
          </label>

          {error && (
            <p className="text-sm text-red-600 mt-2">{error}</p>
          )}

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {isSubmitting ? 'Отправка...' : 'Готово'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}



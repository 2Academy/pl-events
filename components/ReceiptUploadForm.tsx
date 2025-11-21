'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface ReceiptUploadFormProps {
  registrationId: string
}

export function ReceiptUploadForm({ registrationId }: ReceiptUploadFormProps) {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Check if file is image or PDF
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
      if (!validTypes.includes(selectedFile.type)) {
        setError('Пожалуйста, выберите изображение или PDF файл')
        return
      }
      setFile(selectedFile)
      setError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      setError('Пожалуйста, выберите файл')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`/api/registrations/${registrationId}/upload-receipt`, {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        router.push('/profile')
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Ошибка загрузки файла')
      }
    } catch (error) {
      console.error('Upload error:', error)
      setError('Ошибка загрузки файла')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Выберите файл (изображение или PDF)
        </label>
        <input
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        {file && (
          <p className="mt-2 text-sm text-gray-600">Выбран файл: {file.name}</p>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || !file}
        className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Загрузка...' : 'Загрузить чек'}
      </button>
    </form>
  )
}


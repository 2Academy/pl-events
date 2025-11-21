'use client'

import { useState } from 'react'
import { ParticipantIntroModal } from './ParticipantIntroModal'

interface User {
  id: string
  firstName: string
  lastName: string | null
  avatarUrl: string | null
  company: string
  position: string
  strongSkills: string
}

interface Registration {
  id: string
  user: User
  expectations: string
}

interface ParticipantsListProps {
  registrations: Registration[]
}

export function ParticipantsList({ registrations }: ParticipantsListProps) {
  const [selectedParticipant, setSelectedParticipant] = useState<Registration | null>(null)

  if (registrations.length === 0) {
    return <p className="text-gray-600">Пока нет зарегистрированных участников</p>
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {registrations.map((registration) => (
          <button
            key={registration.id}
            onClick={() => setSelectedParticipant(registration)}
            className="flex flex-col items-center hover:opacity-80 transition-opacity"
          >
            <div className="w-20 h-20 rounded-full overflow-hidden mb-2 bg-gray-200">
              {registration.user.avatarUrl ? (
                <img
                  src={registration.user.avatarUrl}
                  alt={`${registration.user.firstName} ${registration.user.lastName || ''}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  {registration.user.firstName[0]}
                </div>
              )}
            </div>
            <p className="text-sm font-medium text-center">{registration.user.firstName}</p>
            <p className="text-xs text-gray-600 text-center">{registration.user.company}</p>
            <p className="text-xs text-gray-500 text-center">{registration.user.position}</p>
          </button>
        ))}
      </div>

      {selectedParticipant && (
        <ParticipantIntroModal
          registration={selectedParticipant}
          onClose={() => setSelectedParticipant(null)}
        />
      )}
    </>
  )
}


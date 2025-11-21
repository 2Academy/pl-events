'use client'

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

interface ParticipantIntroModalProps {
  registration: Registration
  onClose: () => void
}

export function ParticipantIntroModal({ registration, onClose }: ParticipantIntroModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-semibold">Интро участника</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-shrink-0">
            {registration.user.avatarUrl ? (
              <img
                src={registration.user.avatarUrl}
                alt={`${registration.user.firstName} ${registration.user.lastName || ''}`}
                className="w-32 h-32 rounded-full object-cover"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-4xl text-gray-400">
                {registration.user.firstName[0]}
              </div>
            )}
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <h3 className="text-xl font-semibold">
                {registration.user.firstName} {registration.user.lastName || ''}
              </h3>
              <p className="text-gray-600">{registration.user.position}</p>
              <p className="text-gray-600">{registration.user.company}</p>
            </div>

            <div>
              <h4 className="font-medium mb-2">Сильные скиллы</h4>
              <p className="text-gray-700 whitespace-pre-line">{registration.user.strongSkills}</p>
            </div>

            <div>
              <h4 className="font-medium mb-2">Ожидания от мероприятия</h4>
              <p className="text-gray-700 whitespace-pre-line">{registration.expectations}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


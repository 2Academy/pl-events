import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

async function getUserRegistrations(userId: string) {
  const registrations = await prisma.registration.findMany({
    where: { userId },
    include: {
      event: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
  return registrations
}

export default async function ProfilePage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/')
  }

  // Check if profile needs setup
  if (!user.phone || !user.position || !user.company || !user.strongSkills) {
    redirect('/profile/setup')
  }

  const registrations = await getUserRegistrations(user.id)

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Мой профиль</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center mb-6">
          {user.avatarUrl && (
            <img
              src={user.avatarUrl}
              alt={`${user.firstName} ${user.lastName || ''}`}
              className="w-24 h-24 rounded-full mr-6"
            />
          )}
          <div>
            <h2 className="text-2xl font-semibold">
              {user.firstName} {user.lastName || ''}
            </h2>
            <p className="text-gray-600">{user.position}</p>
            <p className="text-gray-600">{user.company}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Телефон</label>
            <p className="text-gray-900">{user.phone}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Telegram</label>
            <p className="text-gray-900">@{user.telegramUsername || 'не указан'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Сильные скиллы</label>
            <p className="text-gray-900 whitespace-pre-line">{user.strongSkills}</p>
          </div>
        </div>

        <Link
          href="/profile/setup"
          className="mt-6 inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Редактировать профиль
        </Link>
      </div>

      <h2 className="text-2xl font-semibold mb-4">Мои регистрации</h2>
      
      {registrations.length === 0 ? (
        <p className="text-gray-600">У вас пока нет регистраций на мероприятия</p>
      ) : (
        <div className="space-y-4">
          {registrations.map((registration) => (
            <div
              key={registration.id}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <div className="flex justify-between items-start">
                <div>
                  <Link
                    href={`/events/${registration.event.slug}`}
                    className="text-xl font-semibold text-blue-600 hover:underline"
                  >
                    {registration.event.title}
                  </Link>
                  <p className="text-gray-600 mt-2">
                    {new Date(registration.event.startDateTime).toLocaleString('ru-RU', {
                      dateStyle: 'long',
                      timeStyle: 'short',
                    })}
                  </p>
                  <p className="text-sm mt-2">
                    Статус оплаты:{' '}
                    <span className={registration.isPaid ? 'text-green-600' : 'text-orange-600'}>
                      {registration.isPaid ? 'Оплата подтверждена' : 'Ожидает оплаты'}
                    </span>
                  </p>
                  {!registration.isPaid && (
                    <Link
                      href={`/profile/receipt/${registration.id}`}
                      className="mt-2 inline-block text-sm text-blue-600 hover:underline"
                    >
                      Загрузить чек об оплате
                    </Link>
                  )}
                  {registration.paymentReceiptUrl && (
                    <div className="mt-2">
                      <a
                        href={registration.paymentReceiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Просмотреть загруженный чек
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


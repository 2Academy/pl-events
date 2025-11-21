import Link from 'next/link'
import { prisma } from '@/lib/prisma'

async function getEvents() {
  const events = await prisma.event.findMany({
    where: {
      startDateTime: {
        gte: new Date(),
      },
    },
    orderBy: {
      startDateTime: 'asc',
    },
    take: 10,
  })
  return events
}

export default async function Home() {
  const events = await getEvents()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Ближайшие мероприятия</h1>
      
      {events.length === 0 ? (
        <p className="text-gray-600">Пока нет запланированных мероприятий</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Link
              key={event.id}
              href={`/events/${event.slug}`}
              className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              {event.coverImageUrl && (
                <img
                  src={event.coverImageUrl}
                  alt={event.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2">{event.title}</h2>
                <p className="text-gray-600 text-sm mb-4">
                  {new Date(event.startDateTime).toLocaleString('ru-RU', {
                    dateStyle: 'long',
                    timeStyle: 'short',
                  })}
                </p>
                <p className="text-gray-700 line-clamp-3">
                  {event.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}


import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ParticipantsList } from '@/components/ParticipantsList'

async function getEvent(slug: string) {
  const event = await prisma.event.findUnique({
    where: { slug },
    include: {
      registrations: {
        include: {
          user: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  })
  return event
}

export default async function ParticipantsPage({
  params,
}: {
  params: { slug: string }
}) {
  const event = await getEvent(params.slug)

  if (!event) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {event.coverImageUrl && (
        <img
          src={event.coverImageUrl}
          alt={event.title}
          className="w-full h-64 md:h-96 object-cover rounded-lg mb-8"
        />
      )}
      
      <h1 className="text-4xl font-bold mb-4">{event.title}</h1>
      
      <p className="text-gray-600 mb-6">
        {new Date(event.startDateTime).toLocaleString('ru-RU', {
          dateStyle: 'long',
          timeStyle: 'short',
        })}
      </p>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
        <p className="text-blue-800">
          Информацию о локации оплатившие участники получат в личку в телеграм
        </p>
      </div>

      <h2 className="text-2xl font-semibold mb-6">Список участников</h2>
      
      <ParticipantsList registrations={event.registrations} />
    </div>
  )
}


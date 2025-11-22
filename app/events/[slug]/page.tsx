import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { RegisterButton } from '@/components/RegisterButton'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

async function getEvent(slug: string) {
  const event = await prisma.event.findUnique({
    where: { slug },
  })
  return event
}

export default async function EventPage({
  params,
}: {
  params: { slug: string }
}) {
  const event = await getEvent(params.slug)
  const user = await getCurrentUser()

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

      <div className="prose max-w-none mb-8">
        <p className="whitespace-pre-line">{event.description}</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
        <p className="text-blue-800">
          Информацию о локации оплатившие участники получат в личку в телеграм
        </p>
      </div>

      <div className="flex gap-4 mb-8">
        <RegisterButton eventId={event.id} eventSlug={event.slug} user={user} />
        <Link
          href={`/events/${params.slug}/participants`}
          className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
        >
          Список участников
        </Link>
      </div>

      {event.paymentInfo && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold mb-2">Информация об оплате:</h3>
          <p className="text-gray-700 whitespace-pre-line">{event.paymentInfo}</p>
        </div>
      )}
    </div>
  )
}


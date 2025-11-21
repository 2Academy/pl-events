import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { CreateEventForm } from '@/components/CreateEventForm'

export default async function NewEventPage() {
  const user = await getCurrentUser()

  if (!user || !user.isAdmin) {
    redirect('/')
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Создать мероприятие</h1>
      <CreateEventForm />
    </div>
  )
}


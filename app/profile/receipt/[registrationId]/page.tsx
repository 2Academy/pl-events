import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ReceiptUploadForm } from '@/components/ReceiptUploadForm'

async function getRegistration(registrationId: string, userId: string) {
  const registration = await prisma.registration.findUnique({
    where: { id: registrationId },
    include: {
      event: true,
    },
  })

  if (!registration || registration.userId !== userId) {
    return null
  }

  return registration
}

export default async function ReceiptUploadPage({
  params,
}: {
  params: { registrationId: string }
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/')
  }

  const registration = await getRegistration(params.registrationId, user.id)

  if (!registration) {
    redirect('/profile')
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Загрузка чека об оплате</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">{registration.event.title}</h2>
        {registration.paymentInfo && (
          <div className="mb-4">
            <h3 className="font-medium mb-2">Информация об оплате:</h3>
            <p className="text-gray-700 whitespace-pre-line">{registration.paymentInfo}</p>
          </div>
        )}
      </div>

      <ReceiptUploadForm registrationId={registration.id} />
    </div>
  )
}


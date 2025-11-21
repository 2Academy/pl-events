import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { ProfileSetupForm } from '@/components/ProfileSetupForm'

export default async function ProfileSetupPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/')
  }

  // Check if profile is already complete
  if (user.phone && user.position && user.company && user.strongSkills) {
    redirect('/profile')
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Заполните профиль</h1>
      <ProfileSetupForm user={user} />
    </div>
  )
}


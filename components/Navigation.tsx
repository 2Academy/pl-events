import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import { LoginButton } from './LoginButton'
import { LogoutButton } from './LogoutButton'

export async function Navigation() {
  const user = await getCurrentUser()

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex space-x-6">
            <Link href="/" className="text-lg font-semibold text-gray-800 hover:text-gray-600">
              Главная
            </Link>
            {user && (
              <>
                <Link href="/profile" className="text-gray-600 hover:text-gray-800">
                  Профиль
                </Link>
                {user.isAdmin && (
                  <Link href="/admin/events" className="text-gray-600 hover:text-gray-800">
                    Админка
                  </Link>
                )}
              </>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-gray-700">
                  {user.firstName} {user.lastName || ''}
                </span>
                <LogoutButton />
              </>
            ) : (
              <LoginButton />
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}


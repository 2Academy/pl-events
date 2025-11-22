import { SignJWT, jwtVerify, type JWTPayload as JoseJWTPayload } from 'jose'
import { cookies } from 'next/headers'
import { prisma } from './prisma'

const secretKey = process.env.JWT_SECRET || 'default-secret-key-change-in-production'
const key = new TextEncoder().encode(secretKey)

/**
 * Payload нашего приложения для JWT.
 * Расширяем JWTPayload из jose, чтобы удовлетворить его типам.
 */
export interface AppJWTPayload extends JoseJWTPayload {
  userId: string
  telegramId: string
}

export async function encrypt(payload: AppJWTPayload): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(key)
}

export async function decrypt(session: string): Promise<AppJWTPayload | null> {
  try {
    const { payload } = await jwtVerify(session, key, {
      algorithms: ['HS256'],
    })
    return payload as AppJWTPayload
  } catch {
    return null
  }
}

export async function getSession(): Promise<AppJWTPayload | null> {
  try {
    // cookies() может выбросить ошибку во время статической генерации
    const cookieStore = cookies()
    const session = cookieStore.get('auth_token')?.value
    if (!session) return null
    return await decrypt(session)
  } catch {
    // Во время build-time cookies() может быть недоступен
    return null
  }
}

export async function getCurrentUser() {
  try {
    const session = await getSession()
    if (!session) return null

    // Prisma может быть недоступен во время build-time на Vercel
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    })

    return user
  } catch {
    // Gracefully handle build-time errors (no DB connection, etc.)
    return null
  }
}

export class UnauthorizedError extends Error {
  constructor() {
    super('Unauthorized')
    this.name = 'UnauthorizedError'
  }
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new UnauthorizedError()
  }
  return user
}

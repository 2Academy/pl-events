import { SignJWT, jwtVerify, type JWTPayload as JoseJWTPayload } from 'jose'
import { cookies } from 'next/headers'
import { prisma } from './prisma'

const secretKey = process.env.JWT_SECRET || 'default-secret-key-change-in-production'
const key = new TextEncoder().encode(secretKey)

// Наш payload токена, совместимый с типом JWTPayload из jose
export interface JWTPayload extends JoseJWTPayload {
  userId: string
  telegramId: string
}

export async function encrypt(payload: JWTPayload): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(key)
}

export async function decrypt(session: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(session, key, {
      algorithms: ['HS256'],
    })
    return payload as JWTPayload
  } catch (error) {
    return null
  }
}

export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies()
  const session = cookieStore.get('auth_token')?.value
  if (!session) return null
  return await decrypt(session)
}

export async function getCurrentUser() {
  const session = await getSession()
  if (!session) return null

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  })

  return user
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

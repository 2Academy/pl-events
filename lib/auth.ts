import { SignJWT, jwtVerify, type JWTPayload as JoseJWTPayload } from 'jose'
import { cookies } from 'next/headers'
import { prisma } from './prisma'

/**
 * Секретный ключ для подписи JWT.
 * В проде ОБЯЗАТЕЛЬНО задать process.env.JWT_SECRET.
 */
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

/**
 * Шифруем payload в JWT.
 */
export async function encrypt(payload: AppJWTPayload): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(key)
}

/**
 * Расшифровываем JWT.
 * При любой ошибке возвращаем null, чтобы не валить рендер.
 */
export async function decrypt(session: string): Promise<AppJWTPayload | null> {
  try {
    const { payload } = await jwtVerify(session, key, {
      algorithms: ['HS256'],
    })
    return payload as AppJWTPayload
  } catch (error) {
    console.error('decrypt() error:', error)
    return null
  }
}

/**
 * Получаем сессию из cookie.
 * На build-time cookies() может быть недоступен → стараемся не падать.
 */
export async function getSession(): Promise<AppJWTPayload | null> {
  try {
    const cookieStore = cookies() // может выбросить ошибку во время статической генерации
    const session = cookieStore.get('auth_token')?.value
    if (!session) return null

    return await decrypt(session)
  } catch (error) {
    // Ловим все возможные ошибки Next.js во время статической генерации
    // DynamicServerError, DYNAMIC_SERVER_USAGE и т.д.
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorName = error instanceof Error ? error.name : ''
    
    // Это нормально во время build-time или статической генерации
    if (
      errorName === 'DynamicServerError' ||
      errorMessage.includes('DynamicServerError') ||
      errorMessage.includes('cookies()') ||
      errorMessage.includes('DYNAMIC_SERVER_USAGE') ||
      errorMessage.includes('Route used') ||
      errorMessage.includes('static generation')
    ) {
      // Тихий возврат null - это ожидаемое поведение на build-time
      return null
    }
    
    // Другие ошибки логируем, но всё равно возвращаем null
    if (process.env.NODE_ENV === 'development') {
      console.warn('getSession() error (non-critical):', error)
    }
    return null
  }
}

/**
 * Текущий пользователь.
 * Любая ошибка с Prisma / подключением к БД / некорректной схеме
 * ловится и возвращает null, чтобы не валить билд (в т.ч. /_not-found).
 */
export async function getCurrentUser() {
  try {
    const session = await getSession()
    if (!session) return null

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    })

    return user
  } catch (error) {
    // Ловим все возможные ошибки: Prisma, подключение к БД, и т.д.
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorName = error instanceof Error ? error.name : ''
    
    // Ошибки Prisma (нет подключения к БД, неправильный DATABASE_URL и т.д.)
    const isPrismaError =
      errorName.includes('Prisma') ||
      errorMessage.includes('P1001') || // Can't reach database server
      errorMessage.includes('P1017') || // Server has closed the connection
      errorMessage.includes('P2002') || // Unique constraint
      errorMessage.includes('DATABASE_URL') ||
      errorMessage.includes('connection') ||
      errorMessage.includes('ECONNREFUSED') ||
      errorMessage.includes('timeout')
    
    // Это нормально во время build-time или когда БД недоступна
    if (isPrismaError) {
      // Тихий возврат null - это ожидаемое поведение на build-time
      return null
    }
    
    // Другие ошибки логируем только в development
    if (process.env.NODE_ENV === 'development') {
      console.warn('getCurrentUser() error (non-critical):', error)
    }
    // Важно: не кидаем ошибку наружу, чтобы Next не падал на билде
    return null
  }
}

/**
 * Кастомная ошибка для защищённых участков.
 */
export class UnauthorizedError extends Error {
  constructor() {
    super('Unauthorized')
    this.name = 'UnauthorizedError'
  }
}

/**
 * Обязательная авторизация.
 * Использовать ТОЛЬКО там, где ты уверен, что это не будет вызвано на build-time
 * (например, в server actions / API routes, а не в layout/Navigation).
 */
export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new UnauthorizedError()
  }
  return user
}

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyTelegramAuth, type TelegramAuthData } from '@/lib/telegram'
import { prisma } from '@/lib/prisma'
import { encrypt } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json() as TelegramAuthData

    // Verify Telegram authentication
    if (!verifyTelegramAuth(data)) {
      return NextResponse.json(
        { error: 'Invalid Telegram authentication' },
        { status: 401 }
      )
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { telegramId: data.id },
    })

    const isNewUser = !user

    if (!user) {
      user = await prisma.user.create({
        data: {
          telegramId: data.id,
          telegramUsername: data.username || null,
          firstName: data.first_name,
          lastName: data.last_name || null,
          avatarUrl: data.photo_url || null,
          phone: '', // Will be filled in profile setup
          position: '',
          company: '',
          strongSkills: '',
        },
      })
    } else {
      // Update user data from Telegram
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          telegramUsername: data.username || null,
          firstName: data.first_name,
          lastName: data.last_name || null,
          avatarUrl: data.photo_url || null,
        },
      })
    }

    // Generate JWT token
    const token = await encrypt({
      userId: user.id,
      telegramId: user.telegramId,
    })

    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    })

    // Check if profile is complete
    const requiresSetup = !user.phone || !user.position || !user.company || !user.strongSkills

    return NextResponse.json({
      success: true,
      requiresSetup,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    })
  } catch (error) {
    console.error('Telegram auth error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


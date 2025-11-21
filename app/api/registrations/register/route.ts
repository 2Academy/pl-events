import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, UnauthorizedError } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isProfileComplete } from '@/lib/profile'

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { eventId, expectations } = await request.json()
    if (!isProfileComplete(user)) {
      return NextResponse.json(
        { error: 'Profile must be completed first' },
        { status: 400 }
      )
    }
    const normalizedExpectations = typeof expectations === 'string' ? expectations.trim() : ''

    if (!eventId || !normalizedExpectations) {
      return NextResponse.json(
        { error: 'eventId and expectations are required' },
        { status: 400 }
      )
    }

    // Check if already registered
    const existing = await prisma.registration.findUnique({
      where: {
        userId_eventId: {
          userId: user.id,
          eventId: eventId,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Already registered' },
        { status: 409 }
      )
    }

    // Get event to copy payment info
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    const registration = await prisma.registration.create({
      data: {
        userId: user.id,
        eventId: eventId,
        expectations: normalizedExpectations,
        paymentInfo: event.paymentInfo,
        isPaid: false,
      },
    })

    return NextResponse.json(registration, { status: 201 })
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


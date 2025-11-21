import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, UnauthorizedError } from '@/lib/auth'

// --------------------------------------------------------
// GET — получить список ближайших мероприятий
// --------------------------------------------------------
export async function GET() {
  const events = await prisma.event.findMany({
    where: {
      startDateTime: {
        gte: new Date(),
      },
    },
    orderBy: {
      startDateTime: 'asc',
    },
  })

  return NextResponse.json(events)
}

// --------------------------------------------------------
// POST — создать новое мероприятие (БЕЗ авторизации)
// --------------------------------------------------------
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    if (!user.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const event = await prisma.event.create({
      data: {
        slug: body.slug,
        title: body.title,
        description: body.description,
        coverImageUrl: body.coverImageUrl,
        startDateTime: new Date(body.startDateTime),
        paymentInfo: body.paymentInfo || null,
      },
    })

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Create event error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

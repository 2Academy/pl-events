import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const event = await prisma.event.findUnique({
    where: { slug: params.slug },
    include: {
      registrations: {
        include: {
          user: true,
        },
      },
    },
  })

  if (!event) {
    return NextResponse.json(
      { error: 'Event not found' },
      { status: 404 }
    )
  }

  return NextResponse.json(event)
}


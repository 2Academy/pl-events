/**
 * Utility script to export users data from the database
 * This demonstrates how data can be exported for migration purposes
 * 
 * Usage: npx tsx scripts/exportUsers.ts
 */

import { PrismaClient } from '@prisma/client'
import { writeFile } from 'fs/promises'
import { join } from 'path'

const prisma = new PrismaClient()

async function exportUsers() {
  try {
    const users = await prisma.user.findMany({
      include: {
        registrations: {
          include: {
            event: true,
          },
        },
      },
    })

    const exportData = {
      exportedAt: new Date().toISOString(),
      users: users.map((user) => ({
        id: user.id,
        telegramId: user.telegramId,
        telegramUsername: user.telegramUsername,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
        phone: user.phone,
        position: user.position,
        company: user.company,
        strongSkills: user.strongSkills,
        email: user.email,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
        registrations: user.registrations.map((reg) => ({
          id: reg.id,
          eventId: reg.eventId,
          eventSlug: reg.event.slug,
          expectations: reg.expectations,
          isPaid: reg.isPaid,
          paymentInfo: reg.paymentInfo,
          paymentReceiptUrl: reg.paymentReceiptUrl,
          createdAt: reg.createdAt.toISOString(),
        })),
      })),
    }

    const outputPath = join(process.cwd(), 'exports', `users-${Date.now()}.json`)
    await writeFile(outputPath, JSON.stringify(exportData, null, 2), 'utf-8')

    console.log(`Exported ${users.length} users to ${outputPath}`)
  } catch (error) {
    console.error('Export error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

exportUsers()


import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { sendApprovalEmail, sendSmsMessage } from '@/lib/email'
import { ApprovalUpdateDto } from '@/types'

function getVariationStatus(status: ApprovalUpdateDto['status']) {
  switch (status) {
    case 'APPROVED':
      return 'APPROVED'
    case 'REJECTED':
      return 'REJECTED'
    default:
      return 'CLIENT_REVIEW'
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: ApprovalUpdateDto = await request.json()

    if (!body.variationId) {
      return NextResponse.json({ error: 'Missing variationId' }, { status: 400 })
    }

    if (!['APPROVED', 'REJECTED', 'CHANGES_REQUESTED'].includes(body.status)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 })
    }

    const variation = await prisma.variation.findUnique({
      where: { id: body.variationId },
      include: {
        project: {
          include: {
            client: true,
          },
        },
      },
    })

    if (!variation) {
      return NextResponse.json({ error: 'Variation not found' }, { status: 404 })
    }

    const legacyVariation = variation as typeof variation & {
      projectName: string
      clientName: string
      clientEmail: string
      clientPhone: string
    }

    const projectName = variation.project?.name ?? legacyVariation.projectName
    const clientName = variation.project?.client.name ?? legacyVariation.clientName
    const clientEmail = variation.project?.client.email ?? legacyVariation.clientEmail
    const clientPhone = variation.project?.client.phone ?? legacyVariation.clientPhone

    const comments = body.signature
      ? `${body.comments?.trim() || ''}${body.comments ? '\n\n' : ''}Signed by: ${body.signature}`.trim()
      : body.comments?.trim()

    await prisma.approvals.create({
      data: {
        variationId: variation.id,
        email: clientEmail,
        status: body.status,
        comments,
        ipAddr: request.headers.get('x-forwarded-for') || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
        notified: true,
        notifiedAt: new Date(),
      },
    })

    const updatedVariation = await prisma.variation.update({
      where: { id: body.variationId },
      data: {
        status: getVariationStatus(body.status),
        approvalStatus: body.status,
        notes: comments ?? variation.notes,
      },
    })

    const notificationPromises = []

    if (clientEmail) {
      notificationPromises.push(
        sendApprovalEmail(
          {
            id: variation.id,
            projectName,
            clientName,
          },
          clientEmail,
          body.status,
          comments
        )
      )
    }

    if (clientPhone) {
      notificationPromises.push(
        sendSmsMessage(
          variation.id,
          clientPhone,
          `Update for ${projectName}: ${body.status.replace('_', ' ').toLowerCase()}`
        )
      )
    }

    await Promise.all(notificationPromises)

    return NextResponse.json({ success: true, variation: updatedVariation })
  } catch (error) {
    console.error('Error processing approval:', error)
    return NextResponse.json({ error: 'Failed to process approval' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const variationId = request.nextUrl.searchParams.get('variationId')

    if (!variationId) {
      return NextResponse.json({ error: 'Missing variationId query parameter' }, { status: 400 })
    }

    const approvals = await prisma.approvals.findMany({
      where: { variationId },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(approvals)
  } catch (error) {
    console.error('Error fetching approvals:', error)
    return NextResponse.json({ error: 'Failed to fetch approvals' }, { status: 500 })
  }
}

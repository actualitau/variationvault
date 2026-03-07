import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { sendApprovalEmail, sendSmsMessage } from '@/lib/email'
import { ApprovalUpdateDto, Variation } from '@types/index'

export async function POST(request: NextRequest) {
  try {
    const body: ApprovalUpdateDto = await request.json()
    const searchParams = request.nextUrl.searchParams
    const variationId = searchParams.get('variationId')
    
    if (!variationId) {
      return NextResponse.json(
        { error: 'Missing variationId query parameter' },
        { status: 400 }
      )
    }
    
    if (!['APPROVED', 'REJECTED', 'CHANGES_REQUESTED'].includes(body.status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      )
    }
    
    const variation = await prisma.variation.findUnique({ 
      where: { id: variationId },
      include: { variations: true }
    })
    
    if (!variation) {
      return NextResponse.json({ error: 'Variation not found' }, { status: 404 })
    }
    
    // Create approval record
    await prisma.approvals.create({
      data: {
        variationId: variation.id,
        email: request.headers.get('x-client-email') || 'anonymous',
        status: body.status,
        comments: body.comments,
      },
    })
    
    // Update variation status
    await prisma.variation.update({
      where: { id: variationId },
      data: { 
        status: 'CLIENT_REVIEW',
        approvalStatus: body.status,
      },
    })
    
    // Send notifications
    const notificationPromises = []
    
    if (variation.clientEmail) {
      notificationPromises.push(
        sendApprovalEmail(variation, variation.clientEmail, body.status, body.comments)
      )
    }
    
    if (variation.clientPhone) {
      notificationPromises.push(
        sendSmsMessage(
          variation.clientPhone,
          `Your ${body.status === 'APPROVED' ? 'approval' : 'action'} was received for ${variation.projectName}`
        )
      )
    }
    
    await Promise.all(notificationPromises)
    
    return NextResponse.json({ success: true, message: 'Approval processed' })
  } catch (error) {
    console.error('Error processing approval:', error)
    return NextResponse.json(
      { error: 'Failed to process approval' },
      { status: 500 }
    )
  }
}

// Get approval status for a variation
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const variationId = searchParams.get('variationId')
    
    if (!variationId) {
      return NextResponse.json(
        { error: 'Missing variationId query parameter' },
        { status: 400 }
      )
    }
    
    const approvals = await prisma.approvals.findMany({
      where: { variationId },
      orderBy: { createdAt: 'desc' }  
    })
    
    return NextResponse.json(approvals)
  } catch (error) {
    console.error('Error fetching approvals:', error)
    return NextResponse.json(
      { error: 'Failed to fetch approvals' },
      { status: 500 }
    )
  }
}

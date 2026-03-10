import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

const ALLOWED_STATUS = ['DRAFT', 'SENT', 'CLIENT_REVIEW', 'APPROVED', 'REJECTED', 'COMPLETED']

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string } > }
) {
  try {
    const { id } = await params
    const variation = await prisma.variation.findUnique({
      where: { id },
      include: {
        versionHistory: {
          orderBy: { version: 'desc' },
        },
      },
    })
    
    if (!variation) {
      return NextResponse.json({ error: 'Variation not found' }, { status: 404 })
    }
    
    return NextResponse.json(variation)
  } catch (error) {
    console.error('Error fetching variation:', error)
    return NextResponse.json(
      { error: 'Failed to fetch variation' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string } > }
) {
  try {
    const { id } = await params
    const data = await request.json()
    
    // Validate status update
    if (data.status && !ALLOWED_STATUS.includes(data.status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      )
    }
    
    const variation = await prisma.variation.findUnique({ where: { id } })
    if (!variation) {
      return NextResponse.json({ error: 'Variation not found' }, { status: 404 })
    }
    
    const updatedVariation = await prisma.variation.update({
      where: { id },
      data,
    })
    
    return NextResponse.json(updatedVariation)
  } catch (error) {
    console.error('Error updating variation:', error)
    return NextResponse.json(
      { error: 'Failed to update variation' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string } > }
) {
  try {
    const { id } = await params
    
    await prisma.variation.delete({
      where: { id },
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting variation:', error)
    return NextResponse.json(
      { error: 'Failed to delete variation' },
      { status: 500 }
    )
  }
}

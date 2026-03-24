import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import prisma from '@/lib/prisma'
import { generatePDF } from '@/lib/pdf'
import { CreateVariationDto } from '@/types'
import { uploadPublicBlob } from '@/lib/blob'

const createVariationSchema = {
  required: ['projectId', 'description', 'measurements', 'totalArea', 'items'] as const,
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateVariationDto = await request.json()
    const { images = [], ...variationData } = body

    const missing = createVariationSchema.required.filter((field) => !variationData[field])
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(', ')}`, errors: missing },
        { status: 400 }
      )
    }

    const project = await prisma.project.findUnique({
      where: { id: variationData.projectId },
      include: { client: true },
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const tax = variationData.tax ?? 0
    const totalLabor = variationData.totalLabor ?? 0
    const totalMaterials = variationData.totalMaterials ?? 0
    const total = totalLabor + totalMaterials + tax

    const createData = {
      projectId: project.code,
      projectName: project.name,
      clientName: project.client.name,
      clientEmail: project.client.email,
      clientPhone: project.client.phone,
      address: project.address,
      suburb: project.suburb,
      state: project.state,
      postcode: project.postcode,
      projectRefId: project.id,
      description: variationData.description,
      measurements: variationData.measurements,
      totalArea: variationData.totalArea,
      items: variationData.items,
      totalLabor,
      totalMaterials,
      tax,
      total,
      notes: variationData.notes,
      status: 'DRAFT',
      approvalStatus: 'PENDING',
      createdBy: request.headers.get('x-user-email') || 'system',
      versionHistory: {
        create: {
          version: 1,
          images,
          changes: 'Initial estimate created',
        },
      },
    } as Prisma.VariationUncheckedCreateInput

    const newVariation = await prisma.variation.create({
      data: createData,
      include: {
        project: {
          include: {
            client: true,
          },
        },
        versionHistory: true,
        approvals: true,
      },
    })

    const pdfBuffer = generatePDF({
      ...newVariation,
      projectName: project.name,
      clientName: project.client.name,
      clientEmail: project.client.email,
      clientPhone: project.client.phone,
      address: project.address,
      suburb: project.suburb,
      state: project.state,
      postcode: project.postcode,
    })

    const blob = await uploadPublicBlob(`exports/${newVariation.id}.pdf`, pdfBuffer, {
      contentType: 'application/pdf',
      cacheControlMaxAge: 60,
    })

    const updatedVariation = await prisma.variation.update({
      where: { id: newVariation.id },
      data: { pdfUrl: blob.url },
      include: {
        project: {
          include: {
            client: true,
          },
        },
        versionHistory: {
          orderBy: { version: 'desc' },
          take: 5,
        },
        approvals: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    return NextResponse.json(updatedVariation, { status: 201 })
  } catch (error) {
    console.error('Error creating variation:', error)
    return NextResponse.json(
      { error: 'Failed to create variation', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const variations = await prisma.variation.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        project: {
          include: {
            client: true,
          },
        },
        versionHistory: {
          orderBy: { version: 'desc' },
          take: 5,
        },
      },
    })

    return NextResponse.json(variations)
  } catch (error) {
    console.error('Error fetching variations:', error)
    return NextResponse.json({ error: 'Failed to fetch variations' }, { status: 500 })
  }
}

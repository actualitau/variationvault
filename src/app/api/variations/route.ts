import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { generatePDF } from '@/lib/pdf'
import { CreateVariationDto } from '@types/index'
import { writeFile, mkdir, ensureDir } from 'fs/promises'
import { join, existsSync } from 'path'

const UPLOAD_DIR = join(process.cwd(), 'public/uploads')

const createVariationSchema = {
  required: [
    'projectId', 'projectName', 'clientName', 'clientEmail', 
    'clientPhone', 'address', 'suburb', 'state', 'postcode'
  ]
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateVariationDto = await request.json()
    
    const requiredFields = createVariationSchema.required
    const missing = requiredFields.filter(field => !body[field])
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(', ')}`, errors: missing },
        { status: 400 }
      )
    }
    
    const newVariation = await prisma.variation.create({
      data: {
        ...body,
        status: 'DRAFT',
        approvalStatus: 'PENDING',
        tax: 0, // Will be calculated in frontend
      },
    })
    
    // Generate initial PDF
    if (!existsSync(UPLOAD_DIR)) {
      await ensureDir(UPLOAD_DIR)
    }
    
    const pdfBuffer = generatePDF(newVariation)
    const pdfFilename = `${newVariation.id}.pdf`
    await writeFile(join(UPLOAD_DIR, pdfFilename), pdfBuffer)
    
    const updatedVariation = await prisma.variation.update({
      where: { id: newVariation.id },
      data: { pdfUrl: `/uploads/${pdfFilename}` },
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
        versionHistory: {
          orderBy: { version: 'desc' },
          take: 5
        }
      },
    })
    
    return NextResponse.json(variations)
  } catch (error) {
    console.error('Error fetching variations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch variations' },
      { status: 500 }
    )
  }
}

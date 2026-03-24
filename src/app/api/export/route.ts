import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { generatePDF } from '@/lib/pdf'
import { uploadPublicBlob } from '@/lib/blob'

export const dynamic = 'force-dynamic'

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
    
    const variation = await prisma.variation.findUnique({ 
      where: { id: variationId },
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
      address: string
      suburb: string
      state: string
      postcode: string
    }

    const projectName = variation.project?.name ?? legacyVariation.projectName
    const clientName = variation.project?.client.name ?? legacyVariation.clientName
    const clientEmail = variation.project?.client.email ?? legacyVariation.clientEmail
    const clientPhone = variation.project?.client.phone ?? legacyVariation.clientPhone
    const address = variation.project?.address ?? legacyVariation.address
    const suburb = variation.project?.suburb ?? legacyVariation.suburb
    const state = variation.project?.state ?? legacyVariation.state
    const postcode = variation.project?.postcode ?? legacyVariation.postcode
    
    // Generate fresh PDF
    const pdfBuffer = generatePDF({
      ...variation,
      projectName,
      clientName,
      clientEmail,
      clientPhone,
      address,
      suburb,
      state,
      postcode,
    })
    const blob = await uploadPublicBlob(`exports/${variationId}.pdf`, pdfBuffer, {
      contentType: 'application/pdf',
      cacheControlMaxAge: 60,
    })
    
    // Update variation with new PDF URL
    await prisma.variation.update({
      where: { id: variationId },
      data: { pdfUrl: blob.url },
    })

    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="estimate.pdf"',
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error) {
    console.error('Error exporting PDF:', error)
    return NextResponse.json(
      { error: 'Failed to export PDF' },
      { status: 500 }
    )
  }
}

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

    if (!variation.project) {
      return NextResponse.json({ error: 'Variation is missing a linked project' }, { status: 409 })
    }
    
    // Generate fresh PDF
    const pdfBuffer = generatePDF({
      ...variation,
      projectName: variation.project.name,
      clientName: variation.project.client.name,
      clientEmail: variation.project.client.email,
      clientPhone: variation.project.client.phone,
      address: variation.project.address,
      suburb: variation.project.suburb,
      state: variation.project.state,
      postcode: variation.project.postcode,
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

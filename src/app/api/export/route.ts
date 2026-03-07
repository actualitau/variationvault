import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { generatePDF } from '@/lib/pdf'
import { writeFile, ensureDir, readFile } from 'fs/promises'
import { join, existsSync } from 'path'

const UPLOAD_DIR = join(process.cwd(), 'public/uploads')

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
      where: { id: variationId }
    })
    
    if (!variation) {
      return NextResponse.json({ error: 'Variation not found' }, { status: 404 })
    }
    
    // Generate fresh PDF
    const pdfBuffer = generatePDF(variation)
    const pdfFilename = `${variationId}.pdf`
    const filePath = join(UPLOAD_DIR, pdfFilename)
    
    if (!existsSync(UPLOAD_DIR)) {
      await ensureDir(UPLOAD_DIR)
    }
    
    await writeFile(filePath, pdfBuffer)
    
    // Update variation with new PDF URL
    await prisma.variation.update({
      where: { id: variationId },
      data: { pdfUrl: `/uploads/${pdfFilename}` },
    })
    
    const downloadedPdf = await readFile(filePath)
    
    return new NextResponse(downloadedPdf, {
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

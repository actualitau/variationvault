import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { writeFile, mkdir, ensureDir } from 'fs/promises'
import { join, existsSync } from 'path'

const UPLOAD_DIR = join(process.cwd(), 'public/uploads')

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }
    
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const extension = file.name.split('.').pop() || 'jpg'
    const filename = `${uuidv4()}.${extension}`
    const filePath = join(UPLOAD_DIR, filename)
    
    if (!existsSync(UPLOAD_DIR)) {
      await ensureDir(UPLOAD_DIR)
    }
    
    await writeFile(filePath, buffer)
    
    return NextResponse.json({
      success: true,
      url: `/uploads/${filename}`
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { error: 'Failed to upload file', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

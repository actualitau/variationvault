import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { uploadPublicBlob } from '@/lib/blob'

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
    const extension = file.name.split('.').pop() || 'jpg'
    const filename = `uploads/${uuidv4()}.${extension}`
    const blob = await uploadPublicBlob(filename, bytes, {
      contentType: file.type || undefined,
    })
    
    return NextResponse.json({
      success: true,
      url: blob.url
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { error: 'Failed to upload file', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

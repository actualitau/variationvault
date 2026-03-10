import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

const UPLOAD_DIR = join(process.cwd(), 'public/uploads')

type UploadedFile = {
  originalname: string
  buffer: Buffer
  mimetype: string
}

export async function uploadFile(file: UploadedFile): Promise<string> {
  const extension = file.originalname.split('.').pop()
  const filename = `${uuidv4()}.${extension}`
  const filePath = join(UPLOAD_DIR, filename)
  
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true })
  }
  
  await writeFile(filePath, file.buffer)
  
  return `/uploads/${filename}`
}

export function isImage(file: UploadedFile): boolean {
  return file.mimetype.startsWith('image/')
}

export function isBase64Image(base64: string): boolean {
  return /^(data:image\/[a-zA-Z]+;base64,)/.test(base64)
}

export function stripBase64Data(base64: string): string {
  return base64.split(',')[1]
}

export function formatNumber(num: number): string {
  return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export function formatCurrency(num: number): string {
  return `$${formatNumber(num)}`
}

export function formatPhone(phone: string): string {
  return phone.replace(/\D/g, '').slice(-10)
}

import { put } from '@vercel/blob'

function ensureBlobToken() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error('BLOB_READ_WRITE_TOKEN is not configured')
  }
}

export async function uploadPublicBlob(
  pathname: string,
  body: Blob | ArrayBuffer | Buffer,
  options?: {
    contentType?: string
    addRandomSuffix?: boolean
    cacheControlMaxAge?: number
  }
) {
  ensureBlobToken()

  const blob = await put(pathname, body, {
    access: 'public',
    addRandomSuffix: options?.addRandomSuffix ?? false,
    contentType: options?.contentType,
    cacheControlMaxAge: options?.cacheControlMaxAge,
  })

  return blob
}

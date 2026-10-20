/**
 * src/lib/storage.ts — Supabase Storage & Client-Side Image Compression (Step 2.3)
 *
 * Compresses trade chart screenshots to WebP format client-side using
 * browser-image-compression and uploads them to the 'trade-screenshots' bucket.
 */

import imageCompression from 'browser-image-compression'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export interface ImageUploadResult {
  url: string
  originalSizeKB: number
  compressedSizeKB: number
  compressionRatioPct: number
}

const BUCKET_NAME = 'trade-screenshots'

/**
 * Compresses an image file client-side to WebP format.
 * Reduces file size by up to 80-90% before uploading over the network.
 */
export async function compressTradeImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 1,               // Max size 1MB
    maxWidthOrHeight: 1920,     // 1080p / 1440p chart clarity
    useWebWorker: true,
    fileType: 'image/webp',
    initialQuality: 0.85,
  }

  try {
    const compressedBlob = await imageCompression(file, options)
    const newName = file.name.replace(/\.[^/.]+$/, '') + '.webp'
    return new File([compressedBlob], newName, { type: 'image/webp' })
  } catch {
    // If WebP compression fails, return original file
    return file
  }
}

/**
 * Compresses and uploads a chart screenshot to the Supabase 'trade-screenshots' bucket.
 * In local/demo mode (without active Supabase storage), generates a local Data URL.
 */
export async function uploadTradeScreenshot(file: File): Promise<ImageUploadResult> {
  const originalSizeKB = Math.round(file.size / 1024)

  // 1. Client-side compression
  const compressedFile = await compressTradeImage(file)
  const compressedSizeKB = Math.round(compressedFile.size / 1024)
  const compressionRatioPct =
    originalSizeKB > 0
      ? Math.round(((originalSizeKB - compressedSizeKB) / originalSizeKB) * 100)
      : 0

  // 2. Upload to Supabase bucket if configured
  if (isSupabaseConfigured) {
    try {
      const sanitizedName = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[^a-zA-Z0-9-_]/g, '_')
      const filePath = `${Date.now()}_${sanitizedName}.webp`

      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, compressedFile, {
          contentType: 'image/webp',
          cacheControl: '31536000',
          upsert: false,
        })

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(data.path)

        return {
          url: publicUrlData.publicUrl,
          originalSizeKB,
          compressedSizeKB,
          compressionRatioPct,
        }
      }
    } catch {
      // Fall through to local fallback
    }
  }

  // 3. Local/Offline fallback: Convert to Data URL for instant preview & persistence
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      resolve({
        url: reader.result as string,
        originalSizeKB,
        compressedSizeKB,
        compressionRatioPct,
      })
    }
    reader.onerror = () => reject(new Error('Failed to read image file'))
    reader.readAsDataURL(compressedFile)
  })
}

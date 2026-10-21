import { describe, it, expect, vi } from 'vitest'
import { compressTradeImage, uploadTradeScreenshot } from '@/lib/storage'

vi.mock('browser-image-compression', () => ({
  default: vi.fn(async (file: File) => {
    // Return a smaller mock Blob representing compressed WebP
    return new Blob([new Uint8Array(Math.max(10, Math.floor(file.size / 2)))], {
      type: 'image/webp',
    })
  }),
}))

describe('Storage & Image Compression (Step 2.3)', () => {
  it('compresses an image file client-side to WebP format', async () => {
    const originalFile = new File(['mock image file content buffer'], 'chart-setup.png', {
      type: 'image/png',
    })

    const compressed = await compressTradeImage(originalFile)

    expect(compressed.name).toBe('chart-setup.webp')
    expect(compressed.type).toBe('image/webp')
  })

  it('uploads a screenshot and returns upload metrics with local fallback URL', async () => {
    const originalFile = new File(['x'.repeat(4096)], 'setup-breakout.jpg', {
      type: 'image/jpeg',
    })

    const result = await uploadTradeScreenshot(originalFile)

    expect(result).toHaveProperty('url')
    expect(typeof result.url).toBe('string')
    expect(result.originalSizeKB).toBeGreaterThanOrEqual(0)
    expect(result.compressedSizeKB).toBeGreaterThanOrEqual(0)
    expect(result.compressionRatioPct).toBeGreaterThanOrEqual(0)
  })
})

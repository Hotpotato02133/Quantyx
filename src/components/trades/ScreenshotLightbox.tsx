import { useState, useEffect, useCallback } from 'react'
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
} from 'lucide-react'

interface ScreenshotLightboxProps {
  images: string[]
  initialIndex?: number
  isOpen: boolean
  onClose: () => void
  tradeSymbol?: string
}

export function ScreenshotLightbox({
  images,
  initialIndex = 0,
  isOpen,
  onClose,
  tradeSymbol = 'Trade',
}: ScreenshotLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [zoomLevel, setZoomLevel] = useState(1)

  useEffect(() => {
    setCurrentIndex(initialIndex)
    setZoomLevel(1)
  }, [initialIndex, isOpen])

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
    setZoomLevel(1)
  }, [images.length])

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
    setZoomLevel(1)
  }, [images.length])

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') handlePrev()
      if (e.key === 'ArrowRight') handleNext()
      if (e.key === '+' || e.key === '=') setZoomLevel((z) => Math.min(z + 0.25, 3))
      if (e.key === '-') setZoomLevel((z) => Math.max(z - 0.25, 0.5))
      if (e.key === '0') setZoomLevel(1)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleNext, handlePrev, onClose])

  if (!isOpen || images.length === 0) return null

  const currentImg = images[currentIndex]

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Screenshot Lightbox"
      className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200 select-none"
    >
      {/* Top Bar */}
      <div className="w-full flex items-center justify-between px-4 py-2 border-b border-white/[0.08] text-[#F4F4F5]">
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm font-semibold tracking-wider text-profit">
            {tradeSymbol}
          </span>
          <span className="text-xs text-[#A1A1AA]">
            Chart Screenshot {currentIndex + 1} of {images.length}
          </span>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.5))}
            className="p-1.5 rounded hover:bg-white/[0.1] text-[#A1A1AA] hover:text-[#F4F4F5] transition-colors"
            title="Zoom Out (-)"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="font-mono text-xs text-[#A1A1AA] w-12 text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 3))}
            className="p-1.5 rounded hover:bg-white/[0.1] text-[#A1A1AA] hover:text-[#F4F4F5] transition-colors"
            title="Zoom In (+)"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            onClick={() => setZoomLevel(1)}
            className="p-1.5 rounded hover:bg-white/[0.1] text-[#A1A1AA] hover:text-[#F4F4F5] transition-colors"
            title="Reset Zoom (0)"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <div className="h-4 w-px bg-white/[0.12] mx-1" />
          <a
            href={currentImg}
            download={`${tradeSymbol}_chart_${currentIndex + 1}.webp`}
            target="_blank"
            rel="noreferrer"
            className="p-1.5 rounded hover:bg-white/[0.1] text-[#A1A1AA] hover:text-[#F4F4F5] transition-colors"
            title="Download Image"
          >
            <Download className="h-4 w-4" />
          </a>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-white/[0.1] text-[#A1A1AA] hover:text-[#EF4444] transition-colors ml-2"
            title="Close (Esc)"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div className="relative flex-1 w-full flex items-center justify-center overflow-hidden my-2">
        {images.length > 1 && (
          <button
            onClick={handlePrev}
            className="absolute left-4 z-10 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/[0.15] backdrop-blur transition-transform active:scale-95"
            aria-label="Previous screenshot"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}

        <div className="max-w-full max-h-full flex items-center justify-center overflow-auto p-2">
          <img
            src={currentImg}
            alt={`${tradeSymbol} trade setup`}
            style={{ transform: `scale(${zoomLevel})` }}
            className="max-h-[80vh] max-w-[90vw] object-contain rounded-lg border border-border shadow-2xl transition-transform duration-150 ease-out"
          />
        </div>

        {images.length > 1 && (
          <button
            onClick={handleNext}
            className="absolute right-4 z-10 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/[0.15] backdrop-blur transition-transform active:scale-95"
            aria-label="Next screenshot"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Bottom Thumbnail Strip */}
      {images.length > 1 && (
        <div className="flex items-center gap-2 py-2 px-4 rounded-xl bg-surface/80 border border-white/[0.08] max-w-full overflow-x-auto">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentIndex(idx)
                setZoomLevel(1)
              }}
              className={`relative h-14 w-24 rounded-md overflow-hidden border-2 transition-all flex-shrink-0 ${
                idx === currentIndex
                  ? 'border-profit scale-105 shadow-md shadow-profit/20'
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img src={img} alt="Thumbnail" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

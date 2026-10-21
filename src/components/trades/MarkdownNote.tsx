import React from 'react'
import { cn } from '@/lib/cn'

interface MarkdownNoteProps {
  content: string
  className?: string
}

/**
 * Lightweight, safe Markdown renderer for trader notes.
 * Formats headers, bullet lists, bold text, italic text, blockquotes, and code snippets.
 */
export function MarkdownNote({ content, className }: MarkdownNoteProps) {
  if (!content) return null

  const lines = content.replace(/\\n/g, '\n').split(/\r?\n/)

  return (
    <div className={cn('space-y-1.5 text-xs text-[#D4D4D8] leading-relaxed', className)}>
      {lines.map((line, idx) => {
        const trimmed = line.trim()
        if (!trimmed) {
          return <div key={idx} className="h-1.5" />
        }

        // Heading 1 (# ...)
        if (trimmed.startsWith('# ')) {
          return (
            <h4 key={idx} className="font-semibold text-sm text-[#F4F4F5] pt-1 pb-0.5 border-b border-border/40">
              {renderFormattedText(trimmed.replace(/^#\s+/, ''))}
            </h4>
          )
        }

        // Heading 2/3 (## ... or ### ...)
        if (trimmed.startsWith('## ') || trimmed.startsWith('### ')) {
          return (
            <h5 key={idx} className="font-semibold text-xs text-[#F4F4F5] pt-1">
              {renderFormattedText(trimmed.replace(/^#{2,3}\s+/, ''))}
            </h5>
          )
        }

        // Blockquote (> ...)
        if (trimmed.startsWith('>')) {
          return (
            <blockquote
              key={idx}
              className="border-l-2 border-profit/60 pl-2.5 py-0.5 text-xs italic text-[#A1A1AA] bg-profit/[0.03] rounded-r"
            >
              {renderFormattedText(trimmed.replace(/^>\s*/, ''))}
            </blockquote>
          )
        }

        // Bullet list item (- ... or * ...)
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <div key={idx} className="flex items-start gap-1.5 pl-1.5">
              <span className="text-profit font-bold select-none text-[11px] leading-tight">•</span>
              <span className="flex-1">{renderFormattedText(trimmed.replace(/^[-*]\s+/, ''))}</span>
            </div>
          )
        }

        // Numbered list item (1. ...)
        const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)/)
        if (numberedMatch) {
          return (
            <div key={idx} className="flex items-start gap-1.5 pl-1.5">
              <span className="font-mono text-profit text-[10px] select-none font-semibold leading-tight">
                {numberedMatch[1]}.
              </span>
              <span className="flex-1">{renderFormattedText(numberedMatch[2])}</span>
            </div>
          )
        }

        // Standard paragraph
        return (
          <p key={idx}>
            {renderFormattedText(line)}
          </p>
        )
      })}
    </div>
  )
}

/**
 * Parses inline formatting: **bold**, *italic*, and `code`
 */
function renderFormattedText(text: string): React.ReactNode {
  // Regex to split by bold (**text**), italic (*text*), and code (`text`)
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g)

  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-[#F4F4F5]">
          {part.slice(2, -2)}
        </strong>
      )
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <em key={i} className="italic text-[#E4E4E7]">
          {part.slice(1, -1)}
        </em>
      )
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={i}
          className="rounded bg-white/[0.08] px-1 py-0.5 font-mono text-[11px] text-profit border border-white/[0.08]"
        >
          {part.slice(1, -1)}
        </code>
      )
    }
    return part
  })
}

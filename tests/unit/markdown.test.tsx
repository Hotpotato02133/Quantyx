import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MarkdownNote } from '@/components/trades/MarkdownNote'

describe('MarkdownNote Component (Step 3.4)', () => {
  it('renders nothing when content is empty', () => {
    const { container } = render(<MarkdownNote content="" />)
    expect(container.firstChild).toBeNull()
  })

  it('renders h4 header for lines starting with #', () => {
    render(<MarkdownNote content="# Context and Market Conditions" />)
    const heading = screen.getByRole('heading', { level: 4 })
    expect(heading).toHaveTextContent('Context and Market Conditions')
  })

  it('renders h5 subheadings for lines starting with ## or ###', () => {
    render(<MarkdownNote content="## Execution Details" />)
    const heading = screen.getByRole('heading', { level: 5 })
    expect(heading).toHaveTextContent('Execution Details')
  })

  it('renders bullet list items with bullet glyph', () => {
    render(<MarkdownNote content="- Waited for 15m candle close\n- Confirmed CVD divergence" />)
    expect(screen.getByText('Waited for 15m candle close')).toBeInTheDocument()
    expect(screen.getByText('Confirmed CVD divergence')).toBeInTheDocument()
  })

  it('renders blockquotes for lines starting with >', () => {
    render(<MarkdownNote content="> A+ ICT Silver Bullet setup taken at NY Open" />)
    const quote = screen.getByText('A+ ICT Silver Bullet setup taken at NY Open')
    expect(quote.closest('blockquote')).toBeInTheDocument()
  })

  it('formats bold, italic, and inline code correctly', () => {
    render(<MarkdownNote content="Risked **$250** with `SL=20350` and *strict discipline*" />)
    expect(screen.getByText('$250').tagName).toBe('STRONG')
    expect(screen.getByText('strict discipline').tagName).toBe('EM')
    expect(screen.getByText('SL=20350').tagName).toBe('CODE')
  })
})

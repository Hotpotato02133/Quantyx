import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

describe('ShadCN UI Base Components (Step 1.1)', () => {
  describe('Button', () => {
    it('renders with default variant and responds to click', () => {
      let clicked = false
      render(<Button onClick={() => { clicked = true }}>Click Me</Button>)
      const btn = screen.getByRole('button', { name: /click me/i })
      expect(btn).toBeInTheDocument()
      fireEvent.click(btn)
      expect(clicked).toBe(true)
    })

    it('renders loading state with disabled attribute', () => {
      render(<Button loading>Submit</Button>)
      const btn = screen.getByRole('button')
      expect(btn).toBeDisabled()
      expect(btn).toHaveTextContent('Submit')
    })

    it('applies profit variant styling tokens', () => {
      render(<Button variant="profit">Profit Button</Button>)
      const btn = screen.getByRole('button')
      expect(btn.className).toContain('text-profit')
    })
  })

  describe('Badge', () => {
    it('renders financial profit and warning variants', () => {
      const { rerender } = render(<Badge variant="profit">+$500.00</Badge>)
      expect(screen.getByText('+$500.00')).toBeInTheDocument()

      rerender(<Badge variant="warning">Breakeven</Badge>)
      expect(screen.getByText('Breakeven')).toBeInTheDocument()
    })

    it('applies tabular-nums class when tabular prop is true', () => {
      render(<Badge tabular>12.50R</Badge>)
      const badge = screen.getByText('12.50R')
      expect(badge.className).toContain('tabular-nums')
    })
  })

  describe('Table', () => {
    it('renders table headers and tabular cells properly', () => {
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Symbol</TableHead>
              <TableHead>PnL</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>NQ1!</TableCell>
              <TableCell tabular>+$540.00</TableCell>
            </TableRow>
          </TableBody>
        </Table>,
      )
      expect(screen.getByText('Symbol')).toBeInTheDocument()
      expect(screen.getByText('+$540.00')).toHaveClass('tabular-nums')
    })
  })

  describe('Tabs', () => {
    it('switches tab content on click', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>,
      )
      expect(screen.getByText('Content 1')).toBeInTheDocument()
      expect(screen.queryByText('Content 2')).not.toBeInTheDocument()

      fireEvent.click(screen.getByRole('tab', { name: 'Tab 2' }))
      expect(screen.queryByText('Content 1')).not.toBeInTheDocument()
      expect(screen.getByText('Content 2')).toBeInTheDocument()
    })
  })
})

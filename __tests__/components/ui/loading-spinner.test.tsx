import React from 'react'
import { render, screen } from '@testing-library/react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

describe('LoadingSpinner Component', () => {
  describe('Basic Rendering', () => {
    it('renders spinner without text', () => {
      render(<LoadingSpinner />)
      
      const spinner = screen.getByTestId('loading-spinner')
      expect(spinner).toBeInTheDocument()
    })

    it('renders spinner with text', () => {
      render(<LoadingSpinner text="Loading..." />)
      
      expect(screen.getByText('Loading...')).toBeInTheDocument()
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    })

    it('renders without text when text prop is not provided', () => {
      render(<LoadingSpinner />)
      
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
    })
  })

  describe('Size Variants', () => {
    it('renders small size correctly', () => {
      const { container } = render(<LoadingSpinner size="sm" />)
      
      const spinner = container.querySelector('.h-4.w-4')
      expect(spinner).toBeInTheDocument()
    })

    it('renders medium size correctly (default)', () => {
      const { container } = render(<LoadingSpinner />)
      
      const spinner = container.querySelector('.h-6.w-6')
      expect(spinner).toBeInTheDocument()
    })

    it('renders large size correctly', () => {
      const { container } = render(<LoadingSpinner size="lg" />)
      
      const spinner = container.querySelector('.h-8.w-8')
      expect(spinner).toBeInTheDocument()
    })
  })

  describe('Styling', () => {
    it('applies default styling classes', () => {
      const { container } = render(<LoadingSpinner />)
      
      const spinnerContainer = container.querySelector('.flex.items-center.justify-center')
      expect(spinnerContainer).toBeInTheDocument()
      
      const spinner = container.querySelector('.animate-spin.text-blue-600')
      expect(spinner).toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = render(<LoadingSpinner className="custom-class" />)
      
      const spinnerContainer = container.querySelector('.custom-class')
      expect(spinnerContainer).toBeInTheDocument()
    })

    it('applies text styling when text is provided', () => {
      const { container } = render(<LoadingSpinner text="Loading..." />)
      
      const textElement = container.querySelector('.ml-2.text-sm.text-gray-600')
      expect(textElement).toBeInTheDocument()
      expect(textElement).toHaveTextContent('Loading...')
    })
  })

  describe('Animation', () => {
    it('has spinning animation class', () => {
      const { container } = render(<LoadingSpinner />)
      
      const spinner = container.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('provides proper test id for testing', () => {
      render(<LoadingSpinner />)
      
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    })

    it('maintains proper semantic structure with text', () => {
      render(<LoadingSpinner text="Loading data..." />)
      
      const container = screen.getByTestId('loading-spinner').parentElement
      expect(container).toHaveClass('flex', 'items-center', 'justify-center')
    })
  })

  describe('Edge Cases', () => {
    it('handles empty text string', () => {
      const { container } = render(<LoadingSpinner text="" />)
      
      // When text is empty, no text span should be rendered
      const textElement = container.querySelector('.ml-2.text-sm.text-gray-600')
      expect(textElement).not.toBeInTheDocument()
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    })

    it('handles long text gracefully', () => {
      const longText = 'This is a very long loading text that should handle gracefully without breaking the layout'
      render(<LoadingSpinner text={longText} />)
      
      expect(screen.getByText(longText)).toBeInTheDocument()
    })

    it('combines custom className with default classes', () => {
      const { container } = render(<LoadingSpinner className="my-custom-class additional-class" />)
      
      const spinnerContainer = container.firstChild
      expect(spinnerContainer).toHaveClass('my-custom-class', 'additional-class', 'flex', 'items-center', 'justify-center')
    })
  })
})

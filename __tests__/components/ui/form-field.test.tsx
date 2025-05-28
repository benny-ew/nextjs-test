import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormField, FormTextarea, FormSelect } from '@/components/ui/form-field'

describe('FormField Component', () => {
  const defaultProps = {
    id: 'test-field',
    label: 'Test Field',
    placeholder: 'Enter text',
  }

  describe('Basic Rendering', () => {
    it('renders with label and input', () => {
      render(<FormField {...defaultProps} />)
      
      expect(screen.getByLabelText('Test Field')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
    })

    it('renders required indicator when required prop is true', () => {
      render(<FormField {...defaultProps} required />)
      
      expect(screen.getByText('*')).toBeInTheDocument()
      expect(screen.getByText('*')).toHaveClass('text-red-500')
    })

    it('renders help text when provided', () => {
      render(<FormField {...defaultProps} helpText="This is help text" />)
      
      expect(screen.getByText('This is help text')).toBeInTheDocument()
    })

    it('applies disabled state correctly', () => {
      render(<FormField {...defaultProps} disabled />)
      
      const input = screen.getByLabelText('Test Field')
      expect(input).toBeDisabled()
    })
  })

  describe('Validation States', () => {
    it('shows error message when error is provided', () => {
      render(<FormField {...defaultProps} error="This field is required" touched />)
      
      expect(screen.getByText('This field is required')).toBeInTheDocument()
      // Check that the error message container has the red color class
      const errorContainer = screen.getByText('This field is required').closest('div')
      expect(errorContainer).toHaveClass('text-red-600')
    })

    it('shows field error when fieldError is provided', () => {
      render(<FormField {...defaultProps} fieldError="Field validation failed" touched />)
      
      expect(screen.getByText('Field validation failed')).toBeInTheDocument()
    })

    it('prioritizes error over fieldError when both are provided', () => {
      render(<FormField {...defaultProps} error="Main error" fieldError="Field error" touched />)
      
      expect(screen.getByText('Main error')).toBeInTheDocument()
      expect(screen.queryByText('Field error')).not.toBeInTheDocument()
    })

    it('shows validation icon when field is valid and touched', () => {
      render(<FormField {...defaultProps} touched value="test value" validIcon />)
      
      const checkIcon = screen.getByTestId('check-circle-icon')
      expect(checkIcon).toBeInTheDocument()
    })

    it('shows error icon when field has error', () => {
      render(<FormField {...defaultProps} error="Error message" touched validIcon />)
      
      const errorIcon = screen.getByTestId('alert-circle-icon')
      expect(errorIcon).toBeInTheDocument()
    })

    it('applies error styling to input when error exists', () => {
      render(<FormField {...defaultProps} error="Error message" touched />)
      
      const input = screen.getByLabelText('Test Field')
      expect(input).toHaveClass('border-red-500')
    })

    it('applies valid styling to input when field is valid', () => {
      render(<FormField {...defaultProps} touched value="test value" validIcon />)
      
      const input = screen.getByLabelText('Test Field')
      expect(input).toHaveClass('border-green-500')
    })
  })

  describe('Character Count', () => {
    it('shows character count when showCharCount is true', () => {
      render(<FormField {...defaultProps} showCharCount maxLength={100} value="test" />)
      
      expect(screen.getByText('4/100')).toBeInTheDocument()
    })

    it('applies warning color when approaching character limit', () => {
      const longValue = 'a'.repeat(95) // 95 > 90 (90% of 100) should be yellow
      render(<FormField {...defaultProps} showCharCount maxLength={100} value={longValue} />)
      
      const charCount = screen.getByText('95/100')
      expect(charCount).toHaveClass('text-yellow-500')
    })

    it('applies error color when exceeding character limit', () => {
      const longValue = 'a'.repeat(105)
      render(<FormField {...defaultProps} showCharCount maxLength={100} value={longValue} />)
      
      const charCount = screen.getByText('105/100')
      expect(charCount).toHaveClass('text-red-500')
    })

    it('shows character count without maxLength', () => {
      render(<FormField {...defaultProps} showCharCount value="test" />)
      
      expect(screen.getByText('4 characters')).toBeInTheDocument()
    })
  })

  describe('Registration and Events', () => {
    it('applies registration props to input', () => {
      const mockRegistration = {
        name: 'testField',
        onChange: jest.fn(),
        onBlur: jest.fn(),
        ref: jest.fn(),
      }

      render(<FormField {...defaultProps} registration={mockRegistration} />)
      
      const input = screen.getByLabelText('Test Field')
      expect(input).toHaveAttribute('name', 'testField')
    })

    it('calls registration onChange when input changes', async () => {
      const mockOnChange = jest.fn()
      const mockRegistration = {
        name: 'testField',
        onChange: mockOnChange,
        onBlur: jest.fn(),
        ref: jest.fn(),
      }

      render(<FormField {...defaultProps} registration={mockRegistration} />)
      
      const input = screen.getByLabelText('Test Field')
      await userEvent.type(input, 'test')
      
      expect(mockOnChange).toHaveBeenCalled()
    })
  })

  describe('Different Input Types', () => {
    it('renders email input type correctly', () => {
      render(<FormField {...defaultProps} type="email" />)
      
      const input = screen.getByLabelText('Test Field')
      expect(input).toHaveAttribute('type', 'email')
    })

    it('renders password input type correctly', () => {
      render(<FormField {...defaultProps} type="password" />)
      
      const input = screen.getByLabelText('Test Field')
      expect(input).toHaveAttribute('type', 'password')
    })

    it('renders number input type correctly', () => {
      render(<FormField {...defaultProps} type="number" />)
      
      const input = screen.getByLabelText('Test Field')
      expect(input).toHaveAttribute('type', 'number')
    })
  })
})

describe('FormTextarea Component', () => {
  const defaultProps = {
    id: 'test-textarea',
    label: 'Test Textarea',
    placeholder: 'Enter description',
  }

  describe('Basic Rendering', () => {
    it('renders textarea with label', () => {
      render(<FormTextarea {...defaultProps} />)
      
      expect(screen.getByLabelText('Test Textarea')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Enter description')).toBeInTheDocument()
    })

    it('sets rows attribute correctly', () => {
      render(<FormTextarea {...defaultProps} rows={5} />)
      
      const textarea = screen.getByLabelText('Test Textarea')
      expect(textarea).toHaveAttribute('rows', '5')
    })

    it('applies disabled state correctly', () => {
      render(<FormTextarea {...defaultProps} disabled />)
      
      const textarea = screen.getByLabelText('Test Textarea')
      expect(textarea).toBeDisabled()
    })
  })

  describe('Validation', () => {
    it('shows error message', () => {
      render(<FormTextarea {...defaultProps} error="Description is required" touched />)
      
      expect(screen.getByText('Description is required')).toBeInTheDocument()
    })
  })

  describe('Character Count', () => {
    it('shows character count for textarea', () => {
      render(<FormTextarea {...defaultProps} showCharCount maxLength={500} value="test" />)
      
      expect(screen.getByText('4/500')).toBeInTheDocument()
    })
  })
})

describe('FormSelect Component', () => {
  const defaultProps = {
    id: 'test-select',
    label: 'Test Select',
    children: (
      <>
        <option value="">Select an option</option>
        <option value="option1">Option 1</option>
        <option value="option2">Option 2</option>
      </>
    ),
  }

  describe('Basic Rendering', () => {
    it('renders select with label and options', () => {
      render(<FormSelect {...defaultProps} />)
      
      expect(screen.getByLabelText('Test Select')).toBeInTheDocument()
      expect(screen.getByText('Select an option')).toBeInTheDocument()
      expect(screen.getByText('Option 1')).toBeInTheDocument()
      expect(screen.getByText('Option 2')).toBeInTheDocument()
    })

    it('applies disabled state correctly', () => {
      render(<FormSelect {...defaultProps} disabled />)
      
      const select = screen.getByLabelText('Test Select')
      expect(select).toBeDisabled()
    })
  })

  describe('Validation', () => {
    it('shows error message', () => {
      render(<FormSelect {...defaultProps} error="Please select an option" touched />)
      
      expect(screen.getByText('Please select an option')).toBeInTheDocument()
    })

    it('applies error styling when error exists', () => {
      render(<FormSelect {...defaultProps} error="Error message" touched />)
      
      const select = screen.getByLabelText('Test Select')
      expect(select).toHaveClass('border-red-500')
    })
  })

  describe('Selection', () => {
    it('handles option selection', async () => {
      render(<FormSelect {...defaultProps} />)
      
      const select = screen.getByLabelText('Test Select')
      await userEvent.selectOptions(select, 'option1')
      
      expect(select).toHaveValue('option1')
    })

    it('calls registration onChange when selection changes', async () => {
      const mockOnChange = jest.fn()
      const mockRegistration = {
        name: 'testSelect',
        onChange: mockOnChange,
        onBlur: jest.fn(),
        ref: jest.fn(),
      }

      render(<FormSelect {...defaultProps} registration={mockRegistration} />)
      
      const select = screen.getByLabelText('Test Select')
      await userEvent.selectOptions(select, 'option1')
      
      expect(mockOnChange).toHaveBeenCalled()
    })
  })
})

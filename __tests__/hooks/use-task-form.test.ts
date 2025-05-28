import { renderHook, act } from '@testing-library/react'
import { useTaskForm } from '@/hooks/use-task-form'
import { Task } from '@/types/task'

// Mock the hooks and dependencies
jest.mock('@tanstack/react-query', () => ({
  useMutation: jest.fn(() => ({
    mutateAsync: jest.fn().mockResolvedValue({}),
    isPending: false,
    error: null,
  })),
}))

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}))

jest.mock('react-hook-form', () => ({
  useForm: jest.fn(() => ({
    register: jest.fn(() => ({
      name: 'test',
      onChange: jest.fn(),
      onBlur: jest.fn(),
      ref: jest.fn(),
    })),
    handleSubmit: jest.fn((fn: any) => {
      // Return a function that calls the submit handler
      return jest.fn((event?: any) => {
        event?.preventDefault?.()
        // Call the submit function with mock data and return the promise
        return fn({
          title: 'Test Task',
          description: 'Test Description',
          status: 'TO_DO' as const,
        })
      })
    }),
    watch: jest.fn(() => ''),
    reset: jest.fn(),
    getValues: jest.fn(() => ({
      title: 'Test Task',
      description: 'Test Description',
      status: 'TO_DO' as const,
    })),
    setValue: jest.fn(),
    clearErrors: jest.fn(),
    formState: {
      errors: {},
    },
  })),
  useController: jest.fn(),
}))

jest.mock('@/hooks/use-tasks', () => ({
  useCreateTask: jest.fn(() => ({
    mutateAsync: jest.fn().mockResolvedValue({}),
    isPending: false,
    error: null,
  })),
  useUpdateTask: jest.fn(() => ({
    mutateAsync: jest.fn().mockResolvedValue({}),
    isPending: false,
    error: null,
  })),
}))

const mockTask: Task = {
  id: '1',
  title: 'Test Task',
  description: 'Test Description',
  status: 'TO_DO',
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
}

describe('useTaskForm Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Basic Hook Initialization', () => {
    it('initializes without task (create mode)', () => {
      const { result } = renderHook(() => useTaskForm({}))
      
      expect(result.current).toHaveProperty('register')
      expect(result.current).toHaveProperty('registerWithValidation')
      expect(result.current).toHaveProperty('registerTextareaWithValidation')
      expect(result.current).toHaveProperty('registerSelectWithValidation')
      expect(result.current).toHaveProperty('handleSubmit')
      expect(result.current).toHaveProperty('isLoading')
      expect(result.current).toHaveProperty('isEditing')
      expect(result.current).toHaveProperty('fieldErrors')
      expect(result.current).toHaveProperty('touched')
      expect(result.current.isEditing).toBe(false)
    })

    it('initializes with task (edit mode)', () => {
      const { result } = renderHook(() => useTaskForm({ task: mockTask }))
      
      expect(result.current.isEditing).toBe(true)
    })

    it('initializes with real-time validation enabled', () => {
      const { result } = renderHook(() => useTaskForm({ enableRealTimeValidation: true }))
      
      expect(result.current).toHaveProperty('fieldErrors')
      expect(result.current).toHaveProperty('touched')
    })
  })

  describe('Field Validation', () => {
    it('initializes with empty field errors', () => {
      const { result } = renderHook(() => useTaskForm({ enableRealTimeValidation: true }))
      
      expect(result.current.fieldErrors).toEqual({})
      expect(result.current.touched).toEqual({})
    })

    it('provides field blur handler', () => {
      const { result } = renderHook(() => useTaskForm({ enableRealTimeValidation: true }))
      
      expect(result.current).toHaveProperty('handleFieldBlur')
      expect(typeof result.current.handleFieldBlur).toBe('function')
    })

    it('handles field blur event', () => {
      const { result } = renderHook(() => useTaskForm({ enableRealTimeValidation: true }))
      
      act(() => {
        result.current.handleFieldBlur('title')
      })
      
      expect(result.current.touched.title).toBe(true)
    })
  })

  describe('Registration Functions', () => {
    it('provides input registration function', () => {
      const { result } = renderHook(() => useTaskForm({}))
      
      const registration = result.current.registerWithValidation('title')
      
      expect(registration).toHaveProperty('name')
      expect(registration).toHaveProperty('onChange')
      expect(registration).toHaveProperty('onBlur')
      expect(registration).toHaveProperty('ref')
    })

    it('provides textarea registration function', () => {
      const { result } = renderHook(() => useTaskForm({}))
      
      const registration = result.current.registerTextareaWithValidation('description')
      
      expect(registration).toHaveProperty('name')
      expect(registration).toHaveProperty('onChange')
      expect(registration).toHaveProperty('onBlur')
      expect(registration).toHaveProperty('ref')
    })

    it('provides select registration function', () => {
      const { result } = renderHook(() => useTaskForm({}))
      
      const registration = result.current.registerSelectWithValidation('status')
      
      expect(registration).toHaveProperty('name')
      expect(registration).toHaveProperty('onChange')
      expect(registration).toHaveProperty('onBlur')
      expect(registration).toHaveProperty('ref')
    })
  })

  describe('Form Submission', () => {
    it('provides handle submit function', () => {
      const { result } = renderHook(() => useTaskForm({}))
      
      expect(result.current).toHaveProperty('handleSubmit')
      expect(typeof result.current.handleSubmit).toBe('function')
    })

    it('calls onSuccess callback after successful submission', async () => {
      const onSuccess = jest.fn()
      const { result } = renderHook(() => useTaskForm({ onSuccess }))
      
      await act(async () => {
        // The handleSubmit is already wrapped, so call it directly
        const mockEvent = { preventDefault: jest.fn() }
        await result.current.handleSubmit(mockEvent as any)
      })
      
      expect(onSuccess).toHaveBeenCalled()
    })
  })

  describe('Loading States', () => {
    it('reports loading state correctly', () => {
      const { result } = renderHook(() => useTaskForm({}))
      
      expect(typeof result.current.isLoading).toBe('boolean')
    })

    it('reports error state correctly', () => {
      const { result } = renderHook(() => useTaskForm({}))
      
      expect(result.current.error).toBeNull()
    })
  })

  describe('Form State Management', () => {
    it('provides form state access', () => {
      const { result } = renderHook(() => useTaskForm({}))
      
      expect(result.current).toHaveProperty('formState')
      expect(result.current.formState).toHaveProperty('errors')
    })

    it('provides watch function', () => {
      const { result } = renderHook(() => useTaskForm({}))
      
      expect(result.current).toHaveProperty('watch')
      expect(typeof result.current.watch).toBe('function')
    })
  })

  describe('Utility Functions', () => {
    it('provides clear field error function', () => {
      const { result } = renderHook(() => useTaskForm({ enableRealTimeValidation: true }))
      
      expect(result.current).toHaveProperty('clearFieldError')
      expect(typeof result.current.clearFieldError).toBe('function')
    })

    it('provides clear all errors function', () => {
      const { result } = renderHook(() => useTaskForm({ enableRealTimeValidation: true }))
      
      expect(result.current).toHaveProperty('clearAllErrors')
      expect(typeof result.current.clearAllErrors).toBe('function')
    })

    it('clears field error when clearFieldError is called', () => {
      const { result } = renderHook(() => useTaskForm({ enableRealTimeValidation: true }))
      
      act(() => {
        result.current.handleFieldBlur('title')
        result.current.clearFieldError('title')
      })
      
      expect(result.current.fieldErrors.title).toBeUndefined()
    })

    it('clears all errors when clearAllErrors is called', () => {
      const { result } = renderHook(() => useTaskForm({ enableRealTimeValidation: true }))
      
      act(() => {
        result.current.handleFieldBlur('title')
        result.current.handleFieldBlur('description')
        result.current.clearAllErrors()
      })
      
      expect(result.current.fieldErrors).toEqual({})
      expect(result.current.touched).toEqual({})
    })
  })

  describe('Edge Cases', () => {
    it('handles undefined task gracefully', () => {
      const { result } = renderHook(() => useTaskForm({ task: undefined }))
      
      expect(result.current.isEditing).toBe(false)
    })

    it('handles missing onSuccess callback', () => {
      const { result } = renderHook(() => useTaskForm({}))
      
      expect(result.current).toBeDefined()
    })

  })

  describe('Real-time Validation', () => {
    it('validates fields in real-time when enabled', () => {
      const { result } = renderHook(() => useTaskForm({ enableRealTimeValidation: true }))
      
      expect(result.current).toHaveProperty('fieldErrors')
      expect(result.current).toHaveProperty('touched')
    })

    it('does not show validation errors initially', () => {
      const { result } = renderHook(() => useTaskForm({ enableRealTimeValidation: true }))
      
      expect(Object.keys(result.current.fieldErrors)).toHaveLength(0)
      expect(Object.keys(result.current.touched)).toHaveLength(0)
    })
  })
})
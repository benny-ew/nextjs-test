import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import CreateTaskPage from '@/app/tasks/create/page'
import EditTaskPage from '@/app/tasks/edit/[id]/page'
import { Task } from '@/types/task'

// Unmock react-hook-form and react-query for integration tests
jest.unmock('react-hook-form')
jest.unmock('@tanstack/react-query')

// Mock the Next.js router
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: jest.fn(),
  }),
  useParams: () => ({
    id: 'test-task-id',
  }),
}))

// Mock the task hooks
const mockCreateTask = jest.fn()
const mockUpdateTask = jest.fn()

jest.mock('@/hooks/use-tasks', () => ({
  useTask: jest.fn(),
  useCreateTask: () => ({
    mutateAsync: mockCreateTask,
    isPending: false,
    error: null,
  }),
  useUpdateTask: () => ({
    mutateAsync: mockUpdateTask,
    isPending: false,
    error: null,
  }),
}))

import { useTask } from '@/hooks/use-tasks'
const mockUseTask = useTask as jest.MockedFunction<typeof useTask>

describe('Form Validation Flow Integration', () => {
  let queryClient: QueryClient
  const user = userEvent.setup()

  const renderCreatePage = () => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })

    return render(
      <QueryClientProvider client={queryClient}>
        <CreateTaskPage />
      </QueryClientProvider>
    )
  }

  const renderEditPage = (task: Task) => {
    mockUseTask.mockReturnValue({
      data: task,
      isLoading: false,
      error: null,
      isError: false,
      refetch: jest.fn(),
    } as any)

    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })

    return render(
      <QueryClientProvider client={queryClient}>
        <EditTaskPage />
      </QueryClientProvider>
    )
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockCreateTask.mockResolvedValue({ id: '1', title: 'New Task', description: 'Description', status: 'TO_DO' })
    mockUpdateTask.mockResolvedValue({ id: '1', title: 'Updated Task', description: 'Description', status: 'TO_DO' })
  })

  describe('Real-time Validation Flow', () => {
    describe('Title Validation Journey', () => {
      it('shows validation error sequence for title field', async () => {
        renderCreatePage()
        
        const titleInput = screen.getByLabelText(/title/i)
        
        // Step 1: Focus and blur without input - should show "required" error
        await user.click(titleInput)
        await user.tab()
        
        await waitFor(() => {
          expect(screen.getByText('Title is required')).toBeInTheDocument()
        })
        
        // Step 2: Enter text too short - should show "minimum length" error
        await user.click(titleInput)
        await user.type(titleInput, 'ab')
        await user.tab()
        
        await waitFor(() => {
          expect(screen.getByText('Title must be at least 3 characters')).toBeInTheDocument()
          expect(screen.queryByText('Title is required')).not.toBeInTheDocument()
        })
        
        // Step 3: Enter valid length - should clear errors
        await user.click(titleInput)
        await user.clear(titleInput)
        await user.type(titleInput, 'Valid title')
        await user.tab()
        
        await waitFor(() => {
          expect(screen.queryByText('Title must be at least 3 characters')).not.toBeInTheDocument()
          expect(screen.queryByText('Title is required')).not.toBeInTheDocument()
        })
        
        // Step 4: Enter text too long - should show "maximum length" error
        await user.click(titleInput)
        await user.clear(titleInput)
        const longTitle = 'a'.repeat(201) // Over 200 char limit
        await user.type(titleInput, longTitle)
        await user.tab()
        
        await waitFor(() => {
          expect(screen.getByText('Title is too long (max 200 characters)')).toBeInTheDocument()
        })
        
        // Step 5: Fix to valid length - should clear error
        await user.click(titleInput)
        await user.clear(titleInput)
        await user.type(titleInput, 'Perfect length title')
        await user.tab()
        
        await waitFor(() => {
          expect(screen.queryByText('Title is too long (max 200 characters)')).not.toBeInTheDocument()
        })
      })

      it('shows character counter updates in real-time', async () => {
        renderCreatePage()
        
        const titleInput = screen.getByLabelText(/title/i)
        
        // Initially should show 0/200
        expect(screen.getByText('0/200')).toBeInTheDocument()
        
        // Type and check counter updates
        await user.type(titleInput, 'Hello')
        expect(screen.getByText('5/200')).toBeInTheDocument()
        
        await user.type(titleInput, ' World')
        expect(screen.getByText('11/200')).toBeInTheDocument()
        
        // Clear and check counter resets
        await user.clear(titleInput)
        expect(screen.getByText('0/200')).toBeInTheDocument()
      })
    })

    describe('Description Validation Journey', () => {
      it('validates description field correctly', async () => {
        renderCreatePage()
        
        const descriptionInput = screen.getByLabelText(/description/i)
        
        // Step 1: Empty description should be valid (optional field)
        await user.click(descriptionInput)
        await user.tab()
        
        // Should not show any errors for empty description
        expect(screen.queryByText(/description/i)).not.toBeInTheDocument()
        
        // Step 2: Enter text too short - should show minimum length error
        await user.click(descriptionInput)
        await user.type(descriptionInput, 'ab')
        await user.tab()
        
        await waitFor(() => {
          expect(screen.getByText('Description must be at least 5 characters or empty')).toBeInTheDocument()
        })
        
        // Step 3: Enter valid length - should clear error
        await user.click(descriptionInput)
        await user.clear(descriptionInput)
        await user.type(descriptionInput, 'Valid description')
        await user.tab()
        
        await waitFor(() => {
          expect(screen.queryByText('Description must be at least 5 characters or empty')).not.toBeInTheDocument()
        })
        
        // Step 4: Clear to empty - should still be valid
        await user.click(descriptionInput)
        await user.clear(descriptionInput)
        await user.tab()
        
        // Should not show errors for empty description
        expect(screen.queryByText('Description must be at least 5 characters or empty')).not.toBeInTheDocument()
        
        // Step 5: Enter text too long - should show maximum length error
        await user.click(descriptionInput)
        const longDescription = 'a'.repeat(1001) // Over 1000 char limit
        await user.type(descriptionInput, longDescription)
        await user.tab()
        
        await waitFor(() => {
          expect(screen.getByText('Description is too long (max 1000 characters)')).toBeInTheDocument()
        })
      })

      it('updates description character counter correctly', async () => {
        renderCreatePage()
        
        const descriptionInput = screen.getByLabelText(/description/i)
        
        // Initially should show 0/1000
        expect(screen.getByText('0/1000')).toBeInTheDocument()
        
        // Type and check counter updates
        await user.type(descriptionInput, 'This is a test description')
        expect(screen.getByText('26/1000')).toBeInTheDocument()
        
        // Add more text
        await user.type(descriptionInput, ' with more content')
        expect(screen.getByText('44/1000')).toBeInTheDocument()
      })
    })

    describe('Cross-field Validation', () => {
      it('maintains validation state across multiple fields', async () => {
        renderCreatePage()
        
        const titleInput = screen.getByLabelText(/title/i)
        const descriptionInput = screen.getByLabelText(/description/i)
        
        // Create errors in both fields
        await user.click(titleInput)
        await user.type(titleInput, 'ab') // Too short
        await user.click(descriptionInput)
        await user.type(descriptionInput, 'cd') // Too short
        await user.tab()
        
        await waitFor(() => {
          expect(screen.getByText('Title must be at least 3 characters')).toBeInTheDocument()
          expect(screen.getByText('Description must be at least 5 characters or empty')).toBeInTheDocument()
        })
        
        // Fix title, description error should remain
        await user.click(titleInput)
        await user.clear(titleInput)
        await user.type(titleInput, 'Valid title')
        await user.tab()
        
        await waitFor(() => {
          expect(screen.queryByText('Title must be at least 3 characters')).not.toBeInTheDocument()
          expect(screen.getByText('Description must be at least 5 characters or empty')).toBeInTheDocument()
        })
        
        // Fix description, no errors should remain
        await user.click(descriptionInput)
        await user.clear(descriptionInput)
        await user.type(descriptionInput, 'Valid description')
        await user.tab()
        
        await waitFor(() => {
          expect(screen.queryByText('Description must be at least 5 characters or empty')).not.toBeInTheDocument()
        })
      })

      it('validates all fields before form submission', async () => {
        renderCreatePage()
        
        const titleInput = screen.getByLabelText(/title/i)
        const descriptionInput = screen.getByLabelText(/description/i)
        const submitButton = screen.getByText('Create Task')
        
        // Set up invalid data
        await user.type(titleInput, 'ab') // Too short
        await user.type(descriptionInput, 'cd') // Too short
        
        // Try to submit
        await user.click(submitButton)
        
        // Should show all validation errors and not submit
        await waitFor(() => {
          expect(screen.getByText('Title must be at least 3 characters')).toBeInTheDocument()
          expect(screen.getByText('Description must be at least 5 characters or empty')).toBeInTheDocument()
        })
        
        expect(mockCreateTask).not.toHaveBeenCalled()
      })
    })
  })

  describe('Validation State Consistency', () => {
    it('maintains validation state when switching between create and edit modes', async () => {
      // Test create mode validation
      const { unmount } = renderCreatePage()
      
      const titleInput = screen.getByLabelText(/title/i)
      await user.click(titleInput)
      await user.type(titleInput, 'ab')
      await user.tab()
      
      await waitFor(() => {
        expect(screen.getByText('Title must be at least 3 characters')).toBeInTheDocument()
      })
      
      unmount()
      
      // Switch to edit mode with valid data
      const mockTask: Task = {
        id: 'test-id',
        title: 'Valid existing title',
        description: 'Valid existing description',
        status: 'TO_DO',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      }
      
      renderEditPage(mockTask)
      
      // Should show no validation errors initially
      expect(screen.queryByText('Title must be at least 3 characters')).not.toBeInTheDocument()
      
      // Create error in edit mode
      const editTitleInput = screen.getByLabelText(/title/i)
      await user.clear(editTitleInput)
      await user.type(editTitleInput, 'ab')
      await user.tab()
      
      await waitFor(() => {
        expect(screen.getByText('Title must be at least 3 characters')).toBeInTheDocument()
      })
    })

    it('clears validation errors on successful form submission', async () => {
      renderCreatePage()
      
      const titleInput = screen.getByLabelText(/title/i)
      const submitButton = screen.getByText('Create Task')
      
      // Create validation error
      await user.click(titleInput)
      await user.tab()
      
      await waitFor(() => {
        expect(screen.getByText('Title is required')).toBeInTheDocument()
      })
      
      // Fix and submit
      await user.click(titleInput)
      await user.type(titleInput, 'Valid task title')
      await user.click(submitButton)
      
      // Validation error should be cleared
      await waitFor(() => {
        expect(screen.queryByText('Title is required')).not.toBeInTheDocument()
      })
      
      expect(mockCreateTask).toHaveBeenCalled()
    })
  })

  describe('Form Submission Prevention', () => {
    it('prevents submission with multiple validation errors', async () => {
      renderCreatePage()
      
      const titleInput = screen.getByLabelText(/title/i)
      const descriptionInput = screen.getByLabelText(/description/i)
      const submitButton = screen.getByText('Create Task')
      
      // Create multiple errors
      await user.click(titleInput)
      await user.type(titleInput, 'ab') // Too short
      await user.click(descriptionInput)
      await user.type(descriptionInput, 'cd') // Too short
      await user.click(submitButton)
      
      // Should not submit
      expect(mockCreateTask).not.toHaveBeenCalled()
      
      // Should show all errors
      await waitFor(() => {
        expect(screen.getByText('Title must be at least 3 characters')).toBeInTheDocument()
        expect(screen.getByText('Description must be at least 5 characters or empty')).toBeInTheDocument()
      })
    })

    it('allows submission only when all fields are valid', async () => {
      renderCreatePage()
      
      const titleInput = screen.getByLabelText(/title/i)
      const descriptionInput = screen.getByLabelText(/description/i)
      const submitButton = screen.getByText('Create Task')
      
      // Enter valid data
      await user.type(titleInput, 'Valid task title')
      await user.type(descriptionInput, 'Valid task description')
      await user.click(submitButton)
      
      // Should submit successfully
      await waitFor(() => {
        expect(mockCreateTask).toHaveBeenCalledWith({
          title: 'Valid task title',
          description: 'Valid task description',
          status: 'TO_DO',
        })
      })
    })
  })

  describe('Edge Cases in Validation Flow', () => {
    it('handles rapid field switching with validation', async () => {
      renderCreatePage()
      
      const titleInput = screen.getByLabelText(/title/i)
      const descriptionInput = screen.getByLabelText(/description/i)
      
      // Rapidly switch between fields
      await user.click(titleInput)
      await user.type(titleInput, 'a')
      await user.click(descriptionInput)
      await user.type(descriptionInput, 'b')
      await user.click(titleInput)
      await user.type(titleInput, 'b') // Now "ab"
      await user.click(descriptionInput)
      await user.type(descriptionInput, 'c') // Now "bc"
      await user.tab() // Final blur
      
      await waitFor(() => {
        expect(screen.getByText('Title must be at least 3 characters')).toBeInTheDocument()
        expect(screen.getByText('Description must be at least 5 characters or empty')).toBeInTheDocument()
      })
    })

    it('validates whitespace-only input correctly', async () => {
      renderCreatePage()
      
      const titleInput = screen.getByLabelText(/title/i)
      
      // Enter only whitespace
      await user.type(titleInput, '   ')
      await user.tab()
      
      await waitFor(() => {
        expect(screen.getByText('Title cannot be empty')).toBeInTheDocument()
      })
    })

    it('handles paste operations with validation', async () => {
      renderCreatePage()
      
      const titleInput = screen.getByLabelText(/title/i)
      
      // Paste invalid text
      await user.click(titleInput)
      await user.paste('ab')
      await user.tab()
      
      await waitFor(() => {
        expect(screen.getByText('Title must be at least 3 characters')).toBeInTheDocument()
      })
      
      // Paste valid text
      await user.click(titleInput)
      await user.clear(titleInput)
      await user.paste('Valid pasted title')
      await user.tab()
      
      await waitFor(() => {
        expect(screen.queryByText('Title must be at least 3 characters')).not.toBeInTheDocument()
      })
    })
  })
})

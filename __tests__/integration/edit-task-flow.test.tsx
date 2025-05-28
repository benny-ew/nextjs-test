import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useRouter, useParams } from 'next/navigation'
import EditTaskPage from '@/app/tasks/edit/[id]/page'
import { Task } from '@/types/task'

// Mock the Next.js router and params
const mockPush = jest.fn()
const mockBack = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
  useParams: () => ({
    id: 'test-task-id',
  }),
}))

// Mock the task hooks
const mockUpdateTask = jest.fn()
const mockTask: Task = {
  id: 'test-task-id',
  title: 'Existing Task Title',
  description: 'Existing task description',
  status: 'IN_PROGRESS',
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
}

jest.mock('@/hooks/use-tasks', () => ({
  useTask: jest.fn(),
  useCreateTask: () => ({
    mutateAsync: jest.fn(),
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

describe('Edit Task Flow Integration', () => {
  let queryClient: QueryClient
  const user = userEvent.setup()

  const renderEditTaskPage = () => {
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
    mockUpdateTask.mockResolvedValue({ ...mockTask, title: 'Updated Title' })
    mockUseTask.mockReturnValue({
      data: mockTask,
      isLoading: false,
      error: null,
      isError: false,
      refetch: jest.fn(),
    } as any)
  })

  describe('Page Loading States', () => {
    it('shows loading spinner while task is loading', () => {
      mockUseTask.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
        isError: false,
        refetch: jest.fn(),
      } as any)
      
      renderEditTaskPage()
      
      expect(screen.getByText('Loading task...')).toBeInTheDocument()
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    })

    it('shows error message when task fails to load', () => {
      mockUseTask.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Task not found'),
        isError: true,
        refetch: jest.fn(),
      } as any)
      
      renderEditTaskPage()
      
      expect(screen.getByText('Error loading task')).toBeInTheDocument()
      expect(screen.getByText('Back to Board')).toBeInTheDocument()
    })

    it('shows error message when task is not found', () => {
      mockUseTask.mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
        isError: false,
        refetch: jest.fn(),
      } as any)
      
      renderEditTaskPage()
      
      expect(screen.getByText('Task not found')).toBeInTheDocument()
    })
  })

  describe('Page Navigation', () => {
    it('navigates back to board when back button is clicked', async () => {
      renderEditTaskPage()
      
      const backButton = screen.getByText('Back to Board')
      await user.click(backButton)
      
      expect(mockPush).toHaveBeenCalledWith('/')
    })

    it('displays edit task page with correct heading', () => {
      renderEditTaskPage()
      
      expect(screen.getByText('Edit Task')).toBeInTheDocument()
      expect(screen.getByText('Back to Board')).toBeInTheDocument()
    })

    it('navigates back from error page', async () => {
      mockUseTask.mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
        isError: false,
        refetch: jest.fn(),
      } as any)
      
      renderEditTaskPage()
      
      const backButton = screen.getByText('Back to Board')
      await user.click(backButton)
      
      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })

  describe('Form Pre-population', () => {
    it('pre-populates form with existing task data', () => {
      renderEditTaskPage()
      
      // Title field should be pre-populated
      const titleInput = screen.getByLabelText(/title/i) as HTMLInputElement
      expect(titleInput.value).toBe('Existing Task Title')
      
      // Description field should be pre-populated
      const descriptionInput = screen.getByLabelText(/description/i) as HTMLTextAreaElement
      expect(descriptionInput.value).toBe('Existing task description')
      
      // Status field should be pre-populated
      const statusSelect = screen.getByLabelText(/status/i) as HTMLSelectElement
      expect(statusSelect.value).toBe('IN_PROGRESS')
    })

    it('pre-populates character counters correctly', () => {
      renderEditTaskPage()
      
      // Title counter should show existing length
      expect(screen.getByText('19/200')).toBeInTheDocument() // "Existing Task Title" = 19 chars
      
      // Description counter should show existing length
      expect(screen.getByText('25/1000')).toBeInTheDocument() // "Existing task description" = 25 chars
    })

    it('handles task without description gracefully', () => {
      const taskWithoutDescription = { ...mockTask, description: undefined }
      mockUseTask.mockReturnValue({
        data: taskWithoutDescription,
        isLoading: false,
        error: null,
        isError: false,
        refetch: jest.fn(),
      } as any)
      
      renderEditTaskPage()
      
      const descriptionInput = screen.getByLabelText(/description/i) as HTMLTextAreaElement
      expect(descriptionInput.value).toBe('')
      expect(screen.getByText('0/1000')).toBeInTheDocument()
    })
  })

  describe('Form Validation in Edit Mode', () => {
    it('validates modified title field', async () => {
      renderEditTaskPage()
      
      const titleInput = screen.getByLabelText(/title/i)
      
      // Clear the title to trigger validation
      await user.clear(titleInput)
      await user.tab()
      
      await waitFor(() => {
        expect(screen.getByText('Title is required')).toBeInTheDocument()
      })
      
      // Enter a title that's too short
      await user.click(titleInput)
      await user.type(titleInput, 'ab')
      await user.tab()
      
      await waitFor(() => {
        expect(screen.getByText('Title must be at least 3 characters')).toBeInTheDocument()
      })
    })

    it('validates modified description field', async () => {
      renderEditTaskPage()
      
      const descriptionInput = screen.getByLabelText(/description/i)
      
      // Clear and enter invalid description
      await user.clear(descriptionInput)
      await user.type(descriptionInput, 'ab')
      await user.tab()
      
      await waitFor(() => {
        expect(screen.getByText('Description must be at least 5 characters or empty')).toBeInTheDocument()
      })
    })

    it('updates character counters when editing', async () => {
      renderEditTaskPage()
      
      const titleInput = screen.getByLabelText(/title/i)
      const descriptionInput = screen.getByLabelText(/description/i)
      
      // Modify title
      await user.clear(titleInput)
      await user.type(titleInput, 'New Title')
      expect(screen.getByText('9/200')).toBeInTheDocument()
      
      // Modify description
      await user.clear(descriptionInput)
      await user.type(descriptionInput, 'New description')
      expect(screen.getByText('15/1000')).toBeInTheDocument()
    })
  })

  describe('Form Submission in Edit Mode', () => {
    it('successfully updates task with modified data', async () => {
      renderEditTaskPage()
      
      const titleInput = screen.getByLabelText(/title/i)
      const descriptionInput = screen.getByLabelText(/description/i)
      const statusSelect = screen.getByLabelText(/status/i)
      const submitButton = screen.getByText('Update Task')
      
      // Modify the task data
      await user.clear(titleInput)
      await user.type(titleInput, 'Updated Task Title')
      
      await user.clear(descriptionInput)
      await user.type(descriptionInput, 'Updated task description')
      
      await user.selectOptions(statusSelect, 'DONE')
      
      // Submit form
      await user.click(submitButton)
      
      // Should call update task mutation with correct data
      await waitFor(() => {
        expect(mockUpdateTask).toHaveBeenCalledWith({
          taskId: 'test-task-id',
          task: {
            title: 'Updated Task Title',
            description: 'Updated task description',
            status: 'DONE',
          },
        })
      })
    })

    it('updates task with minimal changes', async () => {
      renderEditTaskPage()
      
      const titleInput = screen.getByLabelText(/title/i)
      const submitButton = screen.getByText('Update Task')
      
      // Make only a small change
      await user.clear(titleInput)
      await user.type(titleInput, 'Slightly Modified Title')
      
      // Submit form
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(mockUpdateTask).toHaveBeenCalledWith({
          taskId: 'test-task-id',
          task: {
            title: 'Slightly Modified Title',
            description: 'Existing task description',
            status: 'IN_PROGRESS',
          },
        })
      })
    })

    it('navigates back to board after successful update', async () => {
      renderEditTaskPage()
      
      const titleInput = screen.getByLabelText(/title/i)
      const submitButton = screen.getByText('Update Task')
      
      // Make a change and submit
      await user.clear(titleInput)
      await user.type(titleInput, 'Updated for Navigation Test')
      await user.click(submitButton)
      
      // Wait for navigation
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/')
      }, { timeout: 2000 })
    })

    it('handles update errors gracefully', async () => {
      // Mock update task to reject
      mockUpdateTask.mockRejectedValueOnce(new Error('Update failed'))
      
      renderEditTaskPage()
      
      const titleInput = screen.getByLabelText(/title/i)
      const submitButton = screen.getByText('Update Task')
      
      // Make a change and submit
      await user.clear(titleInput)
      await user.type(titleInput, 'Task that will fail to update')
      await user.click(submitButton)
      
      // Should still call the mutation
      await waitFor(() => {
        expect(mockUpdateTask).toHaveBeenCalled()
      })
      
      // Should not navigate (error handled by mutation hook)
      expect(mockPush).not.toHaveBeenCalledWith('/')
    })

    it('prevents submission with invalid data', async () => {
      renderEditTaskPage()
      
      const titleInput = screen.getByLabelText(/title/i)
      const submitButton = screen.getByText('Update Task')
      
      // Clear title to make form invalid
      await user.clear(titleInput)
      await user.click(submitButton)
      
      // Should not call update task mutation
      expect(mockUpdateTask).not.toHaveBeenCalled()
      
      // Should show validation errors
      await waitFor(() => {
        expect(screen.getByText('Title is required')).toBeInTheDocument()
      })
    })
  })

  describe('Status Changes in Edit Mode', () => {
    it('allows changing task status', async () => {
      renderEditTaskPage()
      
      const statusSelect = screen.getByLabelText(/status/i)
      
      // Change from IN_PROGRESS to DONE
      await user.selectOptions(statusSelect, 'DONE')
      expect(statusSelect).toHaveValue('DONE')
      
      // Change to TO_DO
      await user.selectOptions(statusSelect, 'TO_DO')
      expect(statusSelect).toHaveValue('TO_DO')
    })

    it('includes status change in update submission', async () => {
      renderEditTaskPage()
      
      const statusSelect = screen.getByLabelText(/status/i)
      const submitButton = screen.getByText('Update Task')
      
      // Change status only
      await user.selectOptions(statusSelect, 'DONE')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(mockUpdateTask).toHaveBeenCalledWith({
          taskId: 'test-task-id',
          task: {
            title: 'Existing Task Title',
            description: 'Existing task description',
            status: 'DONE',
          },
        })
      })
    })
  })

  describe('Form State Persistence in Edit Mode', () => {
    it('preserves changes when switching between fields', async () => {
      renderEditTaskPage()
      
      const titleInput = screen.getByLabelText(/title/i)
      const descriptionInput = screen.getByLabelText(/description/i)
      const statusSelect = screen.getByLabelText(/status/i)
      
      // Make changes to all fields
      await user.clear(titleInput)
      await user.type(titleInput, 'Persistent Modified Title')
      
      await user.clear(descriptionInput)
      await user.type(descriptionInput, 'Persistent modified description')
      
      await user.selectOptions(statusSelect, 'DONE')
      
      // Click around to other fields
      await user.click(titleInput)
      await user.click(descriptionInput)
      await user.click(statusSelect)
      
      // Values should be preserved
      expect(titleInput).toHaveValue('Persistent Modified Title')
      expect(descriptionInput).toHaveValue('Persistent modified description')
      expect(statusSelect).toHaveValue('DONE')
    })

    it('clears validation errors when fields become valid', async () => {
      renderEditTaskPage()
      
      const titleInput = screen.getByLabelText(/title/i)
      
      // Clear title to trigger error
      await user.clear(titleInput)
      await user.tab()
      
      await waitFor(() => {
        expect(screen.getByText('Title is required')).toBeInTheDocument()
      })
      
      // Fix the error
      await user.click(titleInput)
      await user.type(titleInput, 'Fixed title')
      await user.tab()
      
      await waitFor(() => {
        expect(screen.queryByText('Title is required')).not.toBeInTheDocument()
      })
    })

    it('shows form is in edit mode', () => {
      renderEditTaskPage()
      
      // Submit button should say "Update Task" instead of "Create Task"
      expect(screen.getByText('Update Task')).toBeInTheDocument()
      expect(screen.queryByText('Create Task')).not.toBeInTheDocument()
    })
  })
})

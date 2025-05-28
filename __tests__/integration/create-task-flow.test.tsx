import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import CreateTaskPage from '@/app/tasks/create/page'

// Mock the Next.js router
const mockPush = jest.fn()
const mockBack = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
}))

// Mock the task mutations
const mockCreateTask = jest.fn()
jest.mock('@/hooks/use-tasks', () => ({
  useCreateTask: () => ({
    mutateAsync: mockCreateTask,
    isPending: false,
    error: null,
  }),
  useUpdateTask: () => ({
    mutateAsync: jest.fn(),
    isPending: false,
    error: null,
  }),
}))

describe('Create Task Flow Integration', () => {
  let queryClient: QueryClient
  const user = userEvent.setup()

  const renderCreateTaskPage = () => {
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

  beforeEach(() => {
    jest.clearAllMocks()
    mockCreateTask.mockResolvedValue({ id: '1', title: 'New Task', description: 'New Description', status: 'TO_DO' })
  })

  describe('Page Navigation', () => {
    it('navigates back to board when back button is clicked', async () => {
      renderCreateTaskPage()
      
      const backButton = screen.getByText('Back to Board')
      await user.click(backButton)
      
      expect(mockPush).toHaveBeenCalledWith('/')
    })

    it('displays create task page with correct heading', () => {
      renderCreateTaskPage()
      
      expect(screen.getByText('Create New Task')).toBeInTheDocument()
      expect(screen.getByText('Back to Board')).toBeInTheDocument()
    })
  })

  describe('Form Rendering', () => {
    it('renders all form fields with correct initial state', () => {
      renderCreateTaskPage()
      
      // Title field
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/title/i)).toHaveValue('')
      
      // Description field
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/description/i)).toHaveValue('')
      
      // Status field
      expect(screen.getByLabelText(/status/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/status/i)).toHaveValue('TO_DO')
      
      // Submit button
      expect(screen.getByText('Create Task')).toBeInTheDocument()
      expect(screen.getByText('Create Task')).not.toBeDisabled()
    })

    it('renders character counters for title and description', () => {
      renderCreateTaskPage()
      
      expect(screen.getByText('0/200')).toBeInTheDocument() // Title counter
      expect(screen.getByText('0/1000')).toBeInTheDocument() // Description counter
    })

    it('shows required indicators on required fields', () => {
      renderCreateTaskPage()
      
      // Title should be required
      const titleLabel = screen.getByText('Title')
      expect(titleLabel.parentElement).toContainHTML('*')
    })
  })

  describe('Form Validation', () => {
    it('validates title field in real-time', async () => {
      renderCreateTaskPage()
      
      const titleInput = screen.getByLabelText(/title/i)
      
      // Focus and blur without entering text (should trigger validation)
      await user.click(titleInput)
      await user.tab()
      
      await waitFor(() => {
        expect(screen.getByText('Title is required')).toBeInTheDocument()
      })
      
      // Enter text less than minimum
      await user.click(titleInput)
      await user.type(titleInput, 'ab')
      await user.tab()
      
      await waitFor(() => {
        expect(screen.getByText('Title must be at least 3 characters')).toBeInTheDocument()
      })
      
      // Enter valid text
      await user.click(titleInput)
      await user.clear(titleInput)
      await user.type(titleInput, 'Valid Title')
      await user.tab()
      
      await waitFor(() => {
        expect(screen.queryByText('Title is required')).not.toBeInTheDocument()
        expect(screen.queryByText('Title must be at least 3 characters')).not.toBeInTheDocument()
      })
    })

    it('validates description field in real-time', async () => {
      renderCreateTaskPage()
      
      const descriptionInput = screen.getByLabelText(/description/i)
      
      // Enter text less than minimum (if not empty)
      await user.click(descriptionInput)
      await user.type(descriptionInput, 'ab')
      await user.tab()
      
      await waitFor(() => {
        expect(screen.getByText('Description must be at least 5 characters or empty')).toBeInTheDocument()
      })
      
      // Enter valid text
      await user.click(descriptionInput)
      await user.clear(descriptionInput)
      await user.type(descriptionInput, 'Valid description text')
      await user.tab()
      
      await waitFor(() => {
        expect(screen.queryByText('Description must be at least 5 characters or empty')).not.toBeInTheDocument()
      })
    })

    it('updates character counters as user types', async () => {
      renderCreateTaskPage()
      
      const titleInput = screen.getByLabelText(/title/i)
      const descriptionInput = screen.getByLabelText(/description/i)
      
      // Type in title
      await user.type(titleInput, 'Test Title')
      expect(screen.getByText('10/200')).toBeInTheDocument()
      
      // Type in description
      await user.type(descriptionInput, 'Test description')
      expect(screen.getByText('16/1000')).toBeInTheDocument()
    })

    it('prevents form submission with invalid data', async () => {
      renderCreateTaskPage()
      
      const submitButton = screen.getByText('Create Task')
      
      // Try to submit empty form
      await user.click(submitButton)
      
      // Should not call create task mutation
      expect(mockCreateTask).not.toHaveBeenCalled()
      
      // Should show validation errors
      await waitFor(() => {
        expect(screen.getByText('Title is required')).toBeInTheDocument()
      })
    })
  })

  describe('Form Submission', () => {
    it('successfully creates a task with valid data', async () => {
      renderCreateTaskPage()
      
      const titleInput = screen.getByLabelText(/title/i)
      const descriptionInput = screen.getByLabelText(/description/i)
      const statusSelect = screen.getByLabelText(/status/i)
      const submitButton = screen.getByText('Create Task')
      
      // Fill in valid data
      await user.type(titleInput, 'New Task Title')
      await user.type(descriptionInput, 'This is a new task description')
      await user.selectOptions(statusSelect, 'IN_PROGRESS')
      
      // Submit form
      await user.click(submitButton)
      
      // Should call create task mutation with correct data
      await waitFor(() => {
        expect(mockCreateTask).toHaveBeenCalledWith({
          title: 'New Task Title',
          description: 'This is a new task description',
          status: 'IN_PROGRESS',
        })
      })
    })

    it('creates task with minimal data (no description)', async () => {
      renderCreateTaskPage()
      
      const titleInput = screen.getByLabelText(/title/i)
      const submitButton = screen.getByText('Create Task')
      
      // Fill in only title
      await user.type(titleInput, 'Minimal Task')
      
      // Submit form
      await user.click(submitButton)
      
      // Should call create task mutation with minimal data
      await waitFor(() => {
        expect(mockCreateTask).toHaveBeenCalledWith({
          title: 'Minimal Task',
          description: undefined,
          status: 'TO_DO',
        })
      })
    })

    it('navigates back to board after successful creation', async () => {
      renderCreateTaskPage()
      
      const titleInput = screen.getByLabelText(/title/i)
      const submitButton = screen.getByText('Create Task')
      
      // Fill in data and submit
      await user.type(titleInput, 'Task for Navigation Test')
      await user.click(submitButton)
      
      // Wait for navigation
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/')
      }, { timeout: 2000 })
    })

    it('handles creation errors gracefully', async () => {
      // Mock create task to reject
      mockCreateTask.mockRejectedValueOnce(new Error('Creation failed'))
      
      renderCreateTaskPage()
      
      const titleInput = screen.getByLabelText(/title/i)
      const submitButton = screen.getByText('Create Task')
      
      // Fill in data and submit
      await user.type(titleInput, 'Task that will fail')
      await user.click(submitButton)
      
      // Should still call the mutation
      await waitFor(() => {
        expect(mockCreateTask).toHaveBeenCalled()
      })
      
      // Should not navigate (error handled by mutation hook)
      expect(mockPush).not.toHaveBeenCalledWith('/')
    })
  })

  describe('Status Selection', () => {
    it('allows selecting different status options', async () => {
      renderCreateTaskPage()
      
      const statusSelect = screen.getByLabelText(/status/i)
      
      // Test all status options
      await user.selectOptions(statusSelect, 'TO_DO')
      expect(statusSelect).toHaveValue('TO_DO')
      
      await user.selectOptions(statusSelect, 'IN_PROGRESS')
      expect(statusSelect).toHaveValue('IN_PROGRESS')
      
      await user.selectOptions(statusSelect, 'DONE')
      expect(statusSelect).toHaveValue('DONE')
    })

    it('includes status in form submission', async () => {
      renderCreateTaskPage()
      
      const titleInput = screen.getByLabelText(/title/i)
      const statusSelect = screen.getByLabelText(/status/i)
      const submitButton = screen.getByText('Create Task')
      
      // Set status to DONE
      await user.type(titleInput, 'Completed Task')
      await user.selectOptions(statusSelect, 'DONE')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(mockCreateTask).toHaveBeenCalledWith({
          title: 'Completed Task',
          description: undefined,
          status: 'DONE',
        })
      })
    })
  })

  describe('Form State Management', () => {
    it('preserves form data when switching between fields', async () => {
      renderCreateTaskPage()
      
      const titleInput = screen.getByLabelText(/title/i)
      const descriptionInput = screen.getByLabelText(/description/i)
      const statusSelect = screen.getByLabelText(/status/i)
      
      // Fill in all fields
      await user.type(titleInput, 'Persistent Title')
      await user.type(descriptionInput, 'Persistent description')
      await user.selectOptions(statusSelect, 'IN_PROGRESS')
      
      // Click around to other fields
      await user.click(titleInput)
      await user.click(descriptionInput)
      await user.click(statusSelect)
      
      // Values should be preserved
      expect(titleInput).toHaveValue('Persistent Title')
      expect(descriptionInput).toHaveValue('Persistent description')
      expect(statusSelect).toHaveValue('IN_PROGRESS')
    })

    it('clears validation errors when field becomes valid', async () => {
      renderCreateTaskPage()
      
      const titleInput = screen.getByLabelText(/title/i)
      
      // Trigger validation error
      await user.click(titleInput)
      await user.tab()
      
      await waitFor(() => {
        expect(screen.getByText('Title is required')).toBeInTheDocument()
      })
      
      // Fix the error
      await user.click(titleInput)
      await user.type(titleInput, 'Valid title now')
      await user.tab()
      
      await waitFor(() => {
        expect(screen.queryByText('Title is required')).not.toBeInTheDocument()
      })
    })
  })
})

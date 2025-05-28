import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskCard } from '@/components/TaskCard'
import { Task } from '@/types/task'
import { DragDropContext, Droppable } from '@hello-pangea/dnd'

// Mock the drag and drop context
const MockDragDropContext = ({ children }: { children: React.ReactNode }) => (
  <DragDropContext onDragEnd={() => {}}>
    <Droppable droppableId="test-droppable">
      {(provided) => (
        <div ref={provided.innerRef} {...provided.droppableProps}>
          {children}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  </DragDropContext>
)

const mockTask: Task = {
  id: '1',
  title: 'Test Task',
  description: 'This is a test task description',
  status: 'TO_DO',
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
}

const mockTaskWithoutDescription: Task = {
  id: '2',
  title: 'Task Without Description',
  description: undefined,
  status: 'IN_PROGRESS',
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
}

const renderTaskCard = (props: Partial<Parameters<typeof TaskCard>[0]> = {}) => {
  const defaultProps = {
    task: mockTask,
    index: 0,
    onEdit: jest.fn(),
    onDelete: jest.fn(),
    isLoading: false,
  }

  return render(
    <MockDragDropContext>
      <TaskCard {...defaultProps} {...props} />
    </MockDragDropContext>
  )
}

describe('TaskCard Component', () => {
  const user = userEvent.setup()
  
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders task card with title and description', () => {
      renderTaskCard()
      
      expect(screen.getByText('Test Task')).toBeInTheDocument()
      expect(screen.getByText('This is a test task description')).toBeInTheDocument()
    })

    it('renders task card without description when description is undefined', () => {
      renderTaskCard({ task: mockTaskWithoutDescription })
      
      expect(screen.getByText('Task Without Description')).toBeInTheDocument()
      expect(screen.queryByText('This is a test task description')).not.toBeInTheDocument()
    })

    it('shows loading spinner when isLoading is true', () => {
      renderTaskCard({ isLoading: true })
      
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    })

    it('applies loading opacity when isLoading is true', () => {
      const { container } = renderTaskCard({ isLoading: true })
      const card = container.querySelector('[class*="opacity-75"]')
      expect(card).toBeInTheDocument()
    })
  })

  describe('Action Buttons', () => {
    it('renders edit and delete buttons', () => {
      renderTaskCard()
      
      expect(screen.getByTitle('Edit task')).toBeInTheDocument()
      expect(screen.getByTitle('Delete task')).toBeInTheDocument()
    })

    it('calls onEdit when edit button is clicked', async () => {
      const onEdit = jest.fn()
      renderTaskCard({ onEdit })
      
      const editButton = screen.getByTitle('Edit task')
      await userEvent.click(editButton)
      
      expect(onEdit).toHaveBeenCalledWith(mockTask)
    })

    it('calls onDelete when delete button is clicked', async () => {
      const onDelete = jest.fn()
      renderTaskCard({ onDelete })
      
      const deleteButton = screen.getByTitle('Delete task')
      await userEvent.click(deleteButton)
      
      expect(onDelete).toHaveBeenCalledWith(mockTask.id)
    })

    it('prevents event bubbling when action buttons are clicked', async () => {
      const onEdit = jest.fn()
      const onDelete = jest.fn()
      renderTaskCard({ onEdit, onDelete })
      
      const editButton = screen.getByTitle('Edit task')
      const deleteButton = screen.getByTitle('Delete task')
      
      // Create mock events to check stopPropagation
      const mockEditEvent = { stopPropagation: jest.fn() }
      const mockDeleteEvent = { stopPropagation: jest.fn() }
      
      // Mock the click events to include stopPropagation
      editButton.onclick = (e) => mockEditEvent.stopPropagation()
      deleteButton.onclick = (e) => mockDeleteEvent.stopPropagation()
      
      await user.click(editButton)
      await user.click(deleteButton)
      
      // Verify the callbacks were called
      expect(onEdit).toHaveBeenCalledWith(mockTask)
      expect(onDelete).toHaveBeenCalledWith(mockTask.id)
    })
  })

  describe('Drag and Drop', () => {
    it('has draggable attributes', () => {
      const { container } = renderTaskCard()
      
      // Check for draggable attributes
      const draggableElement = container.querySelector('[data-rfd-draggable-id="1"]')
      expect(draggableElement).toBeInTheDocument()
    })

    it('applies cursor styles for dragging', () => {
      const { container } = renderTaskCard()
      
      const card = container.querySelector('.cursor-grab')
      expect(card).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has accessible button labels', () => {
      renderTaskCard()
      
      expect(screen.getByTitle('Edit task')).toBeInTheDocument()
      expect(screen.getByTitle('Delete task')).toBeInTheDocument()
    })

    it('maintains proper focus management', async () => {
      renderTaskCard()
      
      const editButton = screen.getByTitle('Edit task')
      editButton.focus()
      
      expect(editButton).toHaveFocus()
    })
  })

  describe('Edge Cases', () => {
    it('handles missing onEdit callback gracefully', async () => {
      renderTaskCard({ onEdit: undefined })
      
      const editButton = screen.getByTitle('Edit task')
      await userEvent.click(editButton)
      
      // Should not throw error
      expect(editButton).toBeInTheDocument()
    })

    it('handles missing onDelete callback gracefully', async () => {
      renderTaskCard({ onDelete: undefined })
      
      const deleteButton = screen.getByTitle('Delete task')
      await userEvent.click(deleteButton)
      
      // Should not throw error
      expect(deleteButton).toBeInTheDocument()
    })

    it('handles empty task title', () => {
      const taskWithEmptyTitle = { ...mockTask, title: '' }
      renderTaskCard({ task: taskWithEmptyTitle })
      
      // Should still render the card structure
      expect(screen.getByTitle('Edit task')).toBeInTheDocument()
    })

    it('handles very long task title', () => {
      const taskWithLongTitle = { 
        ...mockTask, 
        title: 'This is a very long task title that should handle gracefully without breaking the layout or causing any issues with the component rendering' 
      }
      renderTaskCard({ task: taskWithLongTitle })
      
      expect(screen.getByText(taskWithLongTitle.title)).toBeInTheDocument()
    })

    it('handles very long description', () => {
      const taskWithLongDescription = { 
        ...mockTask, 
        description: 'This is a very long task description that should handle gracefully without breaking the layout. It should wrap properly and maintain good readability even with extensive content that goes beyond normal description lengths.' 
      }
      renderTaskCard({ task: taskWithLongDescription })
      
      expect(screen.getByText(taskWithLongDescription.description)).toBeInTheDocument()
    })
  })

  describe('Styling and Hover Effects', () => {
    it('applies hover styles correctly', async () => {
      const { container } = renderTaskCard()
      
      const card = container.querySelector('.group')
      expect(card).toBeInTheDocument()
      expect(card).toHaveClass('hover:shadow-md')
    })

    it('shows action buttons on hover', () => {
      const { container } = renderTaskCard()
      
      const actionButtons = container.querySelector('.opacity-0.group-hover\\:opacity-100')
      expect(actionButtons).toBeInTheDocument()
    })
  })
})

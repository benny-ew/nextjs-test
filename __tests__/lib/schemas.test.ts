import { 
  taskFormSchema, 
  validateTitle, 
  validateDescription, 
  validateStatus,
  validateFormField,
  formDataToTask,
  taskToFormData,
  defaultTaskFormValues
} from '@/lib/schemas'
import { ApiTaskStatus } from '@/types/task'

describe('Validation Schemas', () => {
  describe('taskFormSchema', () => {
    describe('title validation', () => {
      it('validates a correct title', () => {
        const result = taskFormSchema.safeParse({
          title: 'Valid Task Title',
          description: 'Valid description',
          status: 'TO_DO'
        })
        
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.title).toBe('Valid Task Title')
        }
      })

      it('rejects empty title', () => {
        const result = taskFormSchema.safeParse({
          title: '',
          description: 'Valid description',
          status: 'TO_DO'
        })
        
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Task title is required')
        }
      })

      it('rejects title with only spaces', () => {
        const result = taskFormSchema.safeParse({
          title: '   ',
          description: 'Valid description',
          status: 'TO_DO'
        })
        
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Task title cannot be empty or contain only spaces')
        }
      })

      it('rejects title shorter than 3 characters', () => {
        const result = taskFormSchema.safeParse({
          title: 'Hi',
          description: 'Valid description',
          status: 'TO_DO'
        })
        
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Task title must be at least 3 characters long')
        }
      })

      it('rejects title longer than 200 characters', () => {
        const longTitle = 'a'.repeat(201)
        const result = taskFormSchema.safeParse({
          title: longTitle,
          description: 'Valid description',
          status: 'TO_DO'
        })
        
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Task title must be less than 200 characters')
        }
      })

      it('rejects title starting with spaces', () => {
        const result = taskFormSchema.safeParse({
          title: ' Leading space',
          description: 'Valid description',
          status: 'TO_DO'
        })
        
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Task title cannot start or end with spaces')
        }
      })

      it('rejects title ending with spaces', () => {
        const result = taskFormSchema.safeParse({
          title: 'Trailing space ',
          description: 'Valid description',
          status: 'TO_DO'
        })
        
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Task title cannot start or end with spaces')
        }
      })

      it('rejects title with leading/trailing whitespace', () => {
        const result = taskFormSchema.safeParse({
          title: '  Valid Title  ',
          description: 'Valid description',
          status: 'TO_DO'
        })
        
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Task title cannot start or end with spaces')
        }
      })

      it('accepts title without leading/trailing whitespace', () => {
        const result = taskFormSchema.safeParse({
          title: 'Valid Title',
          description: 'Valid description',
          status: 'TO_DO'
        })
        
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.title).toBe('Valid Title')
        }
      })
    })

    describe('description validation', () => {
      it('accepts valid description', () => {
        const result = taskFormSchema.safeParse({
          title: 'Valid Title',
          description: 'This is a valid description',
          status: 'TO_DO'
        })
        
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.description).toBe('This is a valid description')
        }
      })

      it('accepts empty description', () => {
        const result = taskFormSchema.safeParse({
          title: 'Valid Title',
          description: '',
          status: 'TO_DO'
        })
        
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.description).toBe('')
        }
      })

      it('accepts undefined description', () => {
        const result = taskFormSchema.safeParse({
          title: 'Valid Title',
          status: 'TO_DO'
        })
        
        expect(result.success).toBe(true)
      })

      it('rejects description longer than 1000 characters', () => {
        const longDescription = 'a'.repeat(1001)
        const result = taskFormSchema.safeParse({
          title: 'Valid Title',
          description: longDescription,
          status: 'TO_DO'
        })
        
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Description must be less than 1000 characters')
        }
      })

      it('rejects description shorter than 5 characters (when not empty)', () => {
        const result = taskFormSchema.safeParse({
          title: 'Valid Title',
          description: 'Hi',
          status: 'TO_DO'
        })
        
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Description must be either empty or at least 5 characters long')
        }
      })

      it('trims description whitespace', () => {
        const result = taskFormSchema.safeParse({
          title: 'Valid Title',
          description: '  Valid description  ',
          status: 'TO_DO'
        })
        
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.description).toBe('Valid description')
        }
      })
    })

    describe('status validation', () => {
      it('accepts valid status values', () => {
        const statuses: ApiTaskStatus[] = ['TO_DO', 'IN_PROGRESS', 'DONE']
        
        statuses.forEach(status => {
          const result = taskFormSchema.safeParse({
            title: 'Valid Title',
            description: 'Valid description',
            status
          })
          
          expect(result.success).toBe(true)
          if (result.success) {
            expect(result.data.status).toBe(status)
          }
        })
      })

      it('rejects invalid status values', () => {
        const result = taskFormSchema.safeParse({
          title: 'Valid Title',
          description: 'Valid description',
          status: 'INVALID_STATUS'
        })
        
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe("Invalid enum value. Expected 'TO_DO' | 'IN_PROGRESS' | 'DONE', received 'INVALID_STATUS'")
        }
      })

      it('rejects missing status', () => {
        const result = taskFormSchema.safeParse({
          title: 'Valid Title',
          description: 'Valid description'
        })
        
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Status is required')
        }
      })
    })
  })

  describe('Individual Validation Functions', () => {
    describe('validateTitle', () => {
      it('returns null for valid title', () => {
        expect(validateTitle('Valid Title')).toBeNull()
      })

      it('returns error for empty title', () => {
        expect(validateTitle('')).toBe('Title is required')
      })

      it('returns error for title with only spaces', () => {
        expect(validateTitle('   ')).toBe('Title cannot be empty')
      })

      it('returns error for short title', () => {
        expect(validateTitle('Hi')).toBe('Title must be at least 3 characters')
      })

      it('returns error for long title', () => {
        const longTitle = 'a'.repeat(201)
        expect(validateTitle(longTitle)).toBe('Title is too long (max 200 characters)')
      })

      it('returns error for title starting with spaces', () => {
        expect(validateTitle(' Leading space')).toBe('Title cannot start with spaces')
      })

      it('returns error for title ending with spaces', () => {
        expect(validateTitle('Trailing space ')).toBe('Title cannot end with spaces')
      })
    })

    describe('validateDescription', () => {
      it('returns null for valid description', () => {
        expect(validateDescription('Valid description')).toBeNull()
      })

      it('returns null for empty description', () => {
        expect(validateDescription('')).toBeNull()
      })

      it('returns error for long description', () => {
        const longDescription = 'a'.repeat(1001)
        expect(validateDescription(longDescription)).toBe('Description is too long (max 1000 characters)')
      })

      it('returns error for short description', () => {
        expect(validateDescription('Hi')).toBe('Description must be at least 5 characters or empty')
      })
    })

    describe('validateStatus', () => {
      it('returns null for valid status', () => {
        expect(validateStatus('TO_DO')).toBeNull()
        expect(validateStatus('IN_PROGRESS')).toBeNull()
        expect(validateStatus('DONE')).toBeNull()
      })

      it('returns error for empty status', () => {
        expect(validateStatus('')).toBe('Status is required')
      })

      it('returns error for invalid status', () => {
        expect(validateStatus('INVALID')).toBe('Invalid status selected')
      })
    })

    describe('validateFormField', () => {
      it('validates title field', () => {
        expect(validateFormField('title', 'Valid Title')).toBeNull()
        expect(validateFormField('title', '')).toBe('Title is required')
      })

      it('validates description field', () => {
        expect(validateFormField('description', 'Valid description')).toBeNull()
        expect(validateFormField('description', 'Hi')).toBe('Description must be at least 5 characters or empty')
      })

      it('validates status field', () => {
        expect(validateFormField('status', 'TO_DO')).toBeNull()
        expect(validateFormField('status', 'INVALID')).toBe('Invalid status selected')
      })

      it('returns null for unknown field', () => {
        expect(validateFormField('unknown', 'value')).toBeNull()
      })
    })
  })

  describe('Helper Functions', () => {
    describe('formDataToTask', () => {
      it('converts form data to task format', () => {
        const formData = {
          title: '  Task Title  ',
          description: '  Task Description  ',
          status: 'TO_DO' as const
        }

        const result = formDataToTask(formData)

        expect(result).toEqual({
          title: 'Task Title',
          description: 'Task Description',
          status: 'TO_DO'
        })
      })

      it('handles empty description', () => {
        const formData = {
          title: 'Task Title',
          description: '',
          status: 'TO_DO' as const
        }

        const result = formDataToTask(formData)

        expect(result).toEqual({
          title: 'Task Title',
          description: undefined,
          status: 'TO_DO'
        })
      })

      it('handles undefined description', () => {
        const formData = {
          title: 'Task Title',
          description: undefined,
          status: 'TO_DO' as const
        }

        const result = formDataToTask(formData)

        expect(result).toEqual({
          title: 'Task Title',
          description: undefined,
          status: 'TO_DO'
        })
      })
    })

    describe('taskToFormData', () => {
      it('converts task to form data format', () => {
        const task = {
          title: 'Task Title',
          description: 'Task Description',
          status: 'IN_PROGRESS' as ApiTaskStatus
        }

        const result = taskToFormData(task)

        expect(result).toEqual({
          title: 'Task Title',
          description: 'Task Description',
          status: 'IN_PROGRESS'
        })
      })

      it('handles undefined description', () => {
        const task = {
          title: 'Task Title',
          status: 'DONE' as ApiTaskStatus
        }

        const result = taskToFormData(task)

        expect(result).toEqual({
          title: 'Task Title',
          description: '',
          status: 'DONE'
        })
      })
    })

    describe('defaultTaskFormValues', () => {
      it('provides correct default values', () => {
        expect(defaultTaskFormValues).toEqual({
          title: '',
          description: '',
          status: 'TO_DO'
        })
      })
    })
  })
})

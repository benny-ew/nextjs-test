import { z } from 'zod';
import { ApiTaskStatus } from '@/types/task';

// Task form validation schema
export const taskFormSchema = z.object({
  title: z
    .string()
    .min(1, 'Task title is required')
    .max(200, 'Task title must be less than 200 characters')
    .refine((val) => val.trim().length > 0, {
      message: 'Task title cannot be empty or contain only spaces',
    })
    .refine((val) => val.trim().length >= 3, {
      message: 'Task title must be at least 3 characters long',
    })
    .refine((val) => !/^\s/.test(val) && !/\s$/.test(val), {
      message: 'Task title cannot start or end with spaces',
    })
    .transform((val) => val.trim()),
  description: z
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .refine((val) => !val || val.trim().length === 0 || val.trim().length >= 5, {
      message: 'Description must be either empty or at least 5 characters long',
    })
    .transform((val) => val?.trim() || '')
    .optional()
    .or(z.literal('')),
  status: z.enum(['TO_DO', 'IN_PROGRESS', 'DONE'] as const, {
    required_error: 'Status is required',
    invalid_type_error: 'Invalid status selected',
  }),
});

// Type for form data
export type TaskFormData = z.infer<typeof taskFormSchema>;

// Task creation schema (same as main form but without id fields)
export const createTaskSchema = taskFormSchema;

// Task update schema
export const updateTaskSchema = taskFormSchema.partial().extend({
  status: z.enum(['TO_DO', 'IN_PROGRESS', 'DONE'] as const).optional(),
});

// Status update schema (for drag and drop)
export const statusUpdateSchema = z.object({
  status: z.enum(['TO_DO', 'IN_PROGRESS', 'DONE'] as const),
});

// Search/filter schema
export const taskFilterSchema = z.object({
  search: z.string().optional(),
  status: z.enum(['TO_DO', 'IN_PROGRESS', 'DONE'] as const).optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
});

export type TaskFilterData = z.infer<typeof taskFilterSchema>;

// Pagination schema
export const paginationSchema = z.object({
  page: z.number().min(1, 'Page must be at least 1'),
  limit: z.number().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100'),
});

export type PaginationData = z.infer<typeof paginationSchema>;

// Default form values
export const defaultTaskFormValues: TaskFormData = {
  title: '',
  description: '',
  status: 'TO_DO' as const,
};

// Helper function to convert form data to API format
export const formDataToTask = (data: TaskFormData) => ({
  title: data.title.trim(),
  description: data.description?.trim() || undefined,
  status: data.status,
});

// Helper function to convert task to form data
export const taskToFormData = (task: {
  title: string;
  description?: string;
  status: ApiTaskStatus;
}): TaskFormData => ({
  title: task.title,
  description: task.description || '',
  status: task.status,
});

// Real-time validation schema (for immediate feedback)
export const realtimeValidationSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title is too long (max 200 characters)')
    .refine((val) => val.trim().length > 0, {
      message: 'Title cannot be empty',
    }),
  description: z
    .string()
    .max(1000, 'Description is too long (max 1000 characters)')
    .refine((val) => !val || val.length === 0 || val.trim().length >= 5, {
      message: 'Description must be at least 5 characters or empty',
    })
    .optional(),
  status: z.enum(['TO_DO', 'IN_PROGRESS', 'DONE'] as const),
});

// Individual field validation functions for real-time feedback
export const validateTitle = (title: string): string | null => {
  if (!title) return 'Title is required';
  if (title.trim().length === 0) return 'Title cannot be empty';
  if (title.trim().length < 3) return 'Title must be at least 3 characters';
  if (title.length > 200) return 'Title is too long (max 200 characters)';
  if (/^\s/.test(title)) return 'Title cannot start with spaces';
  if (/\s$/.test(title)) return 'Title cannot end with spaces';
  return null;
};

export const validateDescription = (description: string): string | null => {
  if (!description) return null; // Description is optional
  if (description.length > 1000) return 'Description is too long (max 1000 characters)';
  if (description.trim().length > 0 && description.trim().length < 5) {
    return 'Description must be at least 5 characters or empty';
  }
  return null;
};

export const validateStatus = (status: string): string | null => {
  const validStatuses = ['TO_DO', 'IN_PROGRESS', 'DONE'];
  if (!status) return 'Status is required';
  if (!validStatuses.includes(status)) return 'Invalid status selected';
  return null;
};

// Validation helper for form state
export const validateFormField = (field: string, value: string): string | null => {
  switch (field) {
    case 'title':
      return validateTitle(value);
    case 'description':
      return validateDescription(value);
    case 'status':
      return validateStatus(value);
    default:
      return null;
  }
};

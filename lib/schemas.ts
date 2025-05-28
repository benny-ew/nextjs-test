import { z } from 'zod';
import { ApiTaskStatus } from '@/types/task';

// Task form validation schema
export const taskFormSchema = z.object({
  title: z
    .string()
    .min(1, 'Task title is required')
    .max(200, 'Task title must be less than 200 characters')
    .trim(),
  description: z
    .string()
    .max(1000, 'Description must be less than 1000 characters')
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

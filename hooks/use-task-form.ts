import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useCallback } from 'react';
import { 
  TaskFormData, 
  taskFormSchema, 
  defaultTaskFormValues,
  formDataToTask,
  taskToFormData,
  validateFormField
} from '@/lib/schemas';
import { Task } from '@/types/task';
import { useCreateTask, useUpdateTask } from '@/hooks/use-tasks';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface UseTaskFormOptions {
  task?: Task;
  onSuccess?: () => void;
  redirectOnSuccess?: boolean;
  enableRealTimeValidation?: boolean;
}

interface FieldValidationState {
  title?: string | null;
  description?: string | null;
  status?: string | null;
}

export function useTaskForm({ 
  task, 
  onSuccess, 
  redirectOnSuccess = true,
  enableRealTimeValidation = true 
}: UseTaskFormOptions = {}) {
  const router = useRouter();
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const [fieldErrors, setFieldErrors] = useState<FieldValidationState>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const isEditing = !!task;
  
  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: task ? taskToFormData(task) : defaultTaskFormValues,
    mode: 'onChange',
    criteriaMode: 'all',
    shouldFocusError: true,
  });

  // Real-time validation handler
  const validateField = useCallback((fieldName: string, value: string) => {
    if (!enableRealTimeValidation || !touched[fieldName]) return;
    
    const error = validateFormField(fieldName, value);
    setFieldErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
  }, [enableRealTimeValidation, touched]);

  // Handle field blur to mark as touched
  const handleFieldBlur = useCallback((fieldName: string) => {
    setTouched(prev => ({
      ...prev,
      [fieldName]: true
    }));
  }, []);

  // Watch field changes for real-time validation
  const watchedTitle = form.watch('title');
  const watchedDescription = form.watch('description');
  const watchedStatus = form.watch('status');

  // Trigger validation on field changes
  useEffect(() => {
    validateField('title', watchedTitle || '');
  }, [watchedTitle, validateField]);

  useEffect(() => {
    validateField('description', watchedDescription || '');
  }, [watchedDescription, validateField]);

  useEffect(() => {
    validateField('status', watchedStatus || '');
  }, [watchedStatus, validateField]);

  // Reset form when task changes
  useEffect(() => {
    if (task) {
      form.reset(taskToFormData(task));
      setTouched({});
      setFieldErrors({});
    } else {
      form.reset(defaultTaskFormValues);
      setTouched({});
      setFieldErrors({});
    }
  }, [task, form]);

  const handleSubmit = async (data: TaskFormData) => {
    try {
      // Clear any field-level errors on submit
      setFieldErrors({});
      
      const taskData = formDataToTask(data);
      
      if (isEditing && task) {
        await updateTaskMutation.mutateAsync({
          taskId: task.id,
          task: taskData,
        });
      } else {
        await createTaskMutation.mutateAsync(taskData);
      }
      
      // Call custom success handler
      onSuccess?.();
      
      // Redirect to main page if requested
      if (redirectOnSuccess) {
        setTimeout(() => {
          router.push('/');
        }, 1000);
      }
    } catch (error) {
      // Error handling is managed by the mutation hooks
      console.error('Form submission error:', error);
    }
  };

  const isLoading = createTaskMutation.isPending || updateTaskMutation.isPending;
  const error = createTaskMutation.error || updateTaskMutation.error;

  // Enhanced register function with real-time validation
  const registerWithValidation = (fieldName: keyof TaskFormData) => {
    const registration = form.register(fieldName);
    return {
      ...registration,
      onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
        registration.onBlur(e);
        handleFieldBlur(fieldName);
      },
    };
  };

  // Register function for textarea elements
  const registerTextareaWithValidation = (fieldName: keyof TaskFormData) => {
    const registration = form.register(fieldName);
    return {
      ...registration,
      onBlur: (e: React.FocusEvent<HTMLTextAreaElement>) => {
        registration.onBlur(e);
        handleFieldBlur(fieldName);
      },
    };
  };

  // Register function for select elements
  const registerSelectWithValidation = (fieldName: keyof TaskFormData) => {
    const registration = form.register(fieldName);
    return {
      ...registration,
      onBlur: (e: React.FocusEvent<HTMLSelectElement>) => {
        registration.onBlur(e);
        handleFieldBlur(fieldName);
      },
    };
  };

  return {
    form,
    handleSubmit: form.handleSubmit(handleSubmit),
    isLoading,
    isEditing,
    error,
    fieldErrors,
    touched,
    // Enhanced register with validation
    register: form.register,
    registerWithValidation,
    registerTextareaWithValidation,
    registerSelectWithValidation,
    handleFieldBlur,
    // Direct access to form methods
    watch: form.watch,
    setValue: form.setValue,
    getValues: form.getValues,
    formState: form.formState,
    reset: form.reset,
    // Utility methods
    isDirty: form.formState.isDirty,
    isValid: form.formState.isValid,
    errors: form.formState.errors,
    // Validation helpers
    clearFieldError: (fieldName: string) => {
      setFieldErrors(prev => ({
        ...prev,
        [fieldName]: null
      }));
    },
    clearAllErrors: () => {
      setFieldErrors({});
      form.clearErrors();
    },
  };
}

// Hook for quick status updates (drag and drop)
export function useTaskStatusForm() {
  const form = useForm({
    resolver: zodResolver(taskFormSchema.pick({ status: true })),
  });

  return {
    form,
    register: form.register,
    watch: form.watch,
    setValue: form.setValue,
    getValues: form.getValues,
  };
}

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  TaskFormData, 
  taskFormSchema, 
  defaultTaskFormValues,
  formDataToTask,
  taskToFormData 
} from '@/lib/schemas';
import { Task } from '@/types/task';
import { useCreateTask, useUpdateTask } from '@/hooks/use-tasks';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface UseTaskFormOptions {
  task?: Task;
  onSuccess?: () => void;
  redirectOnSuccess?: boolean;
}

export function useTaskForm({ task, onSuccess, redirectOnSuccess = true }: UseTaskFormOptions = {}) {
  const router = useRouter();
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();

  const isEditing = !!task;
  
  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: task ? taskToFormData(task) : defaultTaskFormValues,
    mode: 'onChange',
  });

  // Reset form when task changes
  useEffect(() => {
    if (task) {
      form.reset(taskToFormData(task));
    } else {
      form.reset(defaultTaskFormValues);
    }
  }, [task, form]);

  const handleSubmit = async (data: TaskFormData) => {
    try {
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

  return {
    form,
    handleSubmit: form.handleSubmit(handleSubmit),
    isLoading,
    isEditing,
    error,
    // Direct access to form methods
    register: form.register,
    watch: form.watch,
    setValue: form.setValue,
    getValues: form.getValues,
    formState: form.formState,
    reset: form.reset,
    // Utility methods
    isDirty: form.formState.isDirty,
    isValid: form.formState.isValid,
    errors: form.formState.errors,
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

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Task, ApiTaskStatus, PaginationParams, PaginationInfo } from '@/types/task';
import { taskApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

// Query keys - centralized for consistency
export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (pagination?: PaginationParams) => [...taskKeys.lists(), pagination] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
};

// Hook for fetching tasks with pagination
export function useTasks(pagination?: PaginationParams) {
  return useQuery({
    queryKey: taskKeys.list(pagination),
    queryFn: () => taskApi.getTasks(pagination),
    // Keep previous data while loading new data (for pagination)
    placeholderData: (previousData) => previousData,
    // Stale time for tasks data
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Hook for fetching a single task
export function useTask(taskId: string, enabled = true) {
  return useQuery({
    queryKey: taskKeys.detail(taskId),
    queryFn: () => taskApi.getTask(taskId),
    enabled: enabled && !!taskId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Hook for creating a task
export function useCreateTask() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) =>
      taskApi.createTask(task),
    onSuccess: (newTask) => {
      // Invalidate tasks list to refetch
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      
      // Optionally add the new task to the cache immediately
      queryClient.setQueryData(taskKeys.detail(newTask.id), newTask);
      
      showSuccess('Task created successfully!');
    },
    onError: (error) => {
      console.error('Error creating task:', error);
      showError(error instanceof Error ? error.message : 'Failed to create task');
    },
  });
}

// Hook for updating a task
export function useUpdateTask() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({ 
      taskId, 
      task 
    }: { 
      taskId: string; 
      task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> 
    }) => taskApi.updateTask(taskId, task),
    onSuccess: (updatedTask, { taskId }) => {
      // Update the task in the cache
      queryClient.setQueryData(taskKeys.detail(taskId), updatedTask);
      
      // Invalidate tasks list to refetch
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      
      showSuccess('Task updated successfully!');
    },
    onError: (error) => {
      console.error('Error updating task:', error);
      showError(error instanceof Error ? error.message : 'Failed to update task');
    },
  });
}

// Hook for updating task status (optimistic update for drag and drop)
export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: ApiTaskStatus }) =>
      taskApi.updateTaskStatus(taskId, status),
    // Optimistic update
    onMutate: async ({ taskId, status }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: taskKeys.lists() });
      await queryClient.cancelQueries({ queryKey: taskKeys.detail(taskId) });

      // Snapshot the previous values
      const previousTasksQueries = queryClient.getQueriesData({ queryKey: taskKeys.lists() });
      const previousTask = queryClient.getQueryData(taskKeys.detail(taskId));

      // Optimistically update task lists
      queryClient.setQueriesData({ queryKey: taskKeys.lists() }, (old: any) => {
        if (!old) return old;
        
        return {
          ...old,
          tasks: old.tasks.map((task: Task) =>
            task.id === taskId
              ? { ...task, status, updatedAt: new Date().toISOString() }
              : task
          ),
        };
      });

      // Optimistically update single task
      queryClient.setQueryData(taskKeys.detail(taskId), (old: Task | undefined) => {
        if (!old) return old;
        return { ...old, status, updatedAt: new Date().toISOString() };
      });

      return { previousTasksQueries, previousTask, taskId };
    },
    onSuccess: (updatedTask, { status }) => {
      showSuccess(`Task moved to ${status.replace('_', ' ').toLowerCase()}`);
    },
    onError: (error, variables, context) => {
      // Rollback optimistic updates
      if (context?.previousTasksQueries) {
        context.previousTasksQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      if (context?.previousTask && context?.taskId) {
        queryClient.setQueryData(taskKeys.detail(context.taskId), context.previousTask);
      }
      
      console.error('Error updating task status:', error);
      showError(error instanceof Error ? error.message : 'Failed to update task status');
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
}

// Hook for deleting a task
export function useDeleteTask() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (taskId: string) => taskApi.deleteTask(taskId),
    onSuccess: (_, taskId) => {
      // Remove the task from all task lists
      queryClient.setQueriesData({ queryKey: taskKeys.lists() }, (old: any) => {
        if (!old) return old;
        
        return {
          ...old,
          tasks: old.tasks.filter((task: Task) => task.id !== taskId),
          pagination: {
            ...old.pagination,
            totalItems: old.pagination.totalItems - 1,
          },
        };
      });

      // Remove the task from the detail cache
      queryClient.removeQueries({ queryKey: taskKeys.detail(taskId) });
      
      // Invalidate to refetch with correct pagination
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      
      showSuccess('Task deleted successfully!');
    },
    onError: (error) => {
      console.error('Error deleting task:', error);
      showError(error instanceof Error ? error.message : 'Failed to delete task');
    },
  });
}

// Hook for getting tasks by status (derived from main tasks query)
export function useTasksByStatus(status: ApiTaskStatus, pagination?: PaginationParams) {
  const { data: tasksData, ...queryResult } = useTasks(pagination);
  
  const tasksByStatus = tasksData?.tasks.filter(task => task.status === status) || [];
  
  return {
    ...queryResult,
    data: tasksByStatus,
    allTasks: tasksData?.tasks || [],
    pagination: tasksData?.pagination,
  };
}

// Hook for global task statistics
export function useTaskStats(pagination?: PaginationParams) {
  const { data: tasksData, ...queryResult } = useTasks(pagination);
  
  const stats = {
    total: tasksData?.tasks.length || 0,
    todo: tasksData?.tasks.filter(task => task.status === 'TO_DO').length || 0,
    inProgress: tasksData?.tasks.filter(task => task.status === 'IN_PROGRESS').length || 0,
    done: tasksData?.tasks.filter(task => task.status === 'DONE').length || 0,
  };
  
  return {
    ...queryResult,
    data: stats,
    pagination: tasksData?.pagination,
  };
}

'use client';

import { useState } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { Column } from '@/components/Column';
import { Pagination } from '@/components/Pagination';
import { PageSizeSelector } from '@/components/PageSizeSelector';
import { ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { ToastContainer } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Plus } from 'lucide-react';
import { Task, ApiTaskStatus, PaginationInfo } from '@/types/task';
import { useTasks, useUpdateTaskStatus, useDeleteTask, taskKeys } from '@/hooks/use-tasks';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

export const KanbanBoard = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toasts, removeToast } = useToast();
  
  // State for pagination and UI
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    taskId: string;
    taskTitle: string;
  }>({
    isOpen: false,
    taskId: '',
    taskTitle: '',
  });

  // React Query hooks
  const {
    data: tasksData,
    isLoading,
    error,
    refetch,
  } = useTasks({ page: currentPage, limit: itemsPerPage });

  const updateTaskStatus = useUpdateTaskStatus();
  const deleteTask = useDeleteTask();

  // Derived data
  const tasks = tasksData?.tasks || [];
  const pagination = tasksData?.pagination || {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPreviousPage: false,
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setItemsPerPage(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const handleCreateTask = () => {
    router.push('/tasks/create');
  };

  const handleEditTask = (task: Task) => {
    router.push(`/tasks/edit/${task.id}`);
  };

  const handleDeleteTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setDeleteDialog({
        isOpen: true,
        taskId,
        taskTitle: task.title,
      });
    }
  };

  const confirmDeleteTask = async () => {
    try {
      await deleteTask.mutateAsync(deleteDialog.taskId);
      setDeleteDialog({ isOpen: false, taskId: '', taskTitle: '' });
    } catch (error) {
      // Error handling is managed by the mutation hook
      console.error('Error deleting task:', error);
    }
  };

  const cancelDeleteTask = () => {
    setDeleteDialog({ isOpen: false, taskId: '', taskTitle: '' });
  };

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // If no destination, do nothing
    if (!destination) return;

    // If dropped in same position, do nothing
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId as ApiTaskStatus;
    
    // Update task status using React Query mutation with optimistic updates
    try {
      await updateTaskStatus.mutateAsync({
        taskId: draggableId,
        status: newStatus,
      });
    } catch (error) {
      // Error handling is managed by the mutation hook
      console.error('Error updating task status:', error);
    }
  };

  const getTasksByStatus = (status: ApiTaskStatus): Task[] => {
    return tasks.filter(task => task.status === status);
  };

  const columns = [
    { id: 'TO_DO' as ApiTaskStatus, title: 'To Do', tasks: getTasksByStatus('TO_DO') },
    { id: 'IN_PROGRESS' as ApiTaskStatus, title: 'In Progress', tasks: getTasksByStatus('IN_PROGRESS') },
    { id: 'DONE' as ApiTaskStatus, title: 'Done', tasks: getTasksByStatus('DONE') },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <LoadingSpinner size="lg" text="Loading tasks..." />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage
        message={error instanceof Error ? error.message : 'Failed to load tasks'}
        onRetry={() => refetch()}
        variant="card"
        className="max-w-md mx-auto"
      />
    );
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Task Board
          </h1>
          <p className="text-gray-600">
            Drag and drop tasks to update their status
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={handleCreateTask}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Task
          </Button>
          <Button onClick={() => refetch()} variant="outline" size="sm" disabled={isLoading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <PageSizeSelector 
        currentPageSize={itemsPerPage}
        onPageSizeChange={handlePageSizeChange}
        loading={isLoading}
      />

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map(column => (
            <Column
              key={column.id}
              id={column.id}
              title={column.title}
              tasks={column.tasks}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              dragLoading={updateTaskStatus.isPending ? updateTaskStatus.variables?.taskId || null : null}
            />
          ))}
        </div>
      </DragDropContext>

      <Pagination 
        pagination={pagination} 
        onPageChange={handlePageChange}
        loading={isLoading}
      />

      <div className="text-center text-sm text-gray-600">
        <p>Total tasks: {pagination.totalItems} | Page {pagination.currentPage} of {pagination.totalPages}</p>
        <p className="mt-1">
          API ready - Replace the mock data in <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">lib/api.ts</code> with your actual API endpoint
        </p>
      </div>

      <ConfirmDeleteDialog
        isOpen={deleteDialog.isOpen}
        taskTitle={deleteDialog.taskTitle}
        onConfirm={confirmDeleteTask}
        onCancel={cancelDeleteTask}
        loading={deleteTask.isPending}
      />
    </div>
    </>
  );
};

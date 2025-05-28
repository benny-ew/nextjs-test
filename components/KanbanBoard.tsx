'use client';

import { useState, useEffect } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { Column } from '@/components/Column';
import { Pagination } from '@/components/Pagination';
import { PageSizeSelector } from '@/components/PageSizeSelector';
import { ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Plus, Edit } from 'lucide-react';
import { Task, TaskStatus, PaginationInfo } from '@/types/task';
import { taskApi } from '@/lib/api';

export const KanbanBoard = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Load tasks on component mount
  useEffect(() => {
    loadTasks();
  }, []);

  // Reload tasks when items per page changes
  useEffect(() => {
    if (pagination.currentPage > 1) {
      loadTasks(1); // Reset to first page when changing page size
    } else {
      loadTasks();
    }
  }, [itemsPerPage]);

  const loadTasks = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      const result = await taskApi.getTasks({ page, limit: itemsPerPage });
      setTasks(result.tasks);
      setPagination(result.pagination);
    } catch (err) {
      setError('Failed to load tasks');
      console.error('Error loading tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    loadTasks(page);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setItemsPerPage(newPageSize);
  };

  const handleCreateTask = () => {
    window.location.href = '/tasks/create';
  };

  const handleEditTask = (task: Task) => {
    window.location.href = `/tasks/edit/${task.id}`;
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
      setDeleteLoading(true);
      await taskApi.deleteTask(deleteDialog.taskId);
      
      // Remove task from local state
      setTasks(prevTasks => prevTasks.filter(task => task.id !== deleteDialog.taskId));
      
      // Close dialog
      setDeleteDialog({ isOpen: false, taskId: '', taskTitle: '' });
      
      // Reload tasks to get updated pagination info
      await loadTasks(pagination.currentPage);
    } catch (err) {
      setError('Failed to delete task');
      console.error('Error deleting task:', err);
    } finally {
      setDeleteLoading(false);
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

    const newStatus = destination.droppableId as TaskStatus;
    
    // Optimistically update the UI
    const updatedTasks = tasks.map(task =>
      task.id === draggableId
        ? { ...task, status: newStatus, updatedAt: new Date().toISOString() }
        : task
    );
    setTasks(updatedTasks);

    // Update on the server
    try {
      // Find the task to get its current data
      const taskToUpdate = tasks.find(task => task.id === draggableId);
      if (taskToUpdate) {
        await taskApi.updateTask(draggableId, {
          title: taskToUpdate.title,
          description: taskToUpdate.description,
          status: newStatus,
        });
      }
    } catch (err) {
      // Revert the optimistic update on error
      setTasks(tasks);
      setError('Failed to update task status');
      console.error('Error updating task:', err);
    }
  };

  const getTasksByStatus = (status: TaskStatus): Task[] => {
    return tasks.filter(task => task.status === status);
  };

  const columns = [
    { id: 'TODO' as TaskStatus, title: 'To Do', tasks: getTasksByStatus('TODO') },
    { id: 'IN_PROGRESS' as TaskStatus, title: 'In Progress', tasks: getTasksByStatus('IN_PROGRESS') },
    { id: 'DONE' as TaskStatus, title: 'Done', tasks: getTasksByStatus('DONE') },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading tasks...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-red-600">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => loadTasks(pagination.currentPage)} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
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
          <Button onClick={() => loadTasks(pagination.currentPage)} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <PageSizeSelector 
        currentPageSize={itemsPerPage}
        onPageSizeChange={handlePageSizeChange}
        loading={loading}
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
            />
          ))}
        </div>
      </DragDropContext>

      <Pagination 
        pagination={pagination} 
        onPageChange={handlePageChange}
        loading={loading}
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
        loading={deleteLoading}
      />
    </div>
  );
};

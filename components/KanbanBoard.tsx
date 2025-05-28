'use client';

import { useState, useEffect } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { Column } from '@/components/Column';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';
import { Task, TaskStatus } from '@/types/task';
import { taskApi } from '@/lib/api';

export const KanbanBoard = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load tasks on component mount
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedTasks = await taskApi.getTasks();
      setTasks(fetchedTasks);
    } catch (err) {
      setError('Failed to load tasks');
      console.error('Error loading tasks:', err);
    } finally {
      setLoading(false);
    }
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
      await taskApi.updateTaskStatus(draggableId, newStatus);
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
          <Button onClick={loadTasks} variant="outline">
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
          <Button onClick={loadTasks} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map(column => (
            <Column
              key={column.id}
              id={column.id}
              title={column.title}
              tasks={column.tasks}
            />
          ))}
        </div>
      </DragDropContext>

      <div className="text-center text-sm text-gray-600">
        <p>Total tasks: {tasks.length}</p>
        <p className="mt-1">
          API ready - Replace the mock data in <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">lib/api.ts</code> with your actual API endpoint
        </p>
      </div>
    </div>
  );
};

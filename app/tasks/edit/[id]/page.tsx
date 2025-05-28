'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { ToastContainer } from '@/components/ui/toast';
import { ArrowLeft, Edit } from 'lucide-react';
import { Task, ApiTaskStatus } from '@/types/task';
import { ApiError } from '@/types/api';
import { taskApi } from '@/lib/api';
import { getUserFriendlyErrorMessage } from '@/lib/error-handler';
import { useToast } from '@/hooks/use-toast';

export default function EditTaskPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [task, setTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'TO_DO' as ApiTaskStatus,
  });

  const { toasts, removeToast, showSuccess, showError } = useToast();

  useEffect(() => {
    loadTask();
  }, [taskId]);

  const loadTask = async () => {
    try {
      setLoading(true);
      setError(null);
      // Since we don't have a getTask by ID endpoint in the current API,
      // we'll need to get all tasks and find the one we want
      const result = await taskApi.getTasks();
      const foundTask = result.tasks.find(t => t.id === taskId);
      
      if (foundTask) {
        setTask(foundTask);
        setFormData({
          title: foundTask.title,
          description: foundTask.description || '',
          status: foundTask.status,
        });
      } else {
        setError('Task not found');
        showError('Task not found');
      }
    } catch (err) {
      const errorMessage = err instanceof Object && 'message' in err 
        ? getUserFriendlyErrorMessage(err as ApiError)
        : 'Failed to load task';
      setError(errorMessage);
      showError(errorMessage);
      console.error('Error loading task:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Task title is required');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      // Use PUT request to update the entire task
      await taskApi.updateTask(taskId, {
        title: formData.title,
        description: formData.description,
        status: formData.status,
      });
      
      showSuccess('Task updated successfully!');
      
      // Navigate back to the main board after a short delay
      setTimeout(() => {
        router.push('/');
      }, 1000);
    } catch (err) {
      const errorMessage = err instanceof Object && 'message' in err 
        ? getUserFriendlyErrorMessage(err as ApiError)
        : 'Failed to update task. Please try again.';
      setError(errorMessage);
      showError(errorMessage);
      console.error('Error updating task:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <LoadingSpinner size="lg" text="Loading task..." />
        </div>
      </div>
    );
  }

  if (!task && !loading) {
    return (
      <>
        <ToastContainer toasts={toasts} onRemove={removeToast} />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="pt-6">
              {error ? (
                <ErrorMessage
                  message={error}
                  onRetry={loadTask}
                  variant="card"
                />
              ) : (
                <p className="text-center text-gray-600">Task not found</p>
              )}
              <Button onClick={handleBack} className="w-full mt-4">
                Back to Board
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={handleBack}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Board
          </Button>
          
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Edit Task
          </h1>
          <p className="text-gray-600 mt-1">
            Update task details
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Task Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <ErrorMessage
                message={error}
                onRetry={() => setError(null)}
                variant="inline"
                className="mb-4"
              />
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Task Title *</Label>
                <Input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter task title"
                  required
                />
                <p className="text-xs text-gray-500">
                  Note: Title editing is not supported by the current API
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter task description (optional)"
                  className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500">
                  Note: Description editing is not supported by the current API
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as ApiTaskStatus })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="TO_DO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DONE">Done</option>
                </select>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>API Limitation:</strong> The current API only supports updating task status. 
                  Title and description are displayed for reference but cannot be modified.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 flex items-center gap-2"
                >
                  {saving && <LoadingSpinner size="sm" />}
                  {saving ? 'Updating...' : 'Update Task'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={saving}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {task && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-sm">Task Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Created:</span>
                  <p className="text-gray-600">{new Date(task.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <span className="font-medium">Updated:</span>
                  <p className="text-gray-600">{new Date(task.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
    </>
  );
}

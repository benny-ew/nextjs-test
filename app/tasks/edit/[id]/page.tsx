'use client';

import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { FormField, FormTextarea, FormSelect } from '@/components/ui/form-field';
import { AuthGuard } from '@/components/AuthGuard';
import { ArrowLeft, Edit, AlertCircle, CheckCircle } from 'lucide-react';
import { ApiTaskStatus } from '@/types/task';
import { useTask, useUpdateTask } from '@/hooks/use-tasks';
import { useTaskForm } from '@/hooks/use-task-form';

export default function EditTaskPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = params.id as string;
  
  const { data: task, isLoading, error: loadError } = useTask(taskId);
  
  const {
    registerWithValidation,
    registerTextareaWithValidation,
    registerSelectWithValidation,
    handleSubmit,
    formState: { errors },
    fieldErrors,
    touched,
    isLoading: formLoading,
    error: formError
  } = useTaskForm({
    task,
    enableRealTimeValidation: true,
    onSuccess: () => {
      router.push('/');
    }
  });

  const handleBack = () => {
    router.push('/');
  };

  return (
    <AuthGuard>
      {isLoading ? (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <LoadingSpinner size="lg" text="Loading task..." />
          </div>
        </div>
      ) : loadError || !task ? (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="pt-6">
              <ErrorMessage
                message={loadError?.message || 'Task not found'}
                onRetry={() => window.location.reload()}
                variant="card"
              />
              <Button onClick={handleBack} className="w-full mt-4">
                Back to Board
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
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
                {formError && (
                  <ErrorMessage
                    message={formError.message}
                    onRetry={() => {}}
                    variant="inline"
                    className="mb-4"
                  />
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="flex items-center gap-1">
                      Task Title
                      <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="title"
                        type="text"
                        {...registerWithValidation('title')}
                        placeholder="Enter task title"
                        disabled
                        className="pr-10 border-gray-300 bg-gray-50"
                      />
                      {touched.title && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          {fieldErrors.title ? (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                      )}
                    </div>
                    {fieldErrors.title && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {fieldErrors.title}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      Note: Title editing is not supported by the current API
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <div className="relative">
                      <textarea
                        id="description"
                        {...registerTextareaWithValidation('description')}
                        placeholder="Enter task description (optional)"
                        disabled
                        className="w-full min-h-[100px] px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                      />
                      {touched.description && (
                        <div className="absolute right-3 top-3">
                          {fieldErrors.description ? (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                      )}
                    </div>
                    {fieldErrors.description && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {fieldErrors.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      Note: Description editing is not supported by the current API
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status" className="flex items-center gap-1">
                      Status
                      <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <select
                        id="status"
                        {...registerSelectWithValidation('status')}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="TO_DO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="DONE">Done</option>
                      </select>
                      {touched.status && (
                        <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
                          {fieldErrors.status ? (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                      )}
                    </div>
                    {fieldErrors.status && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {fieldErrors.status}
                      </p>
                    )}
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
                      disabled={formLoading}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 flex items-center gap-2"
                    >
                      {formLoading && <LoadingSpinner size="sm" />}
                      {formLoading ? 'Updating...' : 'Update Task'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                      disabled={formLoading}
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
      )}
    </AuthGuard>
  );
}

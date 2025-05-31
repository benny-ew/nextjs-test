'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormTextarea, FormSelect } from '@/components/ui/form-field';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { AuthGuard } from '@/components/AuthGuard';
import { ArrowLeft, Plus } from 'lucide-react';
import { useTaskForm } from '@/hooks/use-task-form';

export default function CreateTaskPage() {
  const router = useRouter();
  
  const {
    registerWithValidation,
    registerTextareaWithValidation,
    registerSelectWithValidation,
    watch,
    handleSubmit,
    formState: { errors },
    isLoading,
    error,
    fieldErrors,
    touched,
    handleFieldBlur
  } = useTaskForm({
    onSuccess: () => {
      router.push('/');
    },
    enableRealTimeValidation: true
  });

  const titleValue = watch('title') || '';
  const descriptionValue = watch('description') || '';

  const handleBack = () => {
    router.push('/');
  };

  return (
    <AuthGuard>
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
          </div>

          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-blue-600" />
                Create New Task
              </CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-6">
                  <ErrorMessage message={error.message} />
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <FormField
                  id="title"
                  label="Title"
                  required
                  placeholder="Enter a descriptive task title"
                  registration={{
                    ...registerWithValidation('title'),
                    onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
                      console.log(e);
                      handleFieldBlur('title');
                    }
                  }}
                  error={errors.title?.message}
                  fieldError={fieldErrors.title}
                  touched={touched.title}
                  value={titleValue}
                  maxLength={200}
                  showCharCount
                  validIcon
                  helpText="Give your task a clear, concise title that describes what needs to be done"
                />

              <FormTextarea
                id="description"
                label="Description"
                placeholder="Add more details about this task (optional)"
                maxLength={1000}
                rows={4}
                showCharCount
                error={errors.description?.message}
                fieldError={fieldErrors.description}
                touched={touched.description}
                value={descriptionValue}
                helpText="Provide additional context, requirements, or notes for this task"
                registration={{
                  ...registerTextareaWithValidation('description'),
                  onBlur: (e: React.FocusEvent<HTMLTextAreaElement>) => {
                    console.log(e);
                    handleFieldBlur('description');
                  }
                }}
              />

              <FormSelect
                id="status"
                label="Initial Status"
                required
                error={errors.status?.message}
                fieldError={fieldErrors.status}
                touched={touched.status}
                helpText="Choose the starting status for this task"
                registration={{
                  ...registerSelectWithValidation('status'),
                  onBlur: () => handleFieldBlur('status')
                }}
              >
                <option value="">Select a status</option>
                <option value="TO_DO">📋 To Do</option>
                <option value="IN_PROGRESS">⚡ In Progress</option>
                <option value="DONE">✅ Done</option>
              </FormSelect>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 flex items-center gap-2"
                >
                  {isLoading && <LoadingSpinner size="sm" />}
                  {isLoading ? 'Creating Task...' : 'Create Task'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
    </AuthGuard>
  );
}
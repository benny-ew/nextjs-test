import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDeleteDialogProps {
  isOpen: boolean;
  taskTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export const ConfirmDeleteDialog = ({ 
  isOpen, 
  taskTitle, 
  onConfirm, 
  onCancel, 
  loading = false 
}: ConfirmDeleteDialogProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <CardTitle className="text-lg">Delete Task</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete the task{' '}
            <span className="font-semibold">"{taskTitle}"</span>? 
            This action cannot be undone.
          </p>
          <div className="flex gap-3 justify-end">
            <Button 
              variant="outline" 
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete Task'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
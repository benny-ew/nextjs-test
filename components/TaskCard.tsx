'use client';

import { Draggable } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Edit, Trash2 } from 'lucide-react';
import { Task } from '@/types/task';

interface TaskCardProps {
  task: Task;
  index: number;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  isLoading?: boolean;
}

export const TaskCard = ({ task, index, onEdit, onDelete, isLoading = false }: TaskCardProps) => {
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(task);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(task.id);
  };
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => {
        const style = {
          ...provided.draggableProps.style,
          ...(snapshot.isDragging && {
            zIndex: 9999,
            transform: provided.draggableProps.style?.transform,
          }),
        };

        return (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`mb-3 ${
              snapshot.isDragging 
                ? 'opacity-90' 
                : 'transition-all duration-200'
            }`}
            style={style}
          >            <Card className={`cursor-grab active:cursor-grabbing hover:shadow-md hover:shadow-blue-500/10 dark:hover:shadow-blue-500/20 border-border/50 dark:border-border/70 group ${
              snapshot.isDragging 
                ? 'shadow-2xl shadow-blue-500/30 dark:shadow-blue-500/50 ring-2 ring-blue-500 bg-background border-blue-500 rotate-2 scale-105' 
                : 'transition-all duration-200'
            } ${isLoading ? 'opacity-75' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-sm font-medium leading-tight text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  {task.title}
                  {isLoading && <LoadingSpinner size="sm" />}
                </CardTitle>
                <div className="flex items-center gap-1 ml-2">
                  {/* Action buttons */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleEdit}
                      className="h-7 w-7 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      title="Edit task"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDelete}
                      className="h-7 w-7 p-0 hover:bg-red-100 dark:hover:bg-red-900/40 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      title="Delete task"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            {task.description && (
              <CardContent className="pt-0">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {task.description}
                </p>
              </CardContent>
            )}
          </Card>
        </div>
      )}}
    </Draggable>
  );
};

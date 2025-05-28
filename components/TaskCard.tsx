'use client';

import { Draggable } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Task } from '@/types/task';

interface TaskCardProps {
  task: Task;
  index: number;
}

const priorityColors = {
  low: 'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  high: 'bg-red-100 text-red-800 border-red-200',
};

export const TaskCard = ({ task, index }: TaskCardProps) => {
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
          >            <Card className={`cursor-grab active:cursor-grabbing hover:shadow-md hover:shadow-blue-500/10 border-border/50 ${
              snapshot.isDragging 
                ? 'shadow-2xl shadow-blue-500/30 ring-2 ring-blue-500 bg-background border-blue-500 rotate-2 scale-105' 
                : 'transition-all duration-200'
            }`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-sm font-medium leading-tight text-gray-900">
                  {task.title}
                </CardTitle>
                {task.priority && (
                  <Badge 
                    variant="outline" 
                    className={`text-xs border ${priorityColors[task.priority]}`}
                  >
                    {task.priority}
                  </Badge>
                )}
              </div>
            </CardHeader>
            {(task.description || task.assignee) && (
              <CardContent className="pt-0">
                {task.description && (
                  <p className="text-sm text-gray-600 mb-2">
                    {task.description}
                  </p>
                )}
                {task.assignee && (
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-medium mr-2 shadow-sm">
                      {task.assignee.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className="text-xs text-gray-600">
                      {task.assignee}
                    </span>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        </div>
      )}}
    </Draggable>
  );
};

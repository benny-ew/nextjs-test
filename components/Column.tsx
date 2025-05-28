'use client';

import { Droppable } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TaskCard } from '@/components/TaskCard';
import { Task, ApiTaskStatus } from '@/types/task';

interface ColumnProps {
  id: ApiTaskStatus;
  title: string;
  tasks: Task[];
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
  dragLoading?: string | null;
}

const statusColors = {
  TO_DO: 'bg-slate-100 text-slate-800 border-slate-200',
  IN_PROGRESS: 'bg-blue-100 text-blue-800 border-blue-200',
  DONE: 'bg-green-100 text-green-800 border-green-200',
};

export const Column = ({ id, title, tasks, onEditTask, onDeleteTask, dragLoading }: ColumnProps) => {
  return (
    <Card className="h-fit bg-white border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">{title}</CardTitle>
          <Badge variant="outline" className={`border ${statusColors[id]}`}>
            {tasks.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Droppable droppableId={id}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`min-h-[200px] transition-all duration-200 rounded-lg ${
                snapshot.isDraggingOver 
                  ? 'bg-blue-50/80 ring-2 ring-blue-500/30' 
                  : ''
              }`}
            >
              {tasks.map((task, index) => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  index={index} 
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                  isLoading={dragLoading === task.id}
                />
              ))}
              {provided.placeholder}
              {tasks.length === 0 && !snapshot.isDraggingOver && (
                <div className="flex items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg transition-colors">
                  <p className="text-gray-500 text-sm">
                    Drop tasks here
                  </p>
                </div>
              )}
            </div>
          )}
        </Droppable>
      </CardContent>
    </Card>
  );
};

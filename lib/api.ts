import { Task, TaskStatus } from '@/types/task';

// Mock data - replace this with your actual API calls
const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Design the user interface',
    description: 'Create wireframes and mockups for the new feature',
    status: 'TODO',
    priority: 'high',
    assignee: 'John Doe',
    createdAt: '2025-05-20T10:00:00Z',
    updatedAt: '2025-05-20T10:00:00Z',
  },
  {
    id: '2',
    title: 'Implement authentication',
    description: 'Set up user login and registration functionality',
    status: 'IN_PROGRESS',
    priority: 'high',
    assignee: 'Jane Smith',
    createdAt: '2025-05-21T09:00:00Z',
    updatedAt: '2025-05-22T14:30:00Z',
  },
  {
    id: '3',
    title: 'Write unit tests',
    description: 'Add comprehensive test coverage for the API endpoints',
    status: 'TODO',
    priority: 'medium',
    assignee: 'Bob Johnson',
    createdAt: '2025-05-22T11:00:00Z',
    updatedAt: '2025-05-22T11:00:00Z',
  },
  {
    id: '4',
    title: 'Deploy to staging',
    description: 'Set up staging environment and deploy the application',
    status: 'DONE',
    priority: 'medium',
    assignee: 'Alice Brown',
    createdAt: '2025-05-18T08:00:00Z',
    updatedAt: '2025-05-25T16:00:00Z',
  },
  {
    id: '5',
    title: 'Code review',
    description: 'Review pull requests and provide feedback',
    status: 'IN_PROGRESS',
    priority: 'low',
    assignee: 'Charlie Wilson',
    createdAt: '2025-05-23T13:00:00Z',
    updatedAt: '2025-05-24T10:15:00Z',
  },
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const taskApi = {
  // Get all tasks
  async getTasks(): Promise<Task[]> {
    await delay(500); // Simulate network delay
    return mockTasks;
  },

  // Update task status
  async updateTaskStatus(taskId: string, newStatus: TaskStatus): Promise<Task> {
    await delay(300);
    const taskIndex = mockTasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) {
      throw new Error('Task not found');
    }
    
    mockTasks[taskIndex] = {
      ...mockTasks[taskIndex],
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };
    
    return mockTasks[taskIndex];
  },

  // Create new task
  async createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    await delay(400);
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    mockTasks.push(newTask);
    return newTask;
  },

  // Delete task
  async deleteTask(taskId: string): Promise<void> {
    await delay(300);
    const taskIndex = mockTasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) {
      throw new Error('Task not found');
    }
    
    mockTasks.splice(taskIndex, 1);
  },
};

// TODO: Replace the above mock implementation with actual API calls
// Example of how you might implement with a real API:
/*
export const taskApi = {
  async getTasks(): Promise<Task[]> {
    const response = await fetch('/api/tasks');
    if (!response.ok) throw new Error('Failed to fetch tasks');
    return response.json();
  },

  async updateTaskStatus(taskId: string, newStatus: TaskStatus): Promise<Task> {
    const response = await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    if (!response.ok) throw new Error('Failed to update task');
    return response.json();
  },

  // ... other methods
};
*/

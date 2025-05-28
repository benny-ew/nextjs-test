import { Task, TaskStatus, ApiTask, ApiTaskStatus, ApiResponse } from '@/types/task';
import { getApiConfig, logConfiguration } from '@/lib/config';

// Get configuration
const config = getApiConfig();
const { baseUrl: API_BASE_URL } = config;

// Log configuration for debugging
logConfiguration();

// Status mapping utilities
const statusToApi = (status: TaskStatus): ApiTaskStatus => {
  switch (status) {
    case 'TODO':
      return 'TO_DO';
    case 'IN_PROGRESS':
      return 'IN_PROGRESS';
    case 'DONE':
      return 'DONE';
    default:
      return 'TO_DO';
  }
};

const statusFromApi = (status: ApiTaskStatus): TaskStatus => {
  switch (status) {
    case 'TO_DO':
      return 'TODO';
    case 'IN_PROGRESS':
      return 'IN_PROGRESS';
    case 'DONE':
      return 'DONE';
    default:
      return 'TODO';
  }
};

const taskFromApi = (apiTask: ApiTask): Task => ({
  ...apiTask,
  status: statusFromApi(apiTask.status),
});

const taskToApi = (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Omit<ApiTask, 'id' | 'createdAt' | 'updatedAt'> => ({
  ...task,
  status: statusToApi(task.status),
});

// API implementation
export const taskApi = {
  async getTasks(): Promise<Task[]> {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch tasks: ${response.statusText}`);
    }
    
    const data: ApiResponse = await response.json();
    return data.tasks.map(taskFromApi);
  },

  async updateTaskStatus(taskId: string, newStatus: TaskStatus): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: statusToApi(newStatus) }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update task: ${response.statusText}`);
    }
    
    const apiTask: ApiTask = await response.json();
    return taskFromApi(apiTask);
  },

  async createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskToApi(task)),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create task: ${response.statusText}`);
    }
    
    const apiTask: ApiTask = await response.json();
    return taskFromApi(apiTask);
  },

  async deleteTask(taskId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete task: ${response.statusText}`);
    }
  },
};

// Export configuration for debugging
export const apiConfig = config;

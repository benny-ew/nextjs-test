import { Task, TaskStatus, ApiTask, ApiTaskStatus, ApiResponse, PaginationParams, PaginationInfo } from '@/types/task';
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
  async getTasks(pagination?: PaginationParams): Promise<{ tasks: Task[]; pagination: PaginationInfo }> {
    const queryParams = new URLSearchParams();
    if (pagination) {
      queryParams.append('page', pagination.page.toString());
      queryParams.append('limit', pagination.limit.toString());
    }
    
    const url = `${API_BASE_URL}/tasks${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch tasks: ${response.statusText}`);
    }
    
    const data: ApiResponse = await response.json();
    const tasks = data.tasks.map(taskFromApi);
    
    const paginationInfo: PaginationInfo = {
      currentPage: data.page,
      totalPages: Math.ceil(data.total / data.limit),
      totalItems: data.total,
      itemsPerPage: data.limit,
      hasNextPage: data.page < Math.ceil(data.total / data.limit),
      hasPreviousPage: data.page > 1,
    };
    
    return { tasks, pagination: paginationInfo };
  },

  async getTask(taskId: string): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch task: ${response.statusText}`);
    }
    
    const apiTask: ApiTask = await response.json();
    return taskFromApi(apiTask);
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

  async updateTask(taskId: string, task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskToApi(task)),
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
import { Task, ApiTaskStatus as TaskStatus, ApiTask, ApiTaskStatus, ApiResponse, PaginationParams, PaginationInfo } from '@/types/task';
import { ApiError } from '@/types/api';
import { getApiConfig, logConfiguration } from '@/lib/config';
import { parseApiError, handleNetworkError } from '@/lib/error-handler';

// Get configuration
const config = getApiConfig();
const { baseUrl: API_BASE_URL } = config;

// Log configuration for debugging
logConfiguration();

// API request timeout (10 seconds)
const API_TIMEOUT = 10000;

// Enhanced fetch with timeout and error handling
const fetchWithErrorHandling = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const apiError = await parseApiError(response);
      throw apiError;
    }

    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error) {
      throw handleNetworkError(error);
    }
    
    throw error;
  }
};

// Status mapping utilities
const statusToApi = (status: TaskStatus): ApiTaskStatus => {
  switch (status) {
    case 'TO_DO':
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
      return 'TO_DO';
    case 'IN_PROGRESS':
      return 'IN_PROGRESS';
    case 'DONE':
      return 'DONE';
    default:
      return 'TO_DO';
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
    const response = await fetchWithErrorHandling(url, {
      method: 'GET',
    });
    
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
    const response = await fetchWithErrorHandling(`${API_BASE_URL}/tasks/${taskId}`, {
      method: 'GET',
    });
    
    const apiTask: ApiTask = await response.json();
    return taskFromApi(apiTask);
  },

  async updateTaskStatus(taskId: string, newStatus: TaskStatus): Promise<Task> {
    const response = await fetchWithErrorHandling(`${API_BASE_URL}/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: statusToApi(newStatus) }),
    });
    
    const apiTask: ApiTask = await response.json();
    return taskFromApi(apiTask);
  },

  async updateTask(taskId: string, task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const response = await fetchWithErrorHandling(`${API_BASE_URL}/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(taskToApi(task)),
    });
    
    const apiTask: ApiTask = await response.json();
    return taskFromApi(apiTask);
  },

  async createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const response = await fetchWithErrorHandling(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      body: JSON.stringify(taskToApi(task)),
    });
    
    const apiTask: ApiTask = await response.json();
    return taskFromApi(apiTask);
  },

  async deleteTask(taskId: string): Promise<void> {
    await fetchWithErrorHandling(`${API_BASE_URL}/tasks/${taskId}`, {
      method: 'DELETE',
    });
  },
};

// Export configuration for debugging
export const apiConfig = config;
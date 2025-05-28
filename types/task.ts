export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type TaskPriority = 'low' | 'medium' | 'high';

// API response types
export type ApiTaskStatus = 'TO_DO' | 'IN_PROGRESS' | 'DONE';

export interface ApiTask {
  id: string;
  title: string;
  description?: string;
  status: ApiTaskStatus;
  priority?: TaskPriority;
  assignee?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse {
  tasks: ApiTask[];
  total: number;
  page: number;
  limit: number;
}

// Pagination types
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority?: TaskPriority;
  assignee?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  id: TaskStatus;
  title: string;
  tasks: Task[];
}

export interface KanbanBoard {
  columns: Column[];
}

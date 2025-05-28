# Task Board API Integration Guide

## Current Setup
The task board is currently using mock data from `lib/api.ts`. To integrate with your real API, follow these steps:

## 1. Replace Mock API with Real API

Update the `taskApi` object in `lib/api.ts`:

```typescript
export const taskApi = {
  // Get all tasks
  async getTasks(): Promise<Task[]> {
    const response = await fetch('YOUR_API_URL/tasks');
    if (!response.ok) throw new Error('Failed to fetch tasks');
    return response.json();
  },

  // Update task status
  async updateTaskStatus(taskId: string, newStatus: TaskStatus): Promise<Task> {
    const response = await fetch(`YOUR_API_URL/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    if (!response.ok) throw new Error('Failed to update task');
    return response.json();
  },

  // Create new task
  async createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const response = await fetch('YOUR_API_URL/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    });
    if (!response.ok) throw new Error('Failed to create task');
    return response.json();
  },

  // Delete task
  async deleteTask(taskId: string): Promise<void> {
    const response = await fetch(`YOUR_API_URL/tasks/${taskId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete task');
  },
};
```

## 2. Task Data Structure

Your API should return tasks with this structure:

```typescript
interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'TO_DO' | 'IN_PROGRESS' | 'DONE';
  priority?: 'low' | 'medium' | 'high';
  assignee?: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}
```

## 3. Environment Variables

Add your API configuration to `.env.local`:

```
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
```

Then update the API calls:

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Use API_URL in your fetch calls
const response = await fetch(`${API_URL}/tasks`);
```

## 4. Authentication (if needed)

If your API requires authentication, add headers:

```typescript
const authHeaders = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
};

const response = await fetch(`${API_URL}/tasks`, {
  headers: authHeaders,
});
```

## 5. Error Handling

The current implementation includes basic error handling. You may want to enhance it:

```typescript
try {
  const tasks = await taskApi.getTasks();
  setTasks(tasks);
} catch (error) {
  console.error('API Error:', error);
  setError('Failed to load tasks. Please try again.');
}
```

## Features Included

✅ **Drag and Drop**: Cards can be dragged between TO_DO, IN_PROGRESS, and DONE columns  
✅ **Dark/Light Theme**: Toggle between themes using the button in the top right  
✅ **Responsive Design**: Works on desktop, tablet, and mobile  
✅ **Loading States**: Shows loading spinner while fetching data  
✅ **Error Handling**: Displays error messages when API calls fail  
✅ **Optimistic Updates**: UI updates immediately, reverts on API failure  
✅ **Modern UI**: Built with shadcn/ui and Tailwind CSS  

## Testing

The current mock data includes 5 sample tasks across all three columns. Once you replace the API, the same functionality will work with your real data.

## Customization

- **Add more task statuses**: Update the `TaskStatus` type in `types/task.ts`
- **Add more task fields**: Extend the `Task` interface
- **Customize styling**: Modify the Tailwind classes in the components
- **Add task creation**: The API structure is ready, just add a form component

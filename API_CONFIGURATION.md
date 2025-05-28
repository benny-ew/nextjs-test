# API Configuration Guide

This application is configured to connect directly to your backend API using environment variables for easy deployment across different environments.

## Environment Variables

The application uses the following environment variables:

### `NEXT_PUBLIC_API_URL`
- **Description**: The base URL for your backend API
- **Default**: `http://localhost:3001/api`
- **Examples**:
  - Development: `http://localhost:3001/api`
  - Staging: `https://api-staging.yourapp.com`
  - Production: `https://api.yourapp.com`

### `NEXT_PUBLIC_ENVIRONMENT` (Optional)
- **Description**: Explicitly set the environment for configuration validation
- **Values**: `"development"`, `"staging"`, or `"production"`
- **Default**: Derived from `NODE_ENV`

## Setup Instructions

### 1. Environment Files

Copy the example environment file:
```bash
cp .env.example .env.local
```

### 2. Configure for Development
Edit `.env.local`:
```env
# Connect to your local or development API
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_ENVIRONMENT=development
```

### 3. Configure for Production
Edit `.env.local` or set environment variables in your deployment platform:
```env
# Connect to production API
NEXT_PUBLIC_API_URL=https://api.yourapp.com
NEXT_PUBLIC_ENVIRONMENT=production
```

## API Endpoints Expected

The application will make requests to these endpoints on your backend API:

### GET `/tasks`
Returns an array of tasks wrapped in a response object
```typescript
ApiResponse = {
  tasks: ApiTask[];
  total: number;
  page: number;
  limit: number;
}

ApiTask = {
  id: string;
  title: string;
  description?: string;
  status: 'TO_DO' | 'IN_PROGRESS' | 'DONE'; // Note: API uses TO_DO instead of TODO
  priority?: 'low' | 'medium' | 'high';
  assignee?: string;
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
}
```

### PATCH `/tasks/:id`
Updates a task's status
```typescript
// Request body
{ status: 'TO_DO' | 'IN_PROGRESS' | 'DONE' }

// Response
ApiTask
```

### POST `/tasks`
Creates a new task
```typescript
// Request body
{
  title: string;
  description?: string;
  status: 'TO_DO' | 'IN_PROGRESS' | 'DONE';
  priority?: 'low' | 'medium' | 'high';
  assignee?: string;
}

// Response
ApiTask
```

### DELETE `/tasks/:id`
Deletes a task
```typescript
// Response: 204 No Content
```

## Error Handling

The application includes comprehensive error handling:
- Network failures are caught and displayed to users
- Invalid responses show appropriate error messages
- Optimistic updates are reverted if API calls fail

## Development vs Production

### Development Mode
- Uses mock data by default (`NEXT_PUBLIC_USE_MOCK_API=true`)
- Simulates network delays for realistic testing
- No external API dependencies required

### Production Mode
- Connects to real API (`NEXT_PUBLIC_USE_MOCK_API=false`)
- Requires backend API to be running and accessible
- Uses actual HTTP requests with proper error handling

## Deployment Platforms

### Vercel
Set environment variables in your Vercel dashboard:
1. Go to Project Settings → Environment Variables
2. Add `NEXT_PUBLIC_API_URL` with your API URL
3. Add `NEXT_PUBLIC_USE_MOCK_API` set to `"false"`

### Netlify
Set environment variables in your Netlify dashboard:
1. Go to Site settings → Environment variables
2. Add the required variables

### Other Platforms
Most deployment platforms support environment variables. Check your platform's documentation for specific instructions.

## Debugging

The application logs the current configuration to the browser console:
```
API Configuration: { API_BASE_URL: "...", USE_MOCK_API: true/false }
```

You can also check the current configuration by importing `apiConfig`:
```typescript
import { apiConfig } from '@/lib/api';
console.log(apiConfig);
```

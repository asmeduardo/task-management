import { apiRequest } from './api';
import { 
  Task, 
  TaskFilters, 
  TaskStats, 
  CreateTaskData, 
  UpdateTaskData, 
  ApiResponse 
} from '../types/Task';

export const taskService = {
  async getTasks(filters?: TaskFilters): Promise<ApiResponse<Task[]>> {
    const params = new URLSearchParams();
    
    if (filters?.completed !== undefined) {
      params.append('completed', filters.completed.toString());
    }
    if (filters?.priority) {
      params.append('priority', filters.priority);
    }
    if (filters?.category) {
      params.append('category', filters.category);
    }
    if (filters?.search) {
      params.append('search', filters.search);
    }

    const query = params.toString();
    const endpoint = `/tasks${query ? `?${query}` : ''}`;
    
    return apiRequest<ApiResponse<Task[]>>(endpoint);
  },

  async getTask(id: number): Promise<ApiResponse<Task>> {
    return apiRequest<ApiResponse<Task>>(`/tasks/${id}`);
  },

  async createTask(data: CreateTaskData): Promise<ApiResponse<Task>> {
    return apiRequest<ApiResponse<Task>>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateTask(id: number, data: UpdateTaskData): Promise<ApiResponse<Task>> {
    return apiRequest<ApiResponse<Task>>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteTask(id: number): Promise<ApiResponse<void>> {
    return apiRequest<ApiResponse<void>>(`/tasks/${id}`, {
      method: 'DELETE',
    });
  },

  async toggleTask(id: number): Promise<ApiResponse<Task>> {
    return apiRequest<ApiResponse<Task>>(`/tasks/${id}/toggle`, {
      method: 'PATCH',
    });
  },

  async getStats(): Promise<ApiResponse<TaskStats>> {
    return apiRequest<ApiResponse<TaskStats>>('/tasks/stats');
  },

  async getCategories(): Promise<ApiResponse<string[]>> {
    return apiRequest<ApiResponse<string[]>>('/tasks/categories');
  },

  async getOverdueTasks(): Promise<ApiResponse<Task[]>> {
    return apiRequest<ApiResponse<Task[]>>('/tasks/overdue');
  },
};
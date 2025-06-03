export interface Task {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'baixa' | 'media' | 'alta';
  category?: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
}

export interface TaskFilters {
  completed?: boolean;
  priority?: string;
  category?: string;
  search?: string;
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  priority: 'baixa' | 'media' | 'alta';
  category?: string;
  dueDate?: string;
}

export interface UpdateTaskData extends Partial<CreateTaskData> {
  completed?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
  count?: number;
}
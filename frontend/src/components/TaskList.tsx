import { useState, useEffect } from 'react';
import { Task, TaskFilters } from '../types/Task';
import { taskService } from '../services/taskService';
import TaskCard from './TaskCard';
import TaskFiltersComponent from './TaskFilters';
import Loading from './ui/Loading';
import ErrorMessage from './ui/ErrorMessage';

interface TaskListProps {
  onEditTask: (task: Task) => void;
  refreshTrigger: number;
}

export default function TaskList({ onEditTask, refreshTrigger }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [filters, setFilters] = useState<TaskFilters>({});

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await taskService.getTasks(filters);
      if (response.success && response.data) {
        setTasks(response.data);
      }
    } catch (err) {
      setError('Erro ao carregar tarefas');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await taskService.getCategories();
      if (response.success && response.data) {
        setCategories(response.data);
      }
    } catch (err) {
      console.error('Erro ao carregar categorias');
    }
  };

  useEffect(() => {
    loadTasks();
  }, [filters, refreshTrigger]);

  useEffect(() => {
    loadCategories();
  }, []);

  const handleToggleTask = async (id: number) => {
    try {
      await taskService.toggleTask(id);
      loadTasks();
    } catch (err) {
      setError('Erro ao atualizar tarefa');
    }
  };

  const handleDeleteTask = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta tarefa?')) {
      try {
        await taskService.deleteTask(id);
        loadTasks();
      } catch (err) {
        setError('Erro ao excluir tarefa');
      }
    }
  };

  const handleFilter = (newFilters: TaskFilters) => {
    setFilters(newFilters);
  };

  const completedTasks = tasks.filter(task => task.completed);
  const pendingTasks = tasks.filter(task => !task.completed);
  const overdueTasks = tasks.filter(task => 
    !task.completed && task.dueDate && new Date(task.dueDate) < new Date()
  );

  if (loading) return <Loading />;

  return (
    <div className="space-y-8">
      <TaskFiltersComponent 
        onFilter={handleFilter}
        categories={categories}
      />
      
      {error && <ErrorMessage message={error} />}
      
      <div className="animate-fade-in">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
            Suas Tarefas
          </h2>
          <p className="text-gray-600 text-lg">
            Gerencie e organize todas as suas atividades
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">{tasks.length}</div>
            <div className="text-blue-500 font-medium">📋 Total</div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-orange-600">{pendingTasks.length}</div>
            <div className="text-orange-500 font-medium">⏳ Pendentes</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-green-600">{completedTasks.length}</div>
            <div className="text-green-500 font-medium">✅ Concluídas</div>
          </div>
        </div>

        {overdueTasks.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">🚨</span>
              </div>
              <h3 className="text-xl font-bold text-red-600">
                Tarefas Vencidas ({overdueTasks.length})
              </h3>
            </div>
            <div className="space-y-4">
              {overdueTasks.map((task, index) => (
                <div 
                  key={task.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <TaskCard
                    task={task}
                    onToggle={handleToggleTask}
                    onEdit={onEditTask}
                    onDelete={handleDeleteTask}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        
        {tasks.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">📝</span>
            </div>
            <h3 className="text-xl font-bold text-gray-600 mb-2">Nenhuma tarefa encontrada</h3>
            <p className="text-gray-500 mb-6">
              {Object.keys(filters).length > 0 
                ? 'Tente ajustar os filtros para ver mais resultados'
                : 'Comece criando sua primeira tarefa!'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {pendingTasks.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <span>⏳</span>
                  <span>Pendentes ({pendingTasks.length})</span>
                </h3>
                <div className="space-y-4">
                  {pendingTasks.map((task, index) => (
                    <div 
                      key={task.id}
                      className="animate-slide-up"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <TaskCard
                        task={task}
                        onToggle={handleToggleTask}
                        onEdit={onEditTask}
                        onDelete={handleDeleteTask}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {completedTasks.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <span>✅</span>
                  <span>Concluídas ({completedTasks.length})</span>
                </h3>
                <div className="space-y-4">
                  {completedTasks.map((task, index) => (
                    <div 
                      key={task.id}
                      className="animate-slide-up"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <TaskCard
                        task={task}
                        onToggle={handleToggleTask}
                        onEdit={onEditTask}
                        onDelete={handleDeleteTask}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
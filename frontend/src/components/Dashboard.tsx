import { useState, useEffect } from 'react';
import { TaskStats, Task } from '../types/Task';
import { taskService } from '../services/taskService';
import StatsCard from './StatsCard';
import TaskCard from './TaskCard';
import Loading from './ui/Loading';
import ErrorMessage from './ui/ErrorMessage';

interface DashboardProps {
  onEditTask: (task: Task) => void;
  refreshTrigger: number;
}

export default function Dashboard({ onEditTask, refreshTrigger }: DashboardProps) {
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [overdueTasks, setOverdueTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [statsResponse, overdueResponse] = await Promise.all([
        taskService.getStats(),
        taskService.getOverdueTasks()
      ]);

      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      }

      if (overdueResponse.success && overdueResponse.data) {
        setOverdueTasks(overdueResponse.data);
      }
    } catch (err) {
      setError('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [refreshTrigger]);

  const handleToggleTask = async (id: number) => {
    try {
      await taskService.toggleTask(id);
      loadDashboardData();
    } catch (err) {
      setError('Erro ao atualizar tarefa');
    }
  };

  const handleDeleteTask = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta tarefa?')) {
      try {
        await taskService.deleteTask(id);
        loadDashboardData();
      } catch (err) {
        setError('Erro ao excluir tarefa');
      }
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-8">
      {error && <ErrorMessage message={error} />}
      
      <div className="animate-fade-in">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
            Dashboard
          </h2>
          <p className="text-gray-600 text-lg">
            Acompanhe o progresso das suas tarefas
          </p>
        </div>
        
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="animate-slide-up" style={{ animationDelay: '0ms' }}>
              <StatsCard
                title="Total de Tarefas"
                value={stats.total}
                icon="📋"
                gradient="from-blue-500 to-blue-600"
                description="Total cadastrado"
              />
            </div>
            <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
              <StatsCard
                title="Concluídas"
                value={stats.completed}
                icon="✅"
                gradient="from-green-500 to-emerald-600"
                description="Finalizadas com sucesso"
              />
            </div>
            <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
              <StatsCard
                title="Pendentes"
                value={stats.pending}
                icon="⏳"
                gradient="from-yellow-500 to-orange-500"
                description="Aguardando execução"
              />
            </div>
            <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
              <StatsCard
                title="Vencidas"
                value={stats.overdue}
                icon="🚨"
                gradient="from-red-500 to-pink-600"
                description="Precisam de atenção"
              />
            </div>
          </div>
        )}

        {stats && stats.total > 0 && (
          <div className="card-modern p-8 mb-8 animate-slide-up" style={{ animationDelay: '400ms' }}>
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-3">
              <span className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white text-sm">
                📊
              </span>
              <span>Análise de Progresso</span>
            </h3>
            
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-gray-700">Taxa de Conclusão</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {Math.round((stats.completed / stats.total) * 100)}%
                </span>
              </div>
              
              <div className="relative">
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div 
                    className="h-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                    style={{ width: `${(stats.completed / stats.total) * 100}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                  <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                  <div className="text-sm text-blue-500 font-medium">Total</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                  <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                  <div className="text-sm text-green-500 font-medium">Concluídas</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
                  <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
                  <div className="text-sm text-orange-500 font-medium">Pendentes</div>
                </div>
              </div>
              
              {stats.overdue > 0 && (
                <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-lg">⚠️</span>
                    </div>
                    <div>
                      <p className="text-red-800 font-semibold">
                        Atenção! Você tem {stats.overdue} tarefa{stats.overdue > 1 ? 's' : ''} vencida{stats.overdue > 1 ? 's' : ''}
                      </p>
                      <p className="text-red-600 text-sm">
                        Revise as tarefas em atraso para manter sua produtividade
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {overdueTasks.length > 0 && (
          <div className="animate-slide-up" style={{ animationDelay: '500ms' }}>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg">🚨</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Tarefas Vencidas ({overdueTasks.length})
                </h3>
                <p className="text-gray-600">Priorize essas tarefas para colocar tudo em dia</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {overdueTasks.map((task, index) => (
                <div 
                  key={task.id} 
                  className="animate-slide-up"
                  style={{ animationDelay: `${600 + index * 100}ms` }}
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
    </div>
  );
}
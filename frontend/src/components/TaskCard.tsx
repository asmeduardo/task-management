import { Task } from '../types/Task';

interface TaskCardProps {
  task: Task;
  onToggle: (id: number) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
}

export default function TaskCard({ task, onToggle, onEdit, onDelete }: TaskCardProps) {
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  };

  const isOverdue = task.dueDate && !task.completed && 
    new Date(task.dueDate).getTime() < new Date().getTime();
  
  const isDueToday = task.dueDate && !task.completed && (() => {
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    return dueDate.toDateString() === today.toDateString() && dueDate.getTime() > today.getTime();
  })();

  const isDueSoon = task.dueDate && !task.completed && (() => {
    const dueDate = new Date(task.dueDate);
    const now = new Date();
    const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    return dueDate.getTime() > now.getTime() && dueDate.getTime() <= twentyFourHoursFromNow.getTime();
  })();
  
  const priorityConfig = {
    baixa: { gradient: 'from-green-400 to-emerald-400', icon: '🟢' },
    media: { gradient: 'from-yellow-400 to-orange-400', icon: '🟡' },
    alta: { gradient: 'from-red-500 to-pink-500', icon: '🔴' }
  };

  return (
    <div className={`card-modern p-6 hover:scale-[1.02] transition-all duration-300 border-l-4 ${
      task.completed 
        ? 'border-l-green-500 opacity-75' 
        : isOverdue 
        ? 'border-l-red-500' 
        : isDueSoon
        ? 'border-l-yellow-500'
        : 'border-l-blue-500'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-3">
          {/* Header da tarefa */}
          <div className="flex items-start space-x-3">
            <button
              onClick={() => onToggle(task.id)}
              className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                task.completed
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 border-green-500'
                  : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
              }`}
            >
              {task.completed && <span className="text-white text-xs">✓</span>}
            </button>
            
            <div className="flex-1">
              <h3 className={`text-lg font-semibold transition-all duration-200 ${
                task.completed ? 'line-through text-gray-500' : 'text-gray-900'
              }`}>
                {task.title}
              </h3>
              
              <div className="flex items-center space-x-2 mt-2">
                <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${priorityConfig[task.priority].gradient}`}>
                  <span>{priorityConfig[task.priority].icon}</span>
                  <span className="capitalize">{task.priority}</span>
                </span>
                
                {task.category && (
                  <span className="px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border border-blue-200">
                    {task.category}
                  </span>
                )}
                
                {isOverdue && (
                  <span className="px-3 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white animate-pulse">
                    🚨 Vencida
                  </span>
                )}
                
                {isDueToday && (
                  <span className="px-3 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white">
                    📅 Vence hoje
                  </span>
                )}
                
                {isDueSoon && !isDueToday && (
                  <span className="px-3 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                    ⏰ Vence em breve
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Descrição */}
          {task.description && (
            <p className={`text-sm leading-relaxed ${
              task.completed ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {task.description}
            </p>
          )}
          
          {/* Datas */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <span>📅</span>
              <span>Criada: {formatDateTime(task.createdAt)}</span>
            </div>
            {task.dueDate && (
              <div className={`flex items-center space-x-1 ${
                isOverdue 
                  ? 'text-red-600 font-medium' 
                  : isDueSoon 
                  ? 'text-orange-600 font-medium'
                  : ''
              }`}>
                <span>{isOverdue ? '⚠️' : isDueSoon ? '⏰' : '🎯'}</span>
                <span>
                  {isOverdue ? 'Venceu' : 'Vence'}: {formatDateTime(task.dueDate)}
                </span>
              </div>
            )}
          </div>
        </div>
        
        {/* Botões de ação */}
        <div className="flex flex-col space-y-2 ml-6">
          <button
            onClick={() => onToggle(task.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              task.completed
                ? 'bg-gradient-to-r from-gray-500 to-gray-600 text-white hover:from-gray-600 hover:to-gray-700'
                : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600'
            } transform hover:scale-105 shadow-md hover:shadow-lg`}
          >
            {task.completed ? '↩️ Reabrir' : '✅ Concluir'}
          </button>
          
          <button
            onClick={() => onEdit(task)}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            ✏️ Editar
          </button>
          
          <button
            onClick={() => onDelete(task.id)}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            🗑️ Excluir
          </button>
        </div>
      </div>
    </div>
  );
}
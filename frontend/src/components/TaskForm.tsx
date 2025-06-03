import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { CreateTaskData, Task } from '../types/Task';

interface TaskFormData {
  title: string;
  description?: string;
  priority?: 'baixa' | 'media' | 'alta';
  category?: string;
  dueDate?: string;
}

interface TaskFormProps {
  task?: Task;
  categories: string[];
  onSubmit: (data: CreateTaskData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const formatDateTimeLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const parseLocalDateTime = (localDateTime: string): string => {
  const date = new Date(localDateTime);
  return date.toISOString();
};

const getMinDateTime = (): string => {
  const now = new Date();
  return formatDateTimeLocal(now);
};

export default function TaskForm({
  task,
  categories,
  onSubmit,
  onCancel,
  isSubmitting = false
}: TaskFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm<TaskFormData>();

  const watchedPriority = watch('priority');

  useEffect(() => {
    if (task) {
      const formData: TaskFormData = {
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        category: task.category || '',
        dueDate: task.dueDate ? formatDateTimeLocal(new Date(task.dueDate)) : '',
      };
      reset(formData);
    }
  }, [task, reset]);

  const onFormSubmit = (data: TaskFormData) => {
    if (!data.priority) {
      return;
    }

    const submitData: CreateTaskData = {
      title: data.title,
      priority: data.priority,
      description: data.description || undefined,
      category: data.category || undefined,
      dueDate: data.dueDate ? parseLocalDateTime(data.dueDate) : undefined,
    };

    onSubmit(submitData);
  };

  const priorityConfig = {
    baixa: { color: 'from-green-400 to-emerald-400', icon: '🟢' },
    media: { color: 'from-yellow-400 to-orange-400', icon: '🟡' },
    alta: { color: 'from-red-500 to-pink-500', icon: '🔴' }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <span className="text-white text-2xl">{task ? '✏️' : '➕'}</span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">
              {task ? 'Editar Tarefa' : 'Nova Tarefa'}
            </h3>
            <p className="text-blue-100">
              {task ? 'Atualize as informações da tarefa' : 'Preencha os detalhes da nova tarefa'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)} className="p-8 space-y-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3">
            📝 Título da Tarefa *
          </label>
          <input
            {...register('title', {
              required: 'Título é obrigatório',
              minLength: { value: 3, message: 'Título deve ter pelo menos 3 caracteres' },
              maxLength: { value: 255, message: 'Título não pode ter mais de 255 caracteres' }
            })}
            type="text"
            className={`input-modern ${errors.title ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : ''}`}
            placeholder="Ex: Finalizar relatório mensal"
          />
          {errors.title && (
            <div className="mt-2 flex items-center space-x-2 text-red-600">
              <span>❌</span>
              <p className="text-sm">{errors.title.message}</p>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3">
            📄 Descrição
          </label>
          <textarea
            {...register('description', {
              maxLength: { value: 1000, message: 'Descrição não pode ter mais de 1000 caracteres' }
            })}
            rows={4}
            className={`input-modern resize-none ${errors.description ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : ''}`}
            placeholder="Descreva os detalhes da tarefa (opcional)..."
          />
          {errors.description && (
            <div className="mt-2 flex items-center space-x-2 text-red-600">
              <span>❌</span>
              <p className="text-sm">{errors.description.message}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              🎯 Prioridade *
            </label>
            <div className="space-y-3">
              {['alta', 'media', 'baixa'].map((priority) => (
                <label key={priority} className="relative block">
                  <input
                    {...register('priority', { required: 'Selecione uma prioridade' })}
                    type="radio"
                    value={priority}
                    className="sr-only"
                  />
                  <div className={`cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 ${watchedPriority === priority
                      ? `border-transparent bg-gradient-to-r ${priorityConfig[priority as keyof typeof priorityConfig].color} text-white`
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                    }`}>
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">
                        {priorityConfig[priority as keyof typeof priorityConfig].icon}
                      </span>
                      <span className="font-semibold capitalize">{priority}</span>
                    </div>
                  </div>
                </label>
              ))}
            </div>
            {errors.priority && (
              <div className="mt-2 flex items-center space-x-2 text-red-600">
                <span>❌</span>
                <p className="text-sm">{errors.priority.message}</p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                🏷️ Categoria
              </label>
              <input
                {...register('category')}
                list="categories"
                className="input-modern"
                placeholder="Digite ou selecione uma categoria"
              />
              <datalist id="categories">
                {categories.map((category) => (
                  <option key={category} value={category} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                📅 Data e Hora de Vencimento
              </label>
              <input
                {...register('dueDate')}
                type="datetime-local"
                min={getMinDateTime()}
                className="input-modern"
              />
              <p className="text-xs text-gray-500 mt-2">
                💡 Selecione data e hora no seu fuso horário local
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-8 border-t border-gray-100">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="btn-secondary flex items-center justify-center space-x-2"
          >
            <span>❌</span>
            <span>Cancelar</span>
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`btn-primary flex items-center justify-center space-x-2 ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
              }`}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Salvando...</span>
              </>
            ) : (
              <>
                <span>{task ? '💾' : '➕'}</span>
                <span>{task ? 'Atualizar Tarefa' : 'Criar Tarefa'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
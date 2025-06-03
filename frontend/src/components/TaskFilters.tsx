import { useForm } from 'react-hook-form';
import { TaskFilters } from '../types/Task';

interface TaskFiltersFormData {
  search?: string;
  completed?: string;
  priority?: string;
  category?: string;
}

interface TaskFiltersProps {
  onFilter: (filters: TaskFilters) => void;
  categories: string[];
}

export default function TaskFiltersComponent({ onFilter, categories }: TaskFiltersProps) {
  const { register, handleSubmit, reset, watch } = useForm<TaskFiltersFormData>();
  const watchedValues = watch();

  const onSubmit = (data: TaskFiltersFormData) => {
    const filters: TaskFilters = {};
    
    if (data.completed && data.completed !== '') {
      filters.completed = data.completed === 'true';
    }
    if (data.priority && data.priority !== '') {
      filters.priority = data.priority;
    }
    if (data.category && data.category !== '') {
      filters.category = data.category;
    }
    if (data.search && data.search.trim() !== '') {
      filters.search = data.search.trim();
    }
    
    onFilter(filters);
  };

  const handleClear = () => {
    reset();
    onFilter({});
  };

  const hasActiveFilters = Object.values(watchedValues).some(value => value && value !== '');

  return (
    <div className="card-modern p-6 animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
            <span className="text-white text-lg">🔍</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Filtros Avançados</h3>
            <p className="text-sm text-gray-500">Encontre exatamente o que você procura</p>
          </div>
        </div>
        
        {hasActiveFilters && (
          <div className="px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 rounded-full text-xs font-semibold border border-blue-200">
            Filtros ativos
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              🔍 Buscar
            </label>
            <div className="relative">
              <input
                {...register('search')}
                type="text"
                placeholder="Título ou descrição..."
                className="input-modern pl-10"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-400 text-lg">🔍</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              📊 Status
            </label>
            <select
              {...register('completed')}
              className="input-modern appearance-none cursor-pointer"
            >
              <option value="">📋 Todos os status</option>
              <option value="false">⏳ Pendentes</option>
              <option value="true">✅ Concluídas</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              🎯 Prioridade
            </label>
            <select
              {...register('priority')}
              className="input-modern appearance-none cursor-pointer"
            >
              <option value="">🎯 Todas as prioridades</option>
              <option value="baixa">🟢 Baixa</option>
              <option value="media">🟡 Média</option>
              <option value="alta">🔴 Alta</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              🏷️ Categoria
            </label>
            <select
              {...register('category')}
              className="input-modern appearance-none cursor-pointer"
            >
              <option value="">🏷️ Todas as categorias</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4 border-t border-gray-100">
          <button
            type="submit"
            className="btn-primary flex items-center justify-center space-x-2"
          >
            <span>🔍</span>
            <span>Aplicar Filtros</span>
          </button>
          
          <button
            type="button"
            onClick={handleClear}
            className="btn-secondary flex items-center justify-center space-x-2"
          >
            <span>🗑️</span>
            <span>Limpar Filtros</span>
          </button>
        </div>
      </form>
    </div>
  );
}
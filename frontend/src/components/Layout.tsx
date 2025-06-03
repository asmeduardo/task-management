import { type ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
  activeTab?: 'tasks' | 'dashboard';
  onTabChange?: (tab: 'tasks' | 'dashboard') => void;
  onCreateTask?: () => void;
}

export default function Layout({ children, activeTab, onTabChange, onCreateTask }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <header className="bg-white/80 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-6 space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Task Manager
                </h1>
                <p className="text-sm text-gray-500 hidden sm:block">
                  Organize suas tarefas de forma inteligente
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
              {activeTab && onTabChange && (
                <nav className="flex bg-white/50 backdrop-blur-sm rounded-xl p-1 border border-white/20">
                  <button
                    onClick={() => onTabChange('dashboard')}
                    className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      activeTab === 'dashboard'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                    }`}
                  >
                    📊 Dashboard
                  </button>
                  <button
                    onClick={() => onTabChange('tasks')}
                    className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      activeTab === 'tasks'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                    }`}
                  >
                    📝 Tarefas
                  </button>
                </nav>
              )}
              
              {onCreateTask && (
                <button
                  onClick={onCreateTask}
                  className="btn-primary group relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center space-x-2">
                    <span className="text-lg">+</span>
                    <span>Nova Tarefa</span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}
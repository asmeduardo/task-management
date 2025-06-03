interface NavigationProps {
  activeTab: 'tasks' | 'dashboard';
  onTabChange: (tab: 'tasks' | 'dashboard') => void;
}

export default function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <nav className="flex space-x-8">
      <button
        onClick={() => onTabChange('dashboard')}
        className={`px-3 py-2 text-sm font-medium transition-colors ${
          activeTab === 'dashboard'
            ? 'text-blue-600 border-b-2 border-blue-600'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        Dashboard
      </button>
      <button
        onClick={() => onTabChange('tasks')}
        className={`px-3 py-2 text-sm font-medium transition-colors ${
          activeTab === 'tasks'
            ? 'text-blue-600 border-b-2 border-blue-600'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        Tarefas
      </button>
    </nav>
  );
}
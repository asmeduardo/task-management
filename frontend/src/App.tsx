import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthPage from './pages/AuthPage';
import Layout from './components/Layout';
import TaskList from './components/TaskList';
import Dashboard from './components/Dashboard';
import TaskForm from './components/TaskForm';
import Modal from './components/ui/Modal';
import Toast from './components/ui/Toast';
import Loading from './components/ui/Loading';
import { Task, CreateTaskData } from './types/Task';
import { taskService } from './services/taskService';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useToast } from './hooks/useToast';

function AppContent() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [activeTab, setActiveTab] = useLocalStorage<'tasks' | 'dashboard'>('activeTab', 'dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [categories, setCategories] = useState<string[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toasts, removeToast, success, error } = useToast();

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
    if (isAuthenticated) {
      loadCategories();
    }
  }, [isAuthenticated]);

  const handleCreateTask = () => {
    setEditingTask(undefined);
    setIsModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(undefined);
  };

  const handleSubmitTask = async (data: CreateTaskData) => {
    try {
      setIsSubmitting(true);

      if (editingTask) {
        const response = await taskService.updateTask(editingTask.id, data);
        if (!response.success) {
          error(response.errors?.map(e => e.message).join(', ') || 'Erro ao atualizar tarefa');
          return;
        }
        success('Tarefa atualizada com sucesso!');
      } else {
        const response = await taskService.createTask(data);
        if (!response.success) {
          error(response.errors?.map(e => e.message).join(', ') || 'Erro ao criar tarefa');
          return;
        }
        success('Tarefa criada com sucesso!');
      }

      setRefreshTrigger(prev => prev + 1);
      loadCategories();
      handleCloseModal();
    } catch (err) {
      error('Erro ao salvar tarefa');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <>
      <Layout 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        onCreateTask={handleCreateTask}
        user={user}
      >
        {activeTab === 'dashboard' && (
          <Dashboard 
            onEditTask={handleEditTask}
            refreshTrigger={refreshTrigger}
          />
        )}

        {activeTab === 'tasks' && (
          <TaskList 
            onEditTask={handleEditTask}
            refreshTrigger={refreshTrigger}
          />
        )}

        <Modal isOpen={isModalOpen} onClose={handleCloseModal} size="lg">
          <TaskForm
            task={editingTask}
            categories={categories}
            onSubmit={handleSubmitTask}
            onCancel={handleCloseModal}
            isSubmitting={isSubmitting}
          />
        </Modal>
      </Layout>

      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
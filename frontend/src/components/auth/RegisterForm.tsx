import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { RegisterData } from '../../types/Auth';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export default function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const [error, setError] = useState<string>('');
  const { register: registerUser, isLoading } = useAuth();
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<RegisterData>();

  const password = watch('password');

  const onSubmit = async (data: RegisterData) => {
    try {
      setError('');
      await registerUser(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao registrar');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-md w-full">
      <div className="bg-gradient-to-r from-green-600 to-blue-600 px-8 py-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-3xl">👤</span>
          </div>
          <h2 className="text-2xl font-bold text-white">Registrar</h2>
          <p className="text-green-100">Crie sua conta</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center space-x-2">
              <span className="text-red-500">❌</span>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            👤 Nome
          </label>
          <input
            {...register('name', {
              required: 'Nome é obrigatório',
              minLength: {
                value: 2,
                message: 'Nome deve ter pelo menos 2 caracteres'
              }
            })}
            type="text"
            className={`input-modern ${errors.name ? 'border-red-500' : ''}`}
            placeholder="Seu nome completo"
          />
          {errors.name && (
            <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            📧 Email
          </label>
          <input
            {...register('email', {
              required: 'Email é obrigatório',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Email inválido'
              }
            })}
            type="email"
            className={`input-modern ${errors.email ? 'border-red-500' : ''}`}
            placeholder="seu@email.com"
          />
          {errors.email && (
            <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            🔒 Senha
          </label>
          <input
            {...register('password', {
              required: 'Senha é obrigatória',
              minLength: {
                value: 6,
                message: 'Senha deve ter pelo menos 6 caracteres'
              }
            })}
            type="password"
            className={`input-modern ${errors.password ? 'border-red-500' : ''}`}
            placeholder="Escolha uma senha"
          />
          {errors.password && (
            <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            🔒 Confirmar Senha
          </label>
          <input
            {...register('confirmPassword', {
              required: 'Confirmação de senha é obrigatória',
              validate: value =>
                value === password || 'As senhas não coincidem'
            })}
            type="password"
            className={`input-modern ${errors.confirmPassword ? 'border-red-500' : ''}`}
            placeholder="Confirme sua senha"
          />
          {errors.confirmPassword && (
            <p className="text-red-600 text-sm mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`btn-primary w-full ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Registrando...</span>
            </div>
          ) : (
            <span>✨ Criar Conta</span>
          )}
        </button>

        <div className="text-center pt-4 border-t border-gray-100">
          <p className="text-gray-600 text-sm">
            Já tem uma conta?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Entre aqui
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}
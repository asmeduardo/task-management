import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type, onClose, duration = 4000 }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const typeConfig = {
    success: {
      gradient: 'from-green-500 to-emerald-500',
      icon: '✅',
      bg: 'from-green-50 to-emerald-50',
      border: 'border-green-200'
    },
    error: {
      gradient: 'from-red-500 to-pink-500',
      icon: '❌',
      bg: 'from-red-50 to-pink-50',
      border: 'border-red-200'
    },
    info: {
      gradient: 'from-blue-500 to-purple-500',
      icon: 'ℹ️',
      bg: 'from-blue-50 to-purple-50',
      border: 'border-blue-200'
    }
  };

  const config = typeConfig[type];

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className={`card-modern border ${config.border} bg-gradient-to-r ${config.bg} p-4 max-w-sm`}>
        <div className="flex items-start space-x-3">
          <div className={`w-8 h-8 bg-gradient-to-r ${config.gradient} rounded-lg flex items-center justify-center flex-shrink-0`}>
            <span className="text-white text-sm">{config.icon}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 leading-relaxed">{message}</p>
          </div>
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}